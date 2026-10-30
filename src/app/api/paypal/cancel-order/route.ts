import { NextResponse } from "next/server";
import { getOrderById, cancelInternalOrder } from "@/server/db/repository";
import { getServerUser } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED: You must be signed in to cancel an order.",
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

    const orderId = body.orderId || body.orderID;
    const internalOrderId = body.internalOrderId;

    if (!orderId && !internalOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing order reference.", code: "INVALID_PARAMETERS" },
        { status: 400 }
      );
    }

    let targetOrder = null;
    if (internalOrderId) {
      targetOrder = await getOrderById(internalOrderId);
    }
    if (!targetOrder && orderId) {
      targetOrder = await getOrderById(orderId);
    }

    if (!targetOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found.", code: "ORDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Verify ownership
    const isOwner =
      targetOrder.studentId === user.studentId ||
      targetOrder.studentEmail === user.email ||
      user.role === "admin";

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: "FORBIDDEN: You do not have permission to cancel this order.",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Prevent cancelling already settled/paid orders
    if (
      targetOrder.paymentStatus === "COMPLETED" ||
      targetOrder.status === "ready_for_pickup" ||
      targetOrder.status === "dispatched"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "CANNOT_CANCEL_PAID_ORDER: Cannot cancel an order that has already been paid.",
          code: "CANNOT_CANCEL_PAID_ORDER",
        },
        { status: 400 }
      );
    }

    const cancelledOrder = await cancelInternalOrder(targetOrder.id);

    return NextResponse.json({
      success: true,
      message: "Order checkout cancelled and inventory/reservations released.",
      order: cancelledOrder,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: msg, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
