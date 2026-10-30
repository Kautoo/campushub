import { createInternalOrder } from "@/server/db/repository";
import { requireAuth } from "@/server/auth";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/server/api-response";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().optional(),
      name: z.string().optional(),
      price: z.number().min(0).optional(),
      quantity: z.number().int().positive(),
      selectedSize: z.string().optional(),
    })
  ).min(1, "Order must contain at least one item"),
  shipping: z.number().min(0).optional(),
  contribution: z
    .object({
      campaignId: z.string(),
      title: z.string(),
      amount: z.number().min(0),
      tierTitle: z.string().optional(),
    })
    .optional(),
  fulfillmentMethod: z.enum(["pickup", "delivery"]).optional(),
  fulfillmentLocation: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    let user;
    try {
      user = await requireAuth(request);
    } catch {
      return unauthorizedResponse("Authentication required to place an order.");
    }

    const body = await request.json();
    const parseResult = createOrderSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse("Invalid order payload", "VALIDATION_ERROR", 400, parseResult.error.flatten().fieldErrors);
    }

    try {
      const newOrder = await createInternalOrder({
        studentName: user.name,
        studentEmail: user.email,
        studentId: user.studentId,
        items: parseResult.data.items,
        shipping: parseResult.data.shipping,
        contribution: parseResult.data.contribution,
        fulfillmentMethod: parseResult.data.fulfillmentMethod,
        fulfillmentLocation: parseResult.data.fulfillmentLocation,
      });

      return successResponse(newOrder, "Order created successfully", 201);
    } catch (orderErr) {
      const msg = orderErr instanceof Error ? orderErr.message : "Failed to place order";
      if (msg.includes("PRODUCT_NOT_FOUND")) {
        return errorResponse(msg, "PRODUCT_NOT_FOUND", 400);
      }
      if (msg.includes("OUT_OF_STOCK")) {
        return errorResponse(msg, "OUT_OF_STOCK", 400);
      }
      if (msg.includes("VALIDATION_ERROR")) {
        return errorResponse(msg, "VALIDATION_ERROR", 400);
      }
      return errorResponse(msg, "ORDER_CREATION_FAILED", 400);
    }
  } catch (err) {
    return serverErrorResponse(err, "Failed to create order");
  }
}
