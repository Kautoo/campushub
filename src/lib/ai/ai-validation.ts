import { z } from "zod";

export const eventDraftInputSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  category: z
    .string()
    .min(2, "Category is required")
    .max(60, "Category cannot exceed 60 characters"),
  date: z.string().nullish(),
  time: z.string().nullish(),
  venue: z.string().nullish(),
  targetAudience: z.string().max(200, "Target audience cannot exceed 200 characters").nullish(),
  ticketPrice: z.number().min(0, "Ticket price cannot be negative").nullish(),
  capacity: z.number().int().min(1, "Capacity must be at least 1").nullish(),
  activities: z.union([z.array(z.string()), z.string()]).nullish(),
  instructions: z.string().max(1000, "Instructions cannot exceed 1000 characters").nullish(),
  tone: z.enum(["editorial", "technical", "urgent", "casual"]).default("editorial"),
});

export const eventDraftOutputSchema = z.object({
  description: z.string().min(10, "Description is too short"),
  summary: z.string().min(10, "Summary is too short"),
  highlights: z.array(z.string()).min(1, "At least one highlight required"),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .default([]),
  promotionalAnnouncement: z.string().min(10, "Promotional announcement is too short"),
});

export const eventAssistantInputSchema = z.object({
  question: z
    .string()
    .min(2, "Question must be at least 2 characters")
    .max(500, "Question cannot exceed 500 characters"),
  eventId: z.string().nullish().transform((val) => val?.trim() || undefined),
});

export const eventAssistantOutputSchema = z.object({
  answer: z.string().min(1, "Answer cannot be empty"),
  verified: z.boolean(),
  eventTitle: z.string(),
  sources: z.array(z.string()),
});

export const organizerMetricsSchema = z.object({
  totalRevenue: z.number().min(0),
  currency: z.string(),
  totalRegistrations: z.number().int().min(0),
  confirmedRegistrations: z.number().int().min(0),
  pendingRegistrations: z.number().int().min(0),
  cancelledRegistrations: z.number().int().min(0),
  checkedInCount: z.number().int().min(0),
  activeEventsCount: z.number().int().min(0),
  eventPopularity: z.array(
    z.object({
      eventId: z.string(),
      title: z.string(),
      confirmedCount: z.number().int(),
      capacity: z.number().int(),
      fillRatePercent: z.number(),
    })
  ),
  merchandiseSales: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      unitsSold: z.number().int(),
      revenue: z.number(),
    })
  ),
});

export const organizerInsightsOutputSchema = z.object({
  metrics: organizerMetricsSchema,
  summary: z.string().min(10),
  salesTrends: z.string().min(10),
  recommendations: z.array(z.string()).min(1),
  generatedAt: z.string(),
  provider: z.string(),
});
