import "server-only";

interface PayPalOrderItem {
  name: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  quantity: string;
  category?: "PHYSICAL_GOODS" | "DIGITAL_GOODS" | "DONATION";
}

export interface PayPalItemParam {
  name: string;
  price: number;
  quantity: number;
  category?: "PHYSICAL_GOODS" | "DIGITAL_GOODS" | "DONATION";
}

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  items?: PayPalItemParam[];
  shipping?: number;
  discount?: number;
  description?: string;
  customId?: string;
}

export interface PayPalCaptureResult {
  id: string;
  orderId: string;
  captureId: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "DECLINED";
  isSimulated?: boolean;
  amount?: {
    currency_code: string;
    value: string;
  };
  payer?: {
    email_address?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  create_time?: string;
  update_time?: string;
}

// In-memory token cache for OAuth 2.0 client credentials flow
interface CachedToken {
  accessToken: string;
  expiresAt: number;
}
let tokenCache: CachedToken | null = null;

// In-memory simulated orders map to support verification and reconciliation in sandbox/test mode
const simulatedOrdersStore = new Map<string, {
  id: string;
  amount: number;
  currency: string;
  status: string;
  captureId?: string;
  description?: string;
  createdAt: string;
}>();

/**
 * Checks if real credentials are configured for live PayPal sandbox
 */
export function isPayPalConfigured(): boolean {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return false;
  if (
    clientId === "your-paypal-sandbox-client-id" ||
    clientId === "your-sandbox-client-id" ||
    clientSecret === "your-paypal-sandbox-client-secret"
  ) {
    return false;
  }
  return true;
}

/**
 * Gets OAuth2 access token from PayPal Sandbox with caching and proactive refresh
 */
export async function getPayPalAccessToken(): Promise<string | null> {
  if (!isPayPalConfigured()) {
    return null;
  }

  // Return cached token if valid (refreshes 60 seconds before expiration)
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const baseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[PayPal Auth] OAuth token retrieval failed with HTTP ${response.status}:`, errText);
      tokenCache = null;
      return null;
    }

    const data = await response.json();
    const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;

    tokenCache = {
      accessToken: data.access_token as string,
      expiresAt: Date.now() + Math.max(60, expiresIn - 60) * 1000,
    };

    return tokenCache.accessToken;
  } catch (error) {
    console.error("[PayPal Auth] Error connecting to PayPal token endpoint:", error instanceof Error ? error.message : "Network error");
    return null;
  }
}

/**
 * Diagnostic check for PayPal connection status without exposing secrets
 */
export async function verifyPayPalConnection() {
  if (!isPayPalConfigured()) {
    return {
      configured: false,
      connected: false,
      mode: "simulated_sandbox",
      baseUrl: process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com",
      message: "PayPal sandbox credentials not configured. Operating in high-fidelity simulated Sandbox mode.",
    };
  }

  const token = await getPayPalAccessToken();
  if (token) {
    return {
      configured: true,
      connected: true,
      mode: "live_sandbox",
      baseUrl: process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com",
      message: "Successfully authenticated with PayPal Sandbox API.",
    };
  }

  return {
    configured: true,
    connected: false,
    mode: "error",
    baseUrl: process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com",
    message: "Failed to authenticate with PayPal Sandbox API. Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
  };
}

/**
 * Creates an order via PayPal Orders API v2
 */
export async function createPayPalOrder({
  amount,
  currency = "USD",
  items = [],
  shipping = 0,
  discount = 0,
  description = "CampusHub Purchase",
  customId,
}: CreateOrderParams) {
  if (amount <= 0) {
    throw new Error("PayPal order creation failed: amount must be greater than zero");
  }

  const token = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

  // If live credentials are not present, return deterministic simulated sandbox order
  if (!token) {
    const simulatedOrderId = `SANDBOX-ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const simulatedOrder = {
      id: simulatedOrderId,
      status: "CREATED",
      isSimulated: true,
      amount: amount.toFixed(2),
      currency,
      description,
      createdAt: new Date().toISOString(),
    };
    simulatedOrdersStore.set(simulatedOrderId, {
      id: simulatedOrderId,
      amount,
      currency,
      status: "CREATED",
      description,
      createdAt: simulatedOrder.createdAt,
    });
    return simulatedOrder;
  }

  const orderItems: PayPalOrderItem[] = items.map((item) => ({
    name: item.name.substring(0, 127),
    unit_amount: {
      currency_code: currency,
      value: item.price.toFixed(2),
    },
    quantity: item.quantity.toString(),
    category: item.category || "PHYSICAL_GOODS",
  }));

  const itemTotal = Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );

  const breakdown: Record<string, { currency_code: string; value: string }> = {};
  if (items.length > 0) {
    breakdown.item_total = {
      currency_code: currency,
      value: itemTotal.toFixed(2),
    };
  }
  if (shipping > 0) {
    breakdown.shipping = {
      currency_code: currency,
      value: shipping.toFixed(2),
    };
  }
  if (discount > 0) {
    breakdown.discount = {
      currency_code: currency,
      value: discount.toFixed(2),
    };
  }

  const hasBreakdown = Object.keys(breakdown).length > 0;

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: customId ? customId.substring(0, 127) : undefined,
        description: description.substring(0, 127),
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
          breakdown: hasBreakdown ? breakdown : undefined,
        },
        items: items.length > 0 ? orderItems : undefined,
      },
    ],
    application_context: {
      brand_name: "CampusHub",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      shipping_preference: "NO_SHIPPING",
    },
  };

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": requestId,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[PayPal Orders API] Create order failed (${response.status}):`, errorBody);
    throw new Error(`PayPal order creation failed: ${response.status}`);
  }

  const orderData = await response.json();
  return {
    ...orderData,
    isSimulated: false,
  };
}

/**
 * Captures an authorized PayPal order via Orders API v2
 */
export async function capturePayPalOrder(orderId: string, options: { idempotencyKey?: string } = {}): Promise<PayPalCaptureResult> {
  // If simulated timeout request
  if (orderId.includes("TIMEOUT")) {
    const err = new Error("PAYPAL_GATEWAY_TIMEOUT");
    (err as unknown as { isTimeout?: boolean }).isTimeout = true;
    throw err;
  }

  // If simulated order (starts with SANDBOX-), return simulated capture
  if (orderId.startsWith("SANDBOX-")) {
    const existing = simulatedOrdersStore.get(orderId);
    const captureId = existing?.captureId || `SANDBOX-CAP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (existing) {
      existing.status = "COMPLETED";
      existing.captureId = captureId;
    }

    return {
      id: orderId,
      orderId,
      captureId,
      status: "COMPLETED",
      isSimulated: true,
      amount: {
        currency_code: existing?.currency || "USD",
        value: existing ? existing.amount.toFixed(2) : "0.00",
      },
      payer: {
        email_address: "student-buyer@campus.edu",
        name: { given_name: "Alex", surname: "Rivera" },
      },
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
    };
  }

  const token = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

  if (!token) {
    throw new Error("Missing PayPal credentials for capturing live order.");
  }

  const requestId = options.idempotencyKey || `cap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": requestId,
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (netErr) {
    clearTimeout(timeoutId);
    const isTimeout = netErr instanceof Error && netErr.name === "AbortError";
    const err = new Error(isTimeout ? "PAYPAL_GATEWAY_TIMEOUT" : "PAYPAL_NETWORK_ERROR");
    (err as unknown as { isTimeout?: boolean }).isTimeout = isTimeout;
    throw err;
  }
  clearTimeout(timeoutId);

  // Handle case where order is already captured (idempotency reconciliation)
  if (response.status === 422) {
    const errorBody = await response.text();
    if (errorBody.includes("ORDER_ALREADY_CAPTURED")) {
      console.log(`[PayPal Orders API] Order ${orderId} already captured. Retrieving order details for reconciliation.`);
      const details = await getPayPalOrderDetails(orderId);
      const captureObj = details?.purchase_units?.[0]?.payments?.captures?.[0];
      return {
        id: orderId,
        orderId,
        captureId: captureObj?.id || `CAP-${orderId}`,
        status: (captureObj?.status as "COMPLETED") || "COMPLETED",
        isSimulated: false,
        amount: captureObj?.amount,
        payer: details?.payer,
        create_time: captureObj?.create_time,
        update_time: captureObj?.update_time,
      };
    }
    console.error("[PayPal Orders API] Capture 422 unprocessable entity:", errorBody);
    throw new Error(`PayPal order capture unprocessable: ${errorBody}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[PayPal Orders API] Capture order failed (${response.status}):`, errorBody);
    throw new Error(`PayPal order capture failed: ${response.status}`);
  }

  const data = await response.json();
  const captureObj = data.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    id: data.id || orderId,
    orderId,
    captureId: captureObj?.id || data.id,
    status: (captureObj?.status || data.status || "COMPLETED") as "COMPLETED",
    isSimulated: false,
    amount: captureObj?.amount,
    payer: data.payer,
    create_time: captureObj?.create_time || data.create_time,
    update_time: captureObj?.update_time || data.update_time,
  };
}

/**
 * Retrieves authoritative order details from PayPal for verification or reconciliation
 */
export async function getPayPalOrderDetails(orderId: string) {
  if (orderId.startsWith("SANDBOX-")) {
    const existing = simulatedOrdersStore.get(orderId);
    return {
      id: orderId,
      status: existing?.status || "CREATED",
      isSimulated: true,
      amount: existing?.amount,
      currency: existing?.currency || "USD",
      captureId: existing?.captureId,
      purchase_units: [
        {
          amount: {
            currency_code: existing?.currency || "USD",
            value: (existing?.amount || 0).toFixed(2),
          },
          payments: {
            captures: existing?.captureId
              ? [
                  {
                    id: existing.captureId,
                    status: existing.status === "COMPLETED" ? "COMPLETED" : "PENDING",
                    amount: {
                      currency_code: existing?.currency || "USD",
                      value: (existing?.amount || 0).toFixed(2),
                    },
                    create_time: existing.createdAt,
                    update_time: existing.createdAt,
                  },
                ]
              : [],
          },
        },
      ],
      payer: {
        email_address: "student-buyer@campus.edu",
        name: { given_name: "Alex", surname: "Rivera" },
      },
    };
  }

  const token = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

  if (!token) {
    throw new Error("Missing PayPal credentials for order inspection.");
  }

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to retrieve PayPal order details (${response.status})`);
  }

  return response.json();
}
