import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/server/paypal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, items, description } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount" },
        { status: 400 }
      );
    }

    const order = await createPayPalOrder({
      amount,
      currency: currency || "USD",
      items,
      description,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
      isSimulated: order.isSimulated || false,
    });
  } catch (error: unknown) {
    console.error("Error creating PayPal order:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

