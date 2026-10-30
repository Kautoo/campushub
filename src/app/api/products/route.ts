import { getProducts, createProduct } from "@/server/db/repository";
import { requireOrganizer } from "@/server/auth";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/server/api-response";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  price: z.number().positive("Price must be greater than 0"),
  originalPrice: z.number().positive().optional(),
  description: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  stockCount: z.number().int().min(0).optional(),
  inStock: z.boolean().optional(),
  campusPickup: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const inStock = searchParams.get("inStock")
      ? searchParams.get("inStock") === "true"
      : undefined;

    const products = await getProducts({ category, inStock });
    return successResponse(products);
  } catch (err) {
    return serverErrorResponse(err, "Failed to retrieve products");
  }
}

export async function POST(request: Request) {
  try {
    let user;
    try {
      user = await requireOrganizer(request);
    } catch (authError) {
      const msg = authError instanceof Error ? authError.message : "Unauthorized";
      if (msg.startsWith("UNAUTHORIZED")) return unauthorizedResponse(msg);
      return forbiddenResponse(msg);
    }

    const body = await request.json();
    const parseResult = createProductSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse("Invalid product data", "VALIDATION_ERROR", 400, parseResult.error.flatten().fieldErrors);
    }

    const newProduct = await createProduct(parseResult.data, user);
    return successResponse(newProduct, "Product created successfully", 201);
  } catch (err) {
    return serverErrorResponse(err, "Failed to create product");
  }
}
