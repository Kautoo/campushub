import { getEvents, createEvent } from "@/server/db/repository";
import { requireOrganizer, getServerUser } from "@/server/auth";
import { successResponse, errorResponse, serverErrorResponse, forbiddenResponse, unauthorizedResponse } from "@/server/api-response";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.enum([
    "Athletics & Fun Runs",
    "Green & Community",
    "Tech & Hackathons",
    "Workshops & Design",
    "E-Sports",
    "Tech & AI",
    "General",
  ]),
  subtitle: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  totalCapacity: z.number().int().positive().optional(),
  isFree: z.boolean().optional(),
  plans: z
    .array(
      z.object({
        id: z.string(),
        code: z.string(),
        name: z.string(),
        price: z.number().min(0),
        description: z.string(),
        perks: z.array(z.string()),
      })
    )
    .optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const requestedStatus = searchParams.get("status") || "PUBLISHED";

    let status = "PUBLISHED";
    if (requestedStatus !== "PUBLISHED") {
      const user = await getServerUser(request);
      if (user && (user.role === "organizer" || user.role === "admin")) {
        status = requestedStatus;
      }
    }

    const events = await getEvents({ category, status });
    return successResponse(events);
  } catch (err) {
    return serverErrorResponse(err, "Failed to retrieve campus events");
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
    const parseResult = createEventSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse("Invalid event data", "VALIDATION_ERROR", 400, parseResult.error.flatten().fieldErrors);
    }

    try {
      const newEvent = await createEvent(parseResult.data, user);
      return successResponse(newEvent, "Event created successfully", 201);
    } catch (createErr) {
      const msg = createErr instanceof Error ? createErr.message : "Failed to create event";
      if (msg.includes("CONFLICT")) {
        return errorResponse(msg.replace(/^CONFLICT:\s*/, ""), "SCHEDULE_CONFLICT", 409);
      }
      return errorResponse(msg, "CREATE_EVENT_ERROR", 400);
    }
  } catch (err) {
    return serverErrorResponse(err, "Failed to create event");
  }
}
