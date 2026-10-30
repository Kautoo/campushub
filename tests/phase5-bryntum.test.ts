import assert from "node:assert/strict";
import {
  campusEventToBryntum,
  bryntumToCampusEvent,
  parseEventDateTime,
  MALAYSIA_TIMEZONE,
  MALAYSIA_UTC_OFFSET_HOURS,
  CATEGORY_COLORS,
} from "@/lib/calendar/event-adapter";
import {
  checkScheduleConflict,
  isVirtualLocation,
} from "@/lib/calendar/conflict-detector";
import {
  createEvent,
  updateEvent,
  getEvents,
  validateEventSchedule,
  store,
} from "@/server/db/repository";
import { POST as postEventRoute, GET as getEventsRoute } from "@/app/api/events/route";
import { PATCH as patchEventRoute } from "@/app/api/events/[id]/route";
import { CampusEvent } from "@/data/mockEvents";

async function runPhase5Tests() {
  console.log("=================================================");
  console.log("   CampusHub Phase 5 Bryntum Verification Suite  ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
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
  // Milestone C: Event Adapter & Malaysia Timezone Normalization
  // ---------------------------------------------------------------------------
  await test("1. Timezone: Converts Malaysian local times to ISO 8601 with +08:00 offset", () => {
    assert.equal(MALAYSIA_TIMEZONE, "Asia/Kuala_Lumpur");
    assert.equal(MALAYSIA_UTC_OFFSET_HOURS, 8);

    const { isoStart, isoEnd } = parseEventDateTime("2025-11-14", "17:00", "20:00");
    assert.ok(isoStart.includes("+08:00"), `Expected +08:00 offset in start: ${isoStart}`);
    assert.ok(isoEnd.includes("+08:00"), `Expected +08:00 offset in end: ${isoEnd}`);
    assert.equal(isoStart, "2025-11-14T17:00:00+08:00");
    assert.equal(isoEnd, "2025-11-14T20:00:00+08:00");
  });

  await test("2. Timezone: Midnight-crossing event handles date boundary correctly", () => {
    // 23:00 to 02:00 crosses into next day
    const { isoStart, isoEnd } = parseEventDateTime("2025-11-14", "23:00", "02:00");
    assert.equal(isoStart, "2025-11-14T23:00:00+08:00");
    assert.equal(isoEnd, "2025-11-15T02:00:00+08:00");
  });

  await test("3. Adapter: Converts legacy mock text dates to Bryntum EventModel", () => {
    const mockEvent: CampusEvent = {
      id: "neon_fun_run_5k",
      title: "Neon 5K Campus Fun Run & Night Lights",
      subtitle: "Illuminated loop",
      description: "Dusk run through Main Quad.",
      category: "Athletics & Fun Runs",
      date: "Saturday, Nov 8, 2025",
      month: "NOV",
      dayNumber: 8,
      dayOfWeek: "SAT",
      fullDayName: "Saturday",
      time: "6:30 PM PST",
      location: "Main Quad Archway",
      venueHref: "/map",
      organizer: "Stanford Running Club",
      isFree: false,
      totalCapacity: 1200,
      registeredCount: 1016,
      image: "https://example.com/neon.jpg",
      plans: [],
      status: "PUBLISHED",
    };

    const model = campusEventToBryntum(mockEvent);
    assert.equal(model.id, "neon_fun_run_5k");
    assert.equal(model.name, "Neon 5K Campus Fun Run & Night Lights");
    assert.equal(model.category, "Athletics & Fun Runs");
    assert.equal(model.eventColor, CATEGORY_COLORS["Athletics & Fun Runs"]);
    assert.ok(model.startDate.startsWith("2025-11-08T18:30:00+08:00"));
  });

  await test("4. Adapter: Deserializes Bryntum drag-drop updates without timezone drift", () => {
    const originalEvent: CampusEvent = {
      id: "test_drag_event",
      title: "Drone Workshop",
      subtitle: "",
      description: "Workshop",
      category: "Tech & AI",
      date: "2025-11-14",
      month: "NOV",
      dayNumber: 14,
      dayOfWeek: "FRI",
      fullDayName: "Friday",
      time: "17:00",
      location: "Huang Hall",
      venueHref: "/map",
      organizer: "Engineering Society",
      isFree: true,
      totalCapacity: 100,
      registeredCount: 10,
      image: "",
      plans: [],
    };

    // Dragged to Nov 18 at 14:30 MYT (+08:00)
    const updatedModel = {
      id: "test_drag_event",
      startDate: "2025-11-18T14:30:00+08:00",
      endDate: "2025-11-18T16:30:00+08:00",
      location: "Tressider Union",
    };

    const deserialized = bryntumToCampusEvent(updatedModel, originalEvent);
    assert.equal(deserialized.date, "2025-11-18");
    assert.equal(deserialized.time, "14:30");
    assert.equal(deserialized.location, "Tressider Union");
    assert.equal(deserialized.dayNumber, 18);
    assert.equal(deserialized.dayOfWeek, "TUE");
  });

  // ---------------------------------------------------------------------------
  // Milestone E: Conflict Detection Engine Tests
  // ---------------------------------------------------------------------------
  await test("5. Conflict: Rejects overlapping events at the exact same physical venue", () => {
    const existing: CampusEvent[] = [
      {
        id: "event_a",
        title: "AI Keynote",
        subtitle: "",
        description: "Keynote",
        category: "Tech & AI",
        date: "2025-11-20",
        month: "NOV",
        dayNumber: 20,
        dayOfWeek: "THU",
        fullDayName: "Thursday",
        time: "14:00",
        location: "Huang Amphitheater",
        venueHref: "/map",
        organizer: "AI Guild",
        isFree: true,
        totalCapacity: 200,
        registeredCount: 50,
        image: "",
        plans: [],
      },
    ];

    // Candidate at same location overlapping 15:00 to 17:00 (since default duration is 2 hours, 14:00-16:00)
    const result = checkScheduleConflict(existing, {
      title: "Robotics Showcase",
      location: "Huang Amphitheater",
      date: "2025-11-20",
      time: "15:00",
    });

    assert.equal(result.hasConflict, true);
    assert.equal(result.conflictType, "VENUE_COLLISION");
    assert.ok(result.reason?.includes("Huang Amphitheater"));
  });

  await test("6. Conflict: Allows simultaneous events at different venues", () => {
    const existing: CampusEvent[] = [
      {
        id: "event_a",
        title: "AI Keynote",
        subtitle: "",
        description: "Keynote",
        category: "Tech & AI",
        date: "2025-11-20",
        month: "NOV",
        dayNumber: 20,
        dayOfWeek: "THU",
        fullDayName: "Thursday",
        time: "14:00",
        location: "Huang Amphitheater",
        venueHref: "/map",
        organizer: "AI Guild",
        organizationId: "org_engineering",
        isFree: true,
        totalCapacity: 200,
        registeredCount: 50,
        image: "",
        plans: [],
      },
    ];

    const result = checkScheduleConflict(existing, {
      title: "Art Gallery Opening",
      location: "d.school Studio 200",
      date: "2025-11-20",
      time: "14:00",
      organizationId: "org_arts",
    });

    assert.equal(result.hasConflict, false);
  });

  await test("7. Conflict: Virtual/online events do not trigger venue collisions", () => {
    assert.equal(isVirtualLocation("Zoom Webinar"), true);
    assert.equal(isVirtualLocation("Discord Live"), true);
    assert.equal(isVirtualLocation("Online Stream"), true);
    assert.equal(isVirtualLocation("Huang Amphitheater"), false);

    const existing: CampusEvent[] = [
      {
        id: "event_online",
        title: "Remote Open Source Sync",
        subtitle: "",
        description: "Sync",
        category: "Tech & Hackathons",
        date: "2025-11-20",
        month: "NOV",
        dayNumber: 20,
        dayOfWeek: "THU",
        fullDayName: "Thursday",
        time: "14:00",
        location: "Zoom Virtual Room #4",
        venueHref: "/map",
        organizer: "Dev Club",
        isFree: true,
        totalCapacity: 500,
        registeredCount: 100,
        image: "",
        plans: [],
      },
    ];

    const result = checkScheduleConflict(existing, {
      title: "Another Online Webinar",
      location: "Zoom Virtual Room #4",
      date: "2025-11-20",
      time: "14:00",
      organizationId: "org_different",
    });

    assert.equal(result.hasConflict, false);
  });

  await test("8. Conflict: Rejects invalid time range where end time is before start time", () => {
    const result = checkScheduleConflict([], {
      title: "Time Travel Workshop",
      startDate: "2025-11-20T16:00:00+08:00",
      endDate: "2025-11-20T14:00:00+08:00", // invalid
    });

    assert.equal(result.hasConflict, true);
    assert.equal(result.conflictType, "INVALID_TIME_RANGE");
  });

  // ---------------------------------------------------------------------------
  // Milestone E & D: Repository & API Route Verification
  // ---------------------------------------------------------------------------
  let seededEventId = "";

  await test("9. Repository: Creates event with conflict protection", async () => {
    const ev = await createEvent({
      title: "Autonomous Drone Expo 2025",
      category: "Tech & AI",
      status: "PUBLISHED",
      date: "2025-11-25",
      time: "10:00",
      location: "Robotics Arena B",
      totalCapacity: 150,
      description: "Live autonomous drone flight demos.",
      organizationId: "org_engineering",
    }, {
      id: "usr_organizer_sarah",
      name: "Sarah Chen",
      role: "organizer",
      studentId: "#ORG-55102",
      email: "schen@stanford.edu",
      organizationId: "org_engineering",
    });

    assert.ok(ev.id);
    seededEventId = ev.id;
  });

  await test("10. API: POST /api/events with venue conflict returns 409 Conflict", async () => {
    // Attempting to reserve Robotics Arena B at overlapping time
    const req = new Request("http://localhost:3000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-campushub-token": "token_organizer_marcus",
      },
      body: JSON.stringify({
        title: "Conflicting Drone Session",
        category: "Tech & AI",
        date: "2025-11-25",
        time: "10:30",
        location: "Robotics Arena B",
        description: "Conflicting session during Sarah's event.",
      }),
    });

    const res = await postEventRoute(req);
    assert.equal(res.status, 409, `Expected HTTP 409 Conflict, received ${res.status}`);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, "SCHEDULE_CONFLICT");
    assert.ok(json.error.message.includes("Robotics Arena B"));
  });

  await test("11. API: PATCH /api/events/[id] with venue conflict returns 409 Conflict", async () => {
    // Marcus creates an event at a different location
    const marcusEvent = await createEvent({
      title: "Digital Art Exhibition",
      category: "Workshops & Design",
      status: "PUBLISHED",
      date: "2025-11-25",
      time: "16:00",
      location: "Arts Studio Gallery",
      totalCapacity: 80,
      description: "Showcasing student generative art.",
      organizationId: "org_arts",
    }, {
      id: "usr_organizer_marcus",
      name: "Marcus Vance",
      role: "organizer",
      studentId: "#ORG-77201",
      email: "mvance@stanford.edu",
      organizationId: "org_arts",
    });

    // Marcus attempts to reschedule to Robotics Arena B during Sarah's event (10:00)
    const req = new Request(`http://localhost:3000/api/events/${marcusEvent.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-campushub-token": "token_organizer_marcus",
      },
      body: JSON.stringify({
        date: "2025-11-25",
        time: "10:30",
        location: "Robotics Arena B",
      }),
    });

    const res = await patchEventRoute(req, { params: Promise.resolve({ id: marcusEvent.id }) });
    assert.equal(res.status, 409, `Expected 409 Conflict, received ${res.status}`);
    const json = await res.json();
    assert.equal(json.error.code, "SCHEDULE_CONFLICT");
  });

  await test("12. Authorization: Student cannot reschedule organizer events via PATCH", async () => {
    const req = new Request(`http://localhost:3000/api/events/${seededEventId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-campushub-token": "token_student_alex",
      },
      body: JSON.stringify({
        time: "18:00",
      }),
    });

    const res = await patchEventRoute(req, { params: Promise.resolve({ id: seededEventId }) });
    assert.equal(res.status, 403, `Expected 403 Forbidden for student PATCH, received ${res.status}`);
  });

  await test("13. Authorization: Cross-tenant reschedule rejected with 403 Forbidden", async () => {
    // Marcus attempts to reschedule Sarah's event
    const req = new Request(`http://localhost:3000/api/events/${seededEventId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-campushub-token": "token_organizer_marcus",
      },
      body: JSON.stringify({
        time: "18:00",
      }),
    });

    const res = await patchEventRoute(req, { params: Promise.resolve({ id: seededEventId }) });
    assert.equal(res.status, 403, `Expected 403 Forbidden for cross-tenant edit, received ${res.status}`);
  });

  await test("14. Student Calendar: GET /api/events?status=PUBLISHED excludes drafts", async () => {
    // Create draft event
    await createEvent({
      title: "Secret Staff Meeting",
      category: "General",
      status: "DRAFT",
      date: "2025-11-28",
      time: "09:00",
      location: "Dean Office",
      totalCapacity: 10,
      description: "Private internal planning.",
      organizationId: "org_engineering",
    }, {
      id: "usr_organizer_sarah",
      name: "Sarah Chen",
      role: "organizer",
      studentId: "#ORG-55102",
      email: "schen@stanford.edu",
      organizationId: "org_engineering",
    });

    // Public / student request
    const req = new Request("http://localhost:3000/api/events?status=PUBLISHED");
    const res = await getEventsRoute(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);

    const hasDraft = json.data.some((e: CampusEvent) => e.status === "DRAFT");
    assert.equal(hasDraft, false, "Draft events must not be exposed to students");
  });

  console.log("\n=================================================");
  console.log(`Phase 5 Bryntum Tests: ${passed} passed, ${failed} failed`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
