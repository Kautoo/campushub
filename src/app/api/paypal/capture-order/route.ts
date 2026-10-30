import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/server/paypal";
import {
  markOrderPaid,
  getOrderById,
  store,
} from "@/server/db/repository";
import { getServerUser } from "@/server/auth";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED: You must be signed in to capture payment.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    // Support both orderId and orderID (common in PayPal JS SDK)
    const orderId = body.orderId || body.orderID;
    const internalOrderId = body.internalOrderId;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid orderId", code: "INVALID_ORDER_ID" },
        { status: 400 }
      );
    }

    // 2. Locate internal order
    let targetOrder = null;
    if (internalOrderId) {
      targetOrder = await getOrderById(internalOrderId);
    }
    if (!targetOrder) {
      targetOrder = await getOrderById(orderId);
    }

    if (!targetOrder) {
      return NextResponse.json(
        {
          success: false,
          error: `Order not found for reference "${internalOrderId || orderId}".`,
          code: "ORDER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // 3. Authorization & Ownership check (Prevent User A from capturing User B's order)
    const isOwner =
      targetOrder.studentId === user.studentId ||
      targetOrder.studentEmail === user.email ||
      user.role === "admin";

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: "FORBIDDEN: You do not have permission to capture this order.",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // 4. Verify order is not cancelled
    if (targetOrder.status === "cancelled" || targetOrder.paymentStatus === "FAILED") {
      return NextResponse.json(
        {
          success: false,
          error: "ORDER_CANCELLED: Cannot capture payment for an order that has been cancelled.",
          code: "ORDER_CANCELLED",
        },
        { status: 400 }
      );
    }

    // 5. Verify PayPal order association
    if (targetOrder.paypalOrderId && targetOrder.paypalOrderId !== orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "SECURITY_ERROR: Provided PayPal order ID does not match the internal order record.",
          code: "ORDER_MISMATCH",
        },
        { status: 400 }
      );
    }

    // 5. Idempotency Check: if order is already paid, return existing result without re-capturing
    if (
      targetOrder.status === "ready_for_pickup" ||
      targetOrder.status === "dispatched" ||
      targetOrder.paymentStatus === "COMPLETED"
    ) {
      const existingPayment = store.payments.find((p) => p.orderId === targetOrder.id);
      const associatedReg = store.registrations.find(
        (r) => r.id === targetOrder.registrationId || r.orderId === targetOrder.id
      );

      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        captureId: targetOrder.paypalCaptureId || existingPayment?.providerCaptureId,
        id: targetOrder.paypalCaptureId || existingPayment?.providerCaptureId,
        status: "COMPLETED",
        order: targetOrder,
        registration: associatedReg || null,
        message: "Order was already successfully verified and processed.",
      });
    }

    // 6. Capture payment via server-side PayPal Orders API v2
    let captureResult;
    try {
      captureResult = await capturePayPalOrder(orderId, {
        idempotencyKey: `cap_${targetOrder.id}_${orderId}`,
      });
    } catch (captureErr) {
      const isTimeout = (captureErr as { isTimeout?: boolean }).isTimeout;
      if (isTimeout) {
        return NextResponse.json(
          {
            success: false,
            error: "PAYPAL_GATEWAY_TIMEOUT: PayPal payment capture timed out. The transaction is pending reconciliation.",
            code: "PAYPAL_GATEWAY_TIMEOUT",
          },
          { status: 504 }
        );
      }
      const msg = captureErr instanceof Error ? captureErr.message : "Payment capture failed";
      return NextResponse.json(
        {
          success: false,
          error: msg,
          code: "PAYMENT_CAPTURE_FAILED",
        },
        { status: 422 }
      );
    }

    // 7. Verify capture status
    if (captureResult.status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: `Payment was not completed. Status: ${captureResult.status}`,
          code: "PAYMENT_NOT_COMPLETED",
        },
        { status: 400 }
      );
    }

    const captureId = captureResult.captureId || captureResult.id;
    const verifiedAmount = captureResult.amount ? parseFloat(captureResult.amount.value) : undefined;
    const verifiedCurrency = captureResult.amount?.currency_code;

    if (verifiedAmount === undefined || isNaN(verifiedAmount)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CAPTURE_AMOUNT: PayPal capture result did not include a valid amount.",
          code: "INVALID_CAPTURE_AMOUNT",
        },
        { status: 400 }
      );
    }

    // 8. Persist payment & update order status with transaction integrity
    let updatedOrder;
    try {
      updatedOrder = await markOrderPaid(targetOrder.id, {
        paypalCaptureId: captureId,
        paypalOrderId: orderId,
        payerEmail: captureResult.payer?.email_address,
        payerName: captureResult.payer?.name
          ? `${captureResult.payer.name.given_name || ""} ${captureResult.payer.name.surname || ""}`.trim()
          : undefined,
        verifiedAmount,
        verifiedCurrency,
      });
    } catch (dbError) {
      // Emergency post-capture reconciliation: PayPal captured the funds, but DB update encountered an error
      console.error("[PAYMENT RECONCILIATION NEEDED] Database update failed after successful capture:", {
        paypalOrderId: orderId,
        captureId,
        internalOrderId: targetOrder.id,
        error: dbError instanceof Error ? dbError.message : dbError,
      });

      store.reconciliationQueue.push({
        paypalOrderId: orderId,
        captureId,
        internalOrderId: targetOrder.id,
        error: dbError instanceof Error ? dbError.message : "Database write error",
        createdAt: new Date().toISOString(),
      });

      const msg = dbError instanceof Error ? dbError.message : "Database error";
      return NextResponse.json(
        {
          success: false,
          error: `Payment captured by PayPal, but local record reconciliation error occurred: ${msg}`,
          code: "DATABASE_RECONCILIATION_PENDING",
          captureId,
        },
        { status: 500 }
      );
    }

    // Retrieve associated event registration if applicable
    const confirmedRegistration = store.registrations.find(
      (r) => r.id === updatedOrder.registrationId || r.orderId === updatedOrder.id
    );

    return NextResponse.json({
      success: true,
      captureId,
      id: captureId,
      status: "COMPLETED",
      isSimulated: captureResult.isSimulated || false,
      order: updatedOrder,
      registration: confirmedRegistration || null,
      message: confirmedRegistration
        ? "Payment verified. Event registration confirmed."
        : "Payment verified. Order confirmed.",
    });
  } catch (error: unknown) {
    console.error("Error capturing PayPal order:", error);
    const message = error instanceof Error ? error.message : "Failed to capture payment";
    return NextResponse.json(
      { success: false, error: message, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
