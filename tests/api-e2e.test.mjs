/**
 * HTTP E2E against a booted PRODUCTION standalone server on 127.0.0.1:3400.
 *
 * No Supabase/PayPal env is set in this environment, so this suite exercises
 * the honest-degradation contract: setup-notice pages render 200 and the APIs
 * return 503 — never a fabricated success, never a 500.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STANDALONE = path.join(ROOT, ".next", "standalone");
const PORT = 3400;
const BASE = `http://127.0.0.1:${PORT}`;

let server;

async function fetchPage(p) {
  const res = await fetch(`${BASE}${p}`, { redirect: "manual" });
  const body = await res.text();
  return { res, body };
}

before(async () => {
  // Boot with retries: the standalone dir may be mid-rebuild by a concurrent build.
  const deadline = Date.now() + 5 * 60 * 1000;
  let lastErr;
  while (Date.now() < deadline) {
    if (!existsSync(path.join(STANDALONE, "server.js"))) {
      lastErr = new Error(".next/standalone/server.js missing (build in flight?)");
      await new Promise((r) => setTimeout(r, 10_000));
      continue;
    }
    server = spawn(process.execPath, ["server.js"], {
      cwd: STANDALONE,
      env: { ...process.env, PORT: String(PORT), HOSTNAME: "127.0.0.1" },
      stdio: ["ignore", "ignore", "pipe"],
    });
    let bootOutput = "";
    server.stderr.on("data", (d) => (bootOutput += d));
    // Cold start can take ~1 min when a concurrent build is hammering the disk.
    const up = await waitReady(150_000);
    if (up) return;
    lastErr = new Error(`server did not become ready: ${bootOutput.slice(-500)}`);
    server.kill("SIGKILL");
    server = null;
    await new Promise((r) => setTimeout(r, 5_000));
  }
  throw lastErr ?? new Error("could not boot standalone server within 5 min");
});

async function waitReady(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (server?.exitCode !== null && server?.exitCode !== undefined) return false;
    try {
      const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
      if (res.status > 0) return true; // any HTTP response (even 503) = server is up
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

after(async () => {
  if (server) server.kill("SIGKILL");
});

// ---------- marketing + public pages ----------

test("GET / — landing renders 200 with the campaign headline", async () => {
  const { res, body } = await fetchPage("/");
  assert.equal(res.status, 200);
  assert.ok(body.includes("Run your campus empire"), "landing must contain hero copy");
});

test("GET /styleguide — 200", async () => {
  const { res } = await fetchPage("/styleguide");
  assert.equal(res.status, 200);
});

test("GET /demo — public storefront 200", async () => {
  const { res } = await fetchPage("/demo");
  assert.equal(res.status, 200);
});

test("GET /demo/checkout — 200", async () => {
  const { res } = await fetchPage("/demo/checkout");
  assert.equal(res.status, 200);
});

// ---------- dashboard (setup-notice degradation path) ----------

test("GET /dashboard — 200 (setup notice, not a crash)", async () => {
  const { res, body } = await fetchPage("/dashboard");
  assert.equal(res.status, 200);
  assert.ok(
    body.toLowerCase().includes("setup") || body.includes("dashboard"),
    "expected setup notice or dashboard chrome",
  );
});

test("GET /dashboard/events — 200", async () => {
  const { res } = await fetchPage("/dashboard/events");
  assert.equal(res.status, 200);
});

// ---------- auth pages ----------

test("GET /login — 200 with 'Welcome back'", async () => {
  const { res, body } = await fetchPage("/login");
  assert.equal(res.status, 200);
  assert.ok(body.includes("Welcome back"));
});

test("GET /register — 200", async () => {
  const { res } = await fetchPage("/register");
  assert.equal(res.status, 200);
});

// ---------- API degradation contract ----------

test("GET /api/health — 503 with { status: 'degraded' } when Supabase is unconfigured", async () => {
  const res = await fetch(`${BASE}/api/health`);
  assert.equal(res.status, 503);
  const json = await res.json();
  assert.equal(json.status, "degraded");
  assert.ok(json.checks, "health body must include its check list");
  assert.equal(json.checks.supabase_configured, "missing");
});

test("GET /api/store-config — 503 when unconfigured", async () => {
  const res = await fetch(`${BASE}/api/store-config`);
  assert.equal(res.status, 503);
  const json = await res.json();
  assert.equal(json.error, "store_unavailable");
});

test("POST /api/checkout with invalid JSON — 400 or 503, never 500", async () => {
  const res = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{not json at all",
  });
  assert.ok([400, 503].includes(res.status), `unexpected status ${res.status}`);
});

test("POST /api/checkout with valid-shaped JSON — degraded 503, never 500", async () => {
  const res = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      org_id: "00000000-0000-4000-8000-000000000001",
      items: [{ product_id: "00000000-0000-4000-8000-000000000002", qty: 1 }],
      customer_email: "buyer@example.com",
      customer_name: "E2E Buyer",
    }),
  });
  assert.ok([400, 503].includes(res.status), `unexpected status ${res.status}`);
});

test("POST /api/paypal/webhook with garbage JSON — 400 or 503, never 500", async () => {
  const res = await fetch(`${BASE}/api/paypal/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{{{garbage",
  });
  assert.ok([400, 503].includes(res.status), `unexpected status ${res.status}`);
});

test("POST /api/paypal/webhook with a valid event while unconfigured — 503", async () => {
  const res = await fetch(`${BASE}/api/paypal/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: "WH-E2E-1",
      event_version: "1.0",
      event_type: "CHECKOUT.ORDER.APPROVED",
      resource: { id: "res-1", custom: "CH-1001" },
      create_time: new Date().toISOString(),
    }),
  });
  assert.equal(res.status, 503);
  const json = await res.json();
  assert.ok(["service_unavailable", "webhook_unconfigured"].includes(json.error));
});

test("POST /api/paypal/webhook with tampered signature headers — rejected 4xx/5xx, never 500", async () => {
  const res = await fetch(`${BASE}/api/paypal/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "paypal-transmission-id": "tampered-id",
      "paypal-transmission-time": new Date().toISOString(),
      "paypal-transmission-sig": "deadbeef",
      "paypal-cert-url": "https://evil.example.com/cert",
      "paypal-auth-algo": "SHA256withRSA",
    },
    body: JSON.stringify({
      id: "WH-E2E-2",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: { id: "cap-1" },
    }),
  });
  assert.ok(
    res.status >= 400 && res.status < 600 && res.status !== 500,
    `tampered webhook must not slip through nor 500 (got ${res.status})`,
  );
  const json = await res.json();
  assert.ok(["service_unavailable", "webhook_unconfigured", "signature_invalid"].includes(json.error));
});
