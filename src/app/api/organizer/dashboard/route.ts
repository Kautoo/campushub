import { getOrganizerStats } from "@/server/db/repository";
import { requireOrganizer } from "@/server/auth";
import {
  successResponse,
  serverErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
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

    const stats = await getOrganizerStats(user);
    return successResponse(stats);
  } catch (err) {
    return serverErrorResponse(err, "Failed to retrieve organizer dashboard metrics");
  }
}
