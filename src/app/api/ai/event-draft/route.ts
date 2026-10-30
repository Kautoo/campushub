import { generateEventDraft } from "@/lib/ai/ai-service";
import { eventDraftInputSchema } from "@/lib/ai/ai-validation";
import { AstropodsError } from "@/lib/ai/astropods-client";
import { checkAiRateLimit } from "@/lib/ai/ai-rate-limit";
import { requireOrganizer } from "@/server/auth";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/server/api-response";

export async function POST(request: Request) {
  try {
    const clientId =
      request.headers.get("x-campushub-token") ||
      request.headers.get("x-forwarded-for") ||
      "anonymous-organizer";

    const rateLimit = checkAiRateLimit(clientId);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Astropods AI request rate limit exceeded. Please try again shortly.",
          code: "RATE_LIMIT_EXCEEDED",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateLimit.retryAfterSec),
          },
        }
      );
    }

    try {
      await requireOrganizer(request);
    } catch (authError) {
      const msg = authError instanceof Error ? authError.message : "Unauthorized";
      if (msg.startsWith("UNAUTHORIZED")) return unauthorizedResponse(msg);
      return forbiddenResponse(msg);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON payload", "INVALID_JSON", 400);
    }

    const parseResult = eventDraftInputSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        "Invalid event draft parameters",
        "VALIDATION_ERROR",
        400,
        parseResult.error.flatten().fieldErrors
      );
    }

    const url = new URL(request.url);
    const allowFallback =
      url.searchParams.get("fallback") === "true" ||
      request.headers.get("x-campushub-ai-fallback") === "true";

    const draft = await generateEventDraft(parseResult.data, { allowFallback });
    return successResponse(draft, "AI event draft generated successfully");
  } catch (err: unknown) {
    if (err instanceof AstropodsError) {
      return errorResponse(err.message, err.code, err.statusCode);
    }
    return serverErrorResponse(err, "Failed to generate event draft");
  }
}
