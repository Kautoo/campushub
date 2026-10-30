import { generateEventCopy } from "@/server/ai";
import { requireOrganizer } from "@/server/auth";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/server/api-response";
import { z } from "zod";

const eventWriterSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(2, "Category is required"),
  tone: z.enum(["editorial", "technical", "urgent"]).default("editorial"),
  highlights: z.string().optional(),
  targetAudience: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    try {
      await requireOrganizer(request);
    } catch (authError) {
      const msg = authError instanceof Error ? authError.message : "Unauthorized";
      if (msg.startsWith("UNAUTHORIZED")) return unauthorizedResponse(msg);
      return forbiddenResponse(msg);
    }

    const body = await request.json();
    const parseResult = eventWriterSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse("Invalid input parameters", "VALIDATION_ERROR", 400, parseResult.error.flatten().fieldErrors);
    }

    const output = await generateEventCopy(parseResult.data);
    return successResponse(output, "AI event copy generated successfully");
  } catch (err) {
    return serverErrorResponse(err, "Failed to generate AI event copy");
  }
}
