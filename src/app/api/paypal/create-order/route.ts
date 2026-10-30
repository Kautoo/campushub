import { NextResponse } from "next/server";
import { createPayPalOrder, type PayPalItemParam } from "@/server/paypal";
import {
  createInternalOrder,
  createEventOrder,
  getEventById,
  updateOrder,
  cancelInternalOrder,
  cleanupExpiredPendingOrders,
} from "@/server/db/repository";
import { getServerUser } from "@/server/auth";
import { z } from "zod";

const createOrderSchema = z.object({
  type: z.enum(["merchandise", "event"]).optional(),
  // Event registration parameters
  eventId: z.string().optional(),
  planId: z.string().optional(),
  teeSize: z.string().optional(),
  // Merchandise parameters
  amount: z.number().positive().optional(), // Client may propose, but backend strictly ignores/overrides with DB price
  currency: z.string().default("USD").optional(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        name: z.string().optional(),
        price: z.number().min(0).optional(),
        quantity: z.number().int().positive().default(1),
        selectedSize: z.string().optional(),
      })
    )
    .optional(),
  shipping: z.number().min(0).default(0).optional(),
  contribution: z
    .object({
      campaignId: z.string(),
      title: z.string(),
      amount: z.number().min(0),
      tierTitle: z.string().optional(),
    })
    .optional(),
  fulfillmentMethod: z.enum(["pickup", "delivery"]).default("pickup").optional(),
  fulfillmentLocation: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED: You must be signed in to create an order.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const studentName = user.name;
    const studentEmail = user.email;
    const studentId = user.studentId;

    // 2. Validate input schema
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    const parseResult = createOrderSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order parameters",
          code: "VALIDATION_ERROR",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Reclaim expired pending reservations before evaluating capacity
    await cleanupExpiredPendingOrders();

    // ---------------------------------------------------------------------------
    // A. EVENT TICKET REGISTRATION ORDER
    // ---------------------------------------------------------------------------
    if (data.type === "event" || (data.eventId && data.planId)) {
      const eventId = data.eventId!;
      const planId = data.planId!;

      const event = await getEventById(eventId);
      if (!event) {
        return NextResponse.json(
          { success: false, error: `Event "${eventId}" not found.`, code: "EVENT_NOT_FOUND" },
          { status: 404 }
        );
      }

      if (event.status && event.status !== "PUBLISHED") {
        return NextResponse.json(
          {
            success: false,
            error: "EVENT_NOT_ACCEPTING_REGISTRATIONS: This event is not currently accepting registrations.",
            code: "EVENT_NOT_ACCEPTING_REGISTRATIONS",
          },
          { status: 400 }
        );
      }

      const plan = event.plans.find((p) => p.id === planId);
      if (!plan) {
        return NextResponse.json(
          {
            success: false,
            error: "INVALID_PLAN: The selected ticket plan does not exist for this event.",
            code: "INVALID_PLAN",
          },
          { status: 400 }
        );
      }

      // Check capacity
      if (event.registeredCount >= event.totalCapacity) {
        return NextResponse.json(
          {
            success: false,
            error: "EVENT_CAPACITY_EXCEEDED: This event has reached full capacity.",
            code: "EVENT_CAPACITY_EXCEEDED",
          },
          { status: 409 }
        );
      }

      // Create internal order and pending registration
      let eventOrderResult;
      try {
        eventOrderResult = await createEventOrder({
          eventId,
          planId,
          teeSize: data.teeSize,
          studentId,
          studentName,
          studentEmail,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to create event order";
        if (msg.includes("DUPLICATE_REGISTRATION")) {
          return NextResponse.json(
            { success: false, error: msg, code: "DUPLICATE_REGISTRATION" },
            { status: 409 }
          );
        }
        if (msg.includes("EVENT_CAPACITY_EXCEEDED")) {
          return NextResponse.json(
            { success: false, error: msg, code: "EVENT_CAPACITY_EXCEEDED" },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { success: false, error: msg, code: "ORDER_CREATION_FAILED" },
          { status: 400 }
        );
      }

      const { order: internalOrder, registration } = eventOrderResult;

      // Create PayPal Sandbox Order for authoritative plan price with rollback guard
      let paypalOrder;
      try {
        paypalOrder = await createPayPalOrder({
          amount: internalOrder.total,
          currency: event.currency || "USD",
          items: [
            {
              name: `${event.title} - ${plan.name}`,
              price: internalOrder.total,
              quantity: 1,
              category: "DIGITAL_GOODS",
            },
          ],
          description: data.description || `${event.title} - ${plan.name} Pass`,
          customId: internalOrder.id,
        });
      } catch (paypalErr) {
        // Rollback capacity reservation if PayPal order creation fails
        await cancelInternalOrder(internalOrder.id);
        throw paypalErr;
      }

      // Link PayPal Order ID to internal records
      await updateOrder(internalOrder.id, { paypalOrderId: paypalOrder.id });
      registration.paypalOrderId = paypalOrder.id;

      return NextResponse.json({
        success: true,
        orderId: paypalOrder.id,
        id: paypalOrder.id,
        internalOrderId: internalOrder.id,
        registrationId: registration.id,
        total: internalOrder.total,
        currency: event.currency || "USD",
        status: paypalOrder.status,
        isSimulated: paypalOrder.isSimulated || false,
      });
    }

    // ---------------------------------------------------------------------------
    // B. MERCHANDISE ORDER
    // ---------------------------------------------------------------------------
    const rawItems = data.items && data.items.length > 0
      ? data.items
      : [{ productId: "prod_archival_hoodie", name: "CampusHub Order", quantity: 1 }];

    const items = rawItems.map((it) => ({
      ...it,
      productId: it.productId || "prod_archival_hoodie",
    }));

    // Authoritative calculation on the backend (validates inventory & overrides client pricing)
    let internalOrder;
    try {
      internalOrder = await createInternalOrder({
        studentName,
        studentEmail,
        studentId,
        items,
        shipping: data.shipping,
        contribution: data.contribution,
        fulfillmentMethod: data.fulfillmentMethod,
        fulfillmentLocation: data.fulfillmentLocation,
      });
    } catch (orderErr) {
      const msg = orderErr instanceof Error ? orderErr.message : "Failed to create internal order";
      if (msg.includes("OUT_OF_STOCK")) {
        return NextResponse.json(
          { success: false, error: msg, code: "OUT_OF_STOCK" },
          { status: 400 }
        );
      }
      if (msg.includes("PRODUCT_NOT_FOUND")) {
        return NextResponse.json(
          { success: false, error: msg, code: "PRODUCT_NOT_FOUND" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: msg, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Format PayPal items: include merchandise items plus any club campaign donation
    const paypalItems: PayPalItemParam[] = internalOrder.items.map((i) => ({
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      category: "PHYSICAL_GOODS",
    }));

    if (data.contribution && data.contribution.amount > 0) {
      paypalItems.push({
        name: data.contribution.title,
        price: data.contribution.amount,
        quantity: 1,
        category: "DONATION" as const,
      });
    }

    // Create PayPal Sandbox order with authoritative amount and rollback guard
    let paypalOrder;
    try {
      paypalOrder = await createPayPalOrder({
        amount: internalOrder.total,
        currency: data.currency || "USD",
        items: paypalItems,
        shipping: internalOrder.shipping,
        description: data.description || `CampusHub Order ${internalOrder.orderNumber}`,
        customId: internalOrder.id,
      });
    } catch (paypalErr) {
      // Rollback decremented stock if PayPal order creation fails
      await cancelInternalOrder(internalOrder.id);
      throw paypalErr;
    }

    // Link PayPal order id to internal order
    await updateOrder(internalOrder.id, { paypalOrderId: paypalOrder.id });

    return NextResponse.json({
      success: true,
      orderId: paypalOrder.id,
      id: paypalOrder.id,
      internalOrderId: internalOrder.id,
      total: internalOrder.total,
      currency: data.currency || "USD",
      status: paypalOrder.status,
      isSimulated: paypalOrder.isSimulated || false,
    });
  } catch (error: unknown) {
    console.error("Error creating PayPal order:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { success: false, error: message, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
