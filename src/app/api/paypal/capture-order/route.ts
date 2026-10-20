import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/server/paypal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid orderId" },
        { status: 400 }
      );
    }

    const captureResult = await capturePayPalOrder(orderId);

    return NextResponse.json({
      success: true,
      captureId: captureResult.captureId || captureResult.id,
      status: captureResult.status,
      isSimulated: captureResult.isSimulated || false,
    });
  } catch (error: unknown) {
    console.error("Error capturing PayPal order:", error);
    const message = error instanceof Error ? error.message : "Failed to capture payment";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

