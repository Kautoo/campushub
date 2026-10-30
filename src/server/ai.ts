import "server-only";
import { generateEventDraft, generateEventFaqAnswer } from "@/lib/ai/ai-service";

export interface EventWriterInput {
  title: string;
  category: string;
  tone: "editorial" | "technical" | "urgent";
  highlights?: string;
  targetAudience?: string;
}

export interface EventWriterOutput {
  pitch: string;
  summary: string;
  scheduleHighlights: string[];
  suggestedTiers?: {
    name: string;
    price: number;
    description: string;
  }[];
}

export interface EventFaqInput {
  eventId?: string;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventDate: string;
  plans?: { name: string; price: number; description: string }[];
  question: string;
}

export interface EventFaqOutput {
  answer: string;
  verified: boolean;
  sources: string[];
}

/**
 * AI Event Writer: generates structured descriptions, schedule highlights, and tier suggestions.
 * Delegates to the unified CampusHub AI Copilot service layer.
 */
export async function generateEventCopy(input: EventWriterInput): Promise<EventWriterOutput> {
  const result = await generateEventDraft(
    {
      title: input.title,
      category: input.category,
      tone: input.tone,
      instructions: input.highlights,
      targetAudience: input.targetAudience,
    },
    { allowFallback: true }
  );

  return {
    pitch: result.description,
    summary: result.summary,
    scheduleHighlights: result.highlights,
    suggestedTiers: [
      {
        name: "Standard Student Access",
        price: 0,
        description: "General admission pass with badge and digital materials.",
      },
      {
        name: "VIP Builder Pass",
        price: 15,
        description: "Priority front-row seating, custom collegiate tee, and mentor lounge pass.",
      },
    ],
  };
}

/**
 * Event FAQ Assistant: answers student questions strictly using public event context.
 * Delegates to the unified CampusHub AI Copilot service layer.
 */
export async function answerEventFaq(input: EventFaqInput): Promise<EventFaqOutput> {
  const result = await generateEventFaqAnswer(
    {
      question: input.question,
      eventId: input.eventId,
    },
    { allowFallback: true }
  );

  return {
    answer: result.answer,
    verified: result.verified,
    sources: result.sources,
  };
}
