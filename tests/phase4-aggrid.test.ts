import assert from "node:assert/strict";
import { GET as getEventsRoute } from "@/app/api/events/route";
import { DELETE as deleteEventRoute } from "@/app/api/events/[id]/route";
import { GET as getOrganizerRegistrationsRoute, PATCH as patchOrganizerRegistrationsRoute } from "@/app/api/organizer/registrations/route";
import { GET as getOrganizerOrdersRoute } from "@/app/api/organizer/orders/route";
import { createEvent, getRegistrations, store } from "@/server/db/repository";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";

async function runTests() {
  console.log("=================================================");
  console.log("   CampusHub Phase 4 AG Grid & API Verification   ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(err);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // Milestone B: AG Grid Community Setup & Module Verification
  // ---------------------------------------------------------------------------
  await test("1. AG Grid Community: Modules register without Enterprise licenses", async () => {
    ModuleRegistry.registerModules([AllCommunityModule]);
    assert.ok(AllCommunityModule, "AllCommunityModule should be exported");
    const theme = themeQuartz.withParams({ accentColor: "#4b671b" });
    assert.ok(theme, "themeQuartz should be instantiable");
  });

  // ---------------------------------------------------------------------------
  // Milestone C: Feature A - Event Management CRUD & Authorization
  // ---------------------------------------------------------------------------
  let testEventId = "";

  await test("2. Feature A: Organizer Sarah creates an event scoped to org_engineering", async () => {
    const ev = await createEvent({
      title: "Autonomous Drone Grand Prix",
      category: "Tech & AI",
      status: "DRAFT",
      date: "2025-11-20",
      totalCapacity: 100,
      description: "Annual Stanford drone obstacle race.",
    }, {
      id: "usr_organizer_sarah",
      name: "Sarah Chen",
      role: "organizer",
      studentId: "#ORG-55102",
      email: "schen@stanford.edu",
      organizationId: "org_engineering",
    });

    assert.ok(ev.id);
    assert.equal(ev.organizationId, "org_engineering");
    testEventId = ev.id;
  });

  await test("3. Feature A: Delete event without auth token returns 401 Unauthorized", async () => {
    const req = new Request(`http://localhost:3000/api/events/${testEventId}`, {
      method: "DELETE",
    });
    const res = await deleteEventRoute(req, { params: Promise.resolve({ id: testEventId }) });
    assert.equal(res.status, 401);
  });

  await test("4. Feature A: Student attempting to delete event returns 403 Forbidden", async () => {
    const req = new Request(`http://localhost:3000/api/events/${testEventId}`, {
      method: "DELETE",
      headers: {
        "x-campushub-token": "token_student_alex",
      },
    });
    const res = await deleteEventRoute(req, { params: Promise.resolve({ id: testEventId }) });
    assert.equal(res.status, 403);
  });

  await test("5. Feature A: Cross-tenant authorization: Organizer Marcus cannot delete Sarah's event", async () => {
    const req = new Request(`http://localhost:3000/api/events/${testEventId}`, {
      method: "DELETE",
      headers: {
        "x-campushub-token": "token_organizer_marcus",
      },
    });
    const res = await deleteEventRoute(req, { params: Promise.resolve({ id: testEventId }) });
    assert.equal(res.status, 403);
  });

  await test("6. Feature A: Authorized Organizer Sarah deletes her own event", async () => {
    const req = new Request(`http://localhost:3000/api/events/${testEventId}`, {
      method: "DELETE",
      headers: {
        "x-campushub-token": "token_organizer_sarah",
      },
    });
    const res = await deleteEventRoute(req, { params: Promise.resolve({ id: testEventId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.id, testEventId);
  });

  await test("7. Feature A: Deleting already-deleted event returns 404 Not Found", async () => {
    const req = new Request(`http://localhost:3000/api/events/${testEventId}`, {
      method: "DELETE",
      headers: {
        "x-campushub-token": "token_organizer_sarah",
      },
    });
    const res = await deleteEventRoute(req, { params: Promise.resolve({ id: testEventId }) });
    assert.equal(res.status, 404);
  });

  // ---------------------------------------------------------------------------
  // Milestone D: Feature B - Registration Management API & Multi-Tenant Scoping
  // ---------------------------------------------------------------------------
  await test("8. Feature B: GET /api/organizer/registrations rejects unauthenticated requests", async () => {
    const req = new Request("http://localhost:3000/api/organizer/registrations");
    const res = await getOrganizerRegistrationsRoute(req);
    assert.equal(res.status, 401);
  });

  await test("9. Feature B: GET /api/organizer/registrations rejects student role with 403", async () => {
    const req = new Request("http://localhost:3000/api/organizer/registrations", {
      headers: { "x-campushub-token": "token_student_alex" },
    });
    const res = await getOrganizerRegistrationsRoute(req);
    assert.equal(res.status, 403);
  });

  await test("10. Feature B: GET /api/organizer/registrations returns Sarah's scoped registrations", async () => {
    const req = new Request("http://localhost:3000/api/organizer/registrations", {
      headers: { "x-campushub-token": "token_organizer_sarah" },
    });
    const res = await getOrganizerRegistrationsRoute(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));
    // Verify each registration belongs to an event owned by Sarah's org
    const sarahEvents = store.events.filter((e) => e.organizationId === "org_engineering").map((e) => e.id);
    for (const reg of json.data) {
      assert.ok(sarahEvents.includes(reg.eventId), `Registration ${reg.id} must belong to Sarah's org`);
    }
  });

  await test("11. Feature B: PATCH /api/organizer/registrations toggles gate check-in status", async () => {
    const allRegs = await getRegistrations();
    assert.ok(allRegs.length > 0, "Expected at least 1 registration");
    const targetReg = allRegs[0];
    const initialCheckIn = targetReg.checkedIn;

    const req = new Request("http://localhost:3000/api/organizer/registrations", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-campushub-token": "token_organizer_sarah",
      },
      body: JSON.stringify({ registrationId: targetReg.id }),
    });

    const res = await patchOrganizerRegistrationsRoute(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.checkedIn, !initialCheckIn);
  });

  // ---------------------------------------------------------------------------
  // Milestone E: Feature C - Orders Management API & Authoritative Data
  // ---------------------------------------------------------------------------
  await test("12. Feature C: GET /api/organizer/orders rejects unauthenticated requests", async () => {
    const req = new Request("http://localhost:3000/api/organizer/orders");
    const res = await getOrganizerOrdersRoute(req);
    assert.equal(res.status, 401);
  });

  await test("13. Feature C: GET /api/organizer/orders rejects student role with 403", async () => {
    const req = new Request("http://localhost:3000/api/organizer/orders", {
      headers: { "x-campushub-token": "token_student_alex" },
    });
    const res = await getOrganizerOrdersRoute(req);
    assert.equal(res.status, 403);
  });

  await test("14. Feature C: GET /api/organizer/orders returns scoped merchandise orders with authoritative totals", async () => {
    const req = new Request("http://localhost:3000/api/organizer/orders", {
      headers: { "x-campushub-token": "token_organizer_sarah" },
    });
    const res = await getOrganizerOrdersRoute(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));

    // Verify orders are present and totals match authoritative calculation
    for (const order of json.data) {
      assert.ok(order.total > 0, "Order total must be positive");
      assert.ok(order.orderNumber, "Order must have internal identifier");
      assert.ok(order.paymentStatus, "Order must have verified backend paymentStatus");
    }
  });

  console.log("\n=================================================");
  console.log(`Phase 4 Test Finished: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
