import { getProductById, updateProduct } from "@/server/db/repository";
import { requireOrganizer, getServerUser } from "@/server/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/server/api-response";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  description: z.string().optional(),
  stockCount: z.number().int().min(0).optional(),
  inStock: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return notFoundResponse(`Product with ID "${id}" was not found.`);
    }

    if (product.isActive === false) {
      const user = await getServerUser(request);
      if (!user || (user.role !== "organizer" && user.role !== "admin")) {
        return notFoundResponse(`Product with ID "${id}" was not found.`);
      }
    }

    return successResponse(product);
  } catch (err) {
    return serverErrorResponse(err, "Failed to retrieve product details");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let user;
    try {
      user = await requireOrganizer(request);
    } catch (authError) {
      const msg = authError instanceof Error ? authError.message : "Unauthorized";
      if (msg.startsWith("UNAUTHORIZED")) return unauthorizedResponse(msg);
      return forbiddenResponse(msg);
    }

    const body = await request.json();
    const parseResult = updateProductSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse("Invalid update payload", "VALIDATION_ERROR", 400, parseResult.error.flatten().fieldErrors);
    }

    try {
      const updated = await updateProduct(id, parseResult.data, user);
      return successResponse(updated, "Product updated successfully");
    } catch (updateErr) {
      const msg = updateErr instanceof Error ? updateErr.message : "Failed to update product";
      if (msg.includes("FORBIDDEN")) {
        return forbiddenResponse(msg);
      }
      if (msg.includes("not found")) {
        return notFoundResponse(msg);
      }
      return errorResponse(msg, "UPDATE_ERROR", 400);
    }
  } catch (err) {
    return serverErrorResponse(err, "Failed to update product");
  }
}
