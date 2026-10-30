import { createRegistration } from "@/server/db/repository";
import { requireAuth } from "@/server/auth";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/server/api-response";
import { z } from "zod";

const registrationSchema = z.object({
  eventId: z.string().min(1, "eventId is required"),
  planId: z.string().min(1, "planId is required"),
  teeSize: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    let user;
    try {
      user = await requireAuth(request);
    } catch {
      return unauthorizedResponse("Authentication required to RSVP/register for events.");
    }

    const body = await request.json();
    const parseResult = registrationSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse("Invalid registration payload", "VALIDATION_ERROR", 400, parseResult.error.flatten().fieldErrors);
    }

    const { eventId, planId, teeSize } = parseResult.data;

    try {
      const registration = await createRegistration({
        eventId,
        studentId: user.studentId,
        studentName: user.name,
        studentEmail: user.email,
        planId,
        teeSize,
      });

      return successResponse(registration, "Registration confirmed successfully", 201);
    } catch (regError) {
      const msg = regError instanceof Error ? regError.message : "Registration failed";
      if (msg.includes("DUPLICATE_REGISTRATION")) {
        return errorResponse(msg, "DUPLICATE_REGISTRATION", 409);
      }
      if (msg.includes("EVENT_CAPACITY_EXCEEDED")) {
        return errorResponse(msg, "EVENT_CAPACITY_EXCEEDED", 409);
      }
      if (msg.includes("EVENT_NOT_ACCEPTING_REGISTRATIONS")) {
        return errorResponse(msg, "EVENT_NOT_ACCEPTING_REGISTRATIONS", 400);
      }
      if (msg.includes("INVALID_PLAN")) {
        return errorResponse(msg, "INVALID_PLAN", 400);
      }
      return errorResponse(msg, "REGISTRATION_ERROR", 400);
    }
  } catch (err) {
    return serverErrorResponse(err, "Failed to register for event");
  }
}
