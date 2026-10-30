import { generateOrganizerInsights } from "@/lib/ai/ai-service";
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

    let organizer;
    try {
      organizer = await requireOrganizer(request);
    } catch (authError) {
      const msg = authError instanceof Error ? authError.message : "Unauthorized";
      if (msg.startsWith("UNAUTHORIZED")) return unauthorizedResponse(msg);
      return forbiddenResponse(msg);
    }

    const url = new URL(request.url);
    const allowFallback =
      url.searchParams.get("fallback") === "true" ||
      request.headers.get("x-campushub-ai-fallback") === "true";

    const insights = await generateOrganizerInsights(organizer, { allowFallback });
    return successResponse(insights, "Organizer insights generated successfully");
  } catch (err: unknown) {
    if (err instanceof AstropodsError) {
      return errorResponse(err.message, err.code, err.statusCode);
    }
    return serverErrorResponse(err, "Failed to generate organizer insights");
  }
}
