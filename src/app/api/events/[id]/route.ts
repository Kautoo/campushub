import { getEventById, updateEvent, deleteEvent } from "@/server/db/repository";
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

const updateEventSchema = z.object({
  title: z.string().min(3).optional(),
  subtitle: z.string().optional(),
  description: z.string().min(10).optional(),
  category: z
    .enum([
      "Athletics & Fun Runs",
      "Green & Community",
      "Tech & Hackathons",
      "Workshops & Design",
      "E-Sports",
      "Tech & AI",
      "General",
    ])
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  totalCapacity: z.number().int().positive().optional(),
  isFree: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await getEventById(id);
    if (!event) {
      return notFoundResponse(`Event with ID "${id}" was not found.`);
    }

    // Hide draft events from non-organizers
    if (event.status && event.status !== "PUBLISHED") {
      const user = await getServerUser(request);
      if (!user || (user.role !== "organizer" && user.role !== "admin")) {
        return notFoundResponse(`Event with ID "${id}" was not found.`);
      }
    }

    return successResponse(event);
  } catch (err) {
    return serverErrorResponse(err, "Failed to retrieve event details");
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
    const parseResult = updateEventSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse("Invalid update payload", "VALIDATION_ERROR", 400, parseResult.error.flatten().fieldErrors);
    }

    try {
      const updated = await updateEvent(id, parseResult.data, user);
      return successResponse(updated, "Event updated successfully");
    } catch (updateErr) {
      const msg = updateErr instanceof Error ? updateErr.message : "Failed to update event";
      if (msg.includes("FORBIDDEN")) {
        return forbiddenResponse(msg);
      }
      if (msg.includes("not found")) {
        return notFoundResponse(msg);
      }
      if (msg.includes("CONFLICT")) {
        return errorResponse(msg.replace(/^CONFLICT:\s*/, ""), "SCHEDULE_CONFLICT", 409);
      }
      return errorResponse(msg, "UPDATE_ERROR", 400);
    }
  } catch (err) {
    return serverErrorResponse(err, "Failed to update event");
  }
}

export async function DELETE(
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

    try {
      const deleted = await deleteEvent(id, user);
      return successResponse(deleted, "Event deleted successfully");
    } catch (delErr) {
      const msg = delErr instanceof Error ? delErr.message : "Failed to delete event";
      if (msg.includes("FORBIDDEN")) {
        return forbiddenResponse(msg);
      }
      if (msg.includes("not found")) {
        return notFoundResponse(msg);
      }
      return errorResponse(msg, "DELETE_ERROR", 400);
    }
  } catch (err) {
    return serverErrorResponse(err, "Failed to delete event");
  }
}
