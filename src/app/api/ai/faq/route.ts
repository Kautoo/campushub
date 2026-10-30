import { answerEventFaq } from "@/server/ai";
import { getEventById, getEvents } from "@/server/db/repository";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/server/api-response";
import { z } from "zod";

const faqSchema = z.object({
  eventId: z.string().optional(),
  question: z.string().min(2, "Question is too short"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = faqSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse("Invalid question payload", "VALIDATION_ERROR", 400, parseResult.error.flatten().fieldErrors);
    }

    const { eventId, question } = parseResult.data;

    let targetEvent = null;
    if (eventId) {
      targetEvent = await getEventById(eventId);
    }

    // If no specific eventId, find matching event or use primary published event
    if (!targetEvent) {
      const allEvents = await getEvents({ status: "PUBLISHED" });
      targetEvent = allEvents[0];
    }

    if (!targetEvent) {
      return successResponse({
        answer: "No active published campus event information was found in the database to answer this question.",
        verified: false,
        sources: [],
      });
    }

    const output = await answerEventFaq({
      eventId: targetEvent.id,
      eventTitle: targetEvent.title,
      eventDescription: targetEvent.description,
      eventLocation: targetEvent.location,
      eventDate: targetEvent.date,
      plans: targetEvent.plans.map((p) => ({
        name: p.name,
        price: p.price,
        description: p.description,
      })),
      question,
    });

    return successResponse(output);
  } catch (err) {
    return serverErrorResponse(err, "Failed to process FAQ inquiry");
  }
}
