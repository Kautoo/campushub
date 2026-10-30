import { getOrganizerRegistrations, toggleRegistrationCheckIn } from "@/server/db/repository";
import { requireOrganizer } from "@/server/auth";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/server/api-response";

export async function GET(request: Request) {
  try {
    let user;
    try {
      user = await requireOrganizer(request);
    } catch (authError) {
      const msg = authError instanceof Error ? authError.message : "Unauthorized";
      if (msg.startsWith("UNAUTHORIZED")) return unauthorizedResponse(msg);
      return forbiddenResponse(msg);
    }

    const registrations = await getOrganizerRegistrations(user);
    return successResponse(registrations);
  } catch (err) {
    return serverErrorResponse(err, "Failed to retrieve organizer registrations");
  }
}

export async function PATCH(request: Request) {
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
    const { registrationId } = body;
    if (!registrationId || typeof registrationId !== "string") {
      return errorResponse("registrationId is required", "VALIDATION_ERROR", 400);
    }

    try {
      const updated = await toggleRegistrationCheckIn(registrationId, user);
      return successResponse(updated, "Registration check-in status updated");
    } catch (toggleErr) {
      const msg = toggleErr instanceof Error ? toggleErr.message : "Failed to toggle check-in";
      if (msg.includes("FORBIDDEN")) return forbiddenResponse(msg);
      if (msg.includes("not found")) return notFoundResponse(msg);
      return errorResponse(msg, "TOGGLE_ERROR", 400);
    }
  } catch (err) {
    return serverErrorResponse(err, "Failed to update registration");
  }
}
