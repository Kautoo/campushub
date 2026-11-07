/**
 * Unit tests for pure libs. Run via `npm test` (node --test tests/).
 * TS is loaded with Node's built-in type stripping (node >= 22.18).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  formatMoney,
  formatMoneyCompact,
  parseMoneyToCents,
  formatDelta,
} from "../lib/money.ts";
import { checkoutSchema, productSchema } from "../lib/validation.ts";
import { hasRole, canManageMembers, canEditContent, ROLE_RANK } from "../lib/rbac.ts";

// ---------- lib/money.ts ----------

test("formatMoney: RM prefix with thousands separator and 2 decimals", () => {
  assert.equal(formatMoney(123456), "RM 1,234.56");
  assert.equal(formatMoney(0), "RM 0.00");
  assert.equal(formatMoney(1), "RM 0.01");
  assert.equal(formatMoney(100), "RM 1.00");
});

test("formatMoney: non-MYR currency symbols and unknown-code fallback", () => {
  assert.equal(formatMoney(199, "USD"), "$ 1.99");
  assert.equal(formatMoney(250000, "SGD"), "S$ 2,500.00");
  assert.equal(formatMoney(500, "EUR"), "EUR 5.00");
});

test("formatMoneyCompact: raw, k and M tiers", () => {
  assert.equal(formatMoneyCompact(999), "RM 9.99");
  assert.equal(formatMoneyCompact(4_523_000), "RM 45.2k");
  assert.equal(formatMoneyCompact(2_850_000_000), "RM 28.5M");
});

test("parseMoneyToCents: accepts RM-prefixed, plain and comma-grouped input", () => {
  assert.equal(parseMoneyToCents("RM 12.50"), 1250);
  assert.equal(parseMoneyToCents("12.50"), 1250);
  assert.equal(parseMoneyToCents("RM1,234.56"), 123456);
  assert.equal(parseMoneyToCents("1,234.56"), 123456);
  assert.equal(parseMoneyToCents("0.05"), 5);
  assert.equal(parseMoneyToCents(".5"), 50);
});

test("parseMoneyToCents: rejects empty, non-numeric and malformed input", () => {
  assert.equal(parseMoneyToCents(""), null);
  assert.equal(parseMoneyToCents("   "), null);
  assert.equal(parseMoneyToCents("RM"), null);
  assert.equal(parseMoneyToCents("abc"), null);
  assert.equal(parseMoneyToCents("12.3.4"), null); // NaN after cleaning
});

test("parseMoneyToCents: rounds fractional cents half-up", () => {
  assert.equal(parseMoneyToCents("12.345"), 1235); // 1234.5 -> 1235
  assert.equal(parseMoneyToCents("12.344"), 1234);
});

test("formatDelta: sign and one decimal place", () => {
  assert.equal(formatDelta(12.4), "+12.4%");
  assert.equal(formatDelta(-3.25), "-3.3%");
  assert.equal(formatDelta(0), "+0.0%");
});

// ---------- lib/validation.ts ----------

const UUID_A = "00000000-0000-4000-8000-000000000001";
const UUID_B = "00000000-0000-4000-8000-000000000002";

function checkout(items, overrides = {}) {
  return checkoutSchema.safeParse({
    org_id: UUID_A,
    items,
    customer_email: "buyer@example.com",
    customer_name: "Test Buyer",
    ...overrides,
  });
}

test("checkoutSchema: accepts a valid product-only and tier-only cart", () => {
  assert.equal(checkout([{ product_id: UUID_B, qty: 2 }]).success, true);
  assert.equal(checkout([{ tier_id: UUID_B, qty: 1 }]).success, true);
  assert.equal(
    checkout([
      { product_id: UUID_B, qty: 20 }, // upper qty bound
    ]).success,
    true,
  );
});

test("checkoutSchema: rejects an item carrying BOTH product_id and tier_id", () => {
  const r = checkout([{ product_id: UUID_B, tier_id: UUID_A, qty: 1 }]);
  assert.equal(r.success, false);
});

test("checkoutSchema: rejects an item carrying NEITHER product_id nor tier_id", () => {
  assert.equal(checkout([{ qty: 1 }]).success, false);
});

test("checkoutSchema: enforces qty integer bounds 1..20", () => {
  assert.equal(checkout([{ product_id: UUID_B, qty: 0 }]).success, false);
  assert.equal(checkout([{ product_id: UUID_B, qty: 21 }]).success, false);
  assert.equal(checkout([{ product_id: UUID_B, qty: 1.5 }]).success, false);
  assert.equal(checkout([{ product_id: UUID_B, qty: -1 }]).success, false);
});

test("checkoutSchema: rejects malformed ids, email and name", () => {
  assert.equal(
    checkout([{ product_id: "not-a-uuid", qty: 1 }]).success,
    false,
  );
  assert.equal(checkout([{ product_id: UUID_B, qty: 1 }], { org_id: "nope" }).success, false);
  assert.equal(
    checkout([{ product_id: UUID_B, qty: 1 }], { customer_email: "not-an-email" }).success,
    false,
  );
  assert.equal(
    checkout([{ product_id: UUID_B, qty: 1 }], { customer_name: "" }).success,
    false,
  );
  assert.equal(checkout([]).success, false); // empty cart
});

test("productSchema: accepts a valid product and coerces numeric strings", () => {
  const ok = productSchema.safeParse({
    name: "Campus Hoodie",
    slug: "campus-hoodie",
    price_cents: "12900",
    stock: "10",
    low_stock_threshold: "3",
    status: "active",
  });
  assert.equal(ok.success, true);
  if (ok.success) {
    assert.equal(ok.data.price_cents, 12900);
    assert.equal(ok.data.stock, 10);
  }
});

test("productSchema: rejects negative price, bad slug and bad status", () => {
  const base = {
    name: "X",
    slug: "x",
    price_cents: 100,
    stock: 1,
    low_stock_threshold: 0,
    status: "active",
  };
  assert.equal(productSchema.safeParse({ ...base, price_cents: -1 }).success, false);
  assert.equal(productSchema.safeParse({ ...base, slug: "Bad Slug!" }).success, false);
  assert.equal(productSchema.safeParse({ ...base, status: "live" }).success, false);
  assert.equal(productSchema.safeParse({ ...base, stock: -5 }).success, false);
});

// ---------- lib/rbac.ts ----------

test("hasRole: staff < admin < owner ordering", () => {
  assert.deepEqual(ROLE_RANK, { owner: 3, admin: 2, staff: 1 });
  // exact role passes
  assert.equal(hasRole("staff", "staff"), true);
  assert.equal(hasRole("admin", "admin"), true);
  assert.equal(hasRole("owner", "owner"), true);
  // higher passes lower requirement
  assert.equal(hasRole("admin", "staff"), true);
  assert.equal(hasRole("owner", "admin"), true);
  assert.equal(hasRole("owner", "staff"), true);
  // lower fails higher requirement
  assert.equal(hasRole("staff", "admin"), false);
  assert.equal(hasRole("staff", "owner"), false);
  assert.equal(hasRole("admin", "owner"), false);
});

test("canManageMembers: only admin and above", () => {
  assert.equal(canManageMembers("owner"), true);
  assert.equal(canManageMembers("admin"), true);
  assert.equal(canManageMembers("staff"), false);
});

test("canEditContent: every role can edit", () => {
  assert.equal(canEditContent("owner"), true);
  assert.equal(canEditContent("admin"), true);
  assert.equal(canEditContent("staff"), true);
});
