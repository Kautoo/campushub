import { generateEventFaqAnswer } from "@/lib/ai/ai-service";
import { eventAssistantInputSchema } from "@/lib/ai/ai-validation";
import { AstropodsError } from "@/lib/ai/astropods-client";
import { checkAiRateLimit } from "@/lib/ai/ai-rate-limit";
import { getEventById } from "@/server/db/repository";
import { getServerUser } from "@/server/auth";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  forbiddenResponse,
} from "@/server/api-response";

export async function POST(request: Request) {
  try {
    const clientId =
      request.headers.get("x-campushub-token") ||
      request.headers.get("x-forwarded-for") ||
      "anonymous-student";

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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON payload", "INVALID_JSON", 400);
    }

    const parseResult = eventAssistantInputSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        "Invalid inquiry payload",
        "VALIDATION_ERROR",
        400,
        parseResult.error.flatten().fieldErrors
      );
    }

    const { eventId } = parseResult.data;

    const user = await getServerUser(request);
    const isAuthorizedStaff = Boolean(
      user && (user.role === "organizer" || user.role === "admin")
    );

    // Check specific event existence and published status
    if (eventId) {
      const event = await getEventById(eventId);
      if (!event) {
        return errorResponse(`Event with ID '${eventId}' not found`, "EVENT_NOT_FOUND", 404);
      }

      if (event.status !== "PUBLISHED" && !isAuthorizedStaff) {
        return forbiddenResponse(
          "Access to unpublished event FAQ assistant is restricted to organizers."
        );
      }
    }

    const url = new URL(request.url);
    const allowFallback =
      url.searchParams.get("fallback") === "true" ||
      request.headers.get("x-campushub-ai-fallback") === "true";

    const output = await generateEventFaqAnswer(parseResult.data, {
      allowFallback,
      isAuthorizedStaff,
    });
    return successResponse(output);
  } catch (err: unknown) {
    if (err instanceof AstropodsError) {
      return errorResponse(err.message, err.code, err.statusCode);
    }
    return serverErrorResponse(err, "Failed to process FAQ inquiry");
  }
}
