"use client";

/** Guest cart persisted in localStorage under a stable session token. */
export type CartLine = {
  product_id?: string;
  tier_id?: string;
  name: string;
  price_cents: number;
  qty: number;
};

const CART_KEY = "ch-cart";
const SESSION_KEY = "ch-session";

export function getSessionToken(): string {
  if (typeof window === "undefined") return "";
  let t = localStorage.getItem(SESSION_KEY);
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, t);
  }
  return t;
}

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as CartLine[];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("ch-cart-changed"));
}

export function addToCart(line: CartLine): void {
  const cart = readCart();
  const idx = cart.findIndex(
    (l) =>
      (l.product_id && l.product_id === line.product_id) ||
      (l.tier_id && l.tier_id === line.tier_id),
  );
  if (idx >= 0) {
    cart[idx].qty = Math.min(20, cart[idx].qty + line.qty);
  } else {
    cart.push({ ...line, qty: Math.min(20, Math.max(1, line.qty)) });
  }
  writeCart(cart);
}

export function updateCartQty(index: number, nextQty: number): void {
  const cart = readCart();
  if (index < 0 || index >= cart.length) return;
  if (nextQty <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].qty = Math.min(20, nextQty);
  }
  writeCart(cart);
}

export function removeFromCart(index: number): void {
  const cart = readCart();
  cart.splice(index, 1);
  writeCart(cart);
}

export function clearCart(): void {
  writeCart([]);
}

export function cartCount(): number {
  return readCart().reduce((s, l) => s + l.qty, 0);
}
