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

interface CreateOrderParams {
  amount: number;
  currency?: string;
  items?: {
    name: string;
    price: number;
    quantity: number;
  }[];
  description?: string;
}

/**
 * Gets OAuth2 access token from PayPal Sandbox
 */
async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

  if (!clientId || !clientSecret || clientId === "your-paypal-sandbox-client-id") {
    return null;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  try {
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to obtain PayPal token:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token as string;
  } catch (error) {
    console.error("Error connecting to PayPal token endpoint:", error);
    return null;
  }
}

/**
 * Creates an order via PayPal Orders API v2
 */
export async function createPayPalOrder({
  amount,
  currency = "USD",
  items = [],
  description = "CampusHub Verified Purchase",
}: CreateOrderParams) {
  const token = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

  // If live credentials are not present, return simulated sandbox order
  if (!token) {
    const simulatedOrderId = `SANDBOX-CH-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      id: simulatedOrderId,
      status: "CREATED",
      isSimulated: true,
      amount: amount.toFixed(2),
      currency,
    };
  }

  const orderItems: PayPalOrderItem[] = items.map((item) => ({
    name: item.name.substring(0, 127),
    unit_amount: {
      currency_code: currency,
      value: item.price.toFixed(2),
    },
    quantity: item.quantity.toString(),
    category: "PHYSICAL_GOODS",
  }));

  const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        description: description.substring(0, 127),
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
          breakdown: items.length > 0
            ? {
                item_total: {
                  currency_code: currency,
                  value: itemTotal.toFixed(2),
                },
              }
            : undefined,
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

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("PayPal create order API error:", errorBody);
    throw new Error(`PayPal order creation failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Captures an authorized PayPal order via Orders API v2
 */
export async function capturePayPalOrder(orderId: string) {
  // If simulated order, return simulated capture
  if (orderId.startsWith("SANDBOX-CH-")) {
    return {
      id: orderId,
      status: "COMPLETED",
      isSimulated: true,
      captureId: `CAP-SB-${Math.floor(100000 + Math.random() * 900000)}`,
      payer: {
        email_address: "student-buyer@campus.edu",
        name: { given_name: "Alex", surname: "Rivera" },
      },
    };
  }

  const token = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

  if (!token) {
    throw new Error("Missing PayPal credentials for capturing live order.");
  }

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `cap_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("PayPal capture order API error:", errorBody);
    throw new Error(`PayPal order capture failed: ${response.status}`);
  }

  return response.json();
}

