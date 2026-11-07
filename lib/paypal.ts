/**
 * PayPal integration (server-only).
 * - create/capture via @paypal/paypal-server-sdk (OrdersController)
 * - webhook signature verification via REST /v1/notifications/verify-webhook-signature
 * Money: integer cents in DB; PayPal needs decimal strings ("123.45").
 */
import { Client, Environment, OrdersController } from "@paypal/paypal-server-sdk";

export function paypalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET,
  );
}

export function paypalCurrency(): string {
  return process.env.PAYPAL_CURRENCY ?? "MYR";
}

export function paypalEnvLabel(): string {
  return process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
}

export function centsToPaypalAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function paypalClient(): Client {
  if (!paypalConfigured()) {
    throw new Error(
      "PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
    );
  }
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    },
    timeout: 0,
    environment:
      process.env.PAYPAL_ENV === "live" ? Environment.Production : Environment.Sandbox,
  });
}

export function ordersController(): OrdersController {
  return new OrdersController(paypalClient());
}

/** Application access token for direct REST calls (webhook verification). */
async function paypalAccessToken(): Promise<string> {
  const base = paypalBase();
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export function paypalBase(): string {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export type WebhookVerifyResult = "SUCCESS" | "FAILURE" | "UNCONFIGURED";

/** Verify webhook transmission signature against PAYPAL_WEBHOOK_ID. */
export async function verifyWebhookSignature(
  headers: Headers,
  body: unknown,
): Promise<WebhookVerifyResult> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return "UNCONFIGURED";

  const required = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ] as const;
  const missing = required.filter((h) => !headers.get(h));
  if (missing.length > 0) return "FAILURE";

  const token = await paypalAccessToken();
  const res = await fetch(`${paypalBase()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: body,
    }),
  });
  if (!res.ok) return "FAILURE";
  const json = (await res.json()) as { verification_status: string };
  return json.verification_status === "SUCCESS" ? "SUCCESS" : "FAILURE";
}
