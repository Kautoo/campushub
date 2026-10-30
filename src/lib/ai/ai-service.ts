import "server-only";
import {
  EventDraftInput,
  EventDraftOutput,
  EventAssistantInput,
  EventAssistantOutput,
  OrganizerMetrics,
  OrganizerInsightsOutput,
} from "./ai-types";
import {
  eventDraftInputSchema,
  eventDraftOutputSchema,
  eventAssistantInputSchema,
  organizerInsightsOutputSchema,
} from "./ai-validation";
import {
  EVENT_DRAFT_SYSTEM_PROMPT,
  buildEventDraftUserPrompt,
  EVENT_ASSISTANT_SYSTEM_PROMPT,
  buildEventAssistantUserPrompt,
  ORGANIZER_INSIGHTS_SYSTEM_PROMPT,
  buildOrganizerInsightsUserPrompt,
} from "./ai-prompts";
import {
  isAstropodsConfigured,
  callAstropodsChat,
  callAstropodsStructured,
  AstropodsNotConfiguredError,
} from "./astropods-client";
import { getEventById, getEvents, store } from "@/server/db/repository";
import { CampusEvent } from "@/data/mockEvents";
import { CampusUser } from "@/server/auth";

export interface AIServiceOptions {
  allowFallback?: boolean;
  timeoutMs?: number;
  isAuthorizedStaff?: boolean;
}

/**
 * FEATURE A: Generates structured event drafts with Astropods AI Gateway.
 */
export async function generateEventDraft(
  input: EventDraftInput,
  options: AIServiceOptions = {}
): Promise<EventDraftOutput> {
  const validatedInput = eventDraftInputSchema.parse(input);

  if (isAstropodsConfigured()) {
    try {
      const draft = await callAstropodsStructured<EventDraftOutput>(
        {
          messages: [
            { role: "system", content: EVENT_DRAFT_SYSTEM_PROMPT },
            { role: "user", content: buildEventDraftUserPrompt(validatedInput) },
          ],
          temperature: 0.7,
          maxTokens: 1500,
        },
        (parsed) => eventDraftOutputSchema.parse(parsed),
        { timeoutMs: options.timeoutMs }
      );
      return draft;
    } catch (err) {
      if (!options.allowFallback) {
        throw err;
      }
    }
  }

  if (!options.allowFallback && !isAstropodsConfigured()) {
    throw new AstropodsNotConfiguredError();
  }

  // Deterministic domain fallback (used when Astropods API is unconfigured or in offline test mode)
  return generateDeterministicDraft(validatedInput);
}

/**
 * FEATURE B: Answers student FAQ inquiries grounded in verified event data.
 */
export async function generateEventFaqAnswer(
  input: EventAssistantInput,
  options: AIServiceOptions = {}
): Promise<EventAssistantOutput> {
  const validatedInput = eventAssistantInputSchema.parse(input);

  let targetEvent: CampusEvent | null = null;
  if (validatedInput.eventId) {
    targetEvent = await getEventById(validatedInput.eventId);
    if (!targetEvent) {
      return {
        answer: `Event with ID '${validatedInput.eventId}' was not found in the campus registry.`,
        verified: false,
        eventTitle: "Event Not Found",
        sources: [],
      };
    }
  } else {
    const published = await getEvents({ status: "PUBLISHED" });
    targetEvent = published[0] || null;
  }

  if (!targetEvent) {
    return {
      answer:
        "No active published campus event information was found in the database to answer this question.",
      verified: false,
      eventTitle: "Unknown Event",
      sources: [],
    };
  }

  if (targetEvent.status !== "PUBLISHED" && !options.isAuthorizedStaff) {
    return {
      answer:
        "This event has not been publicly released yet. Inquiries are restricted until official publication.",
      verified: false,
      eventTitle: targetEvent.title,
      sources: [`CampusHub Registry: ${targetEvent.title}`],
    };
  }

  const contextData = {
    title: targetEvent.title,
    category: targetEvent.category,
    date: `${targetEvent.date} (${targetEvent.time || "Scheduled Time"})`,
    location: targetEvent.location,
    description: targetEvent.description,
    totalCapacity: targetEvent.totalCapacity,
    plans: (targetEvent.plans || []).map((p) => ({
      name: p.name,
      price: p.price,
      description: p.description,
    })),
    question: validatedInput.question,
  };

  if (isAstropodsConfigured()) {
    try {
      const rawAnswer = await callAstropodsChat(
        {
          messages: [
            { role: "system", content: EVENT_ASSISTANT_SYSTEM_PROMPT },
            { role: "user", content: buildEventAssistantUserPrompt(contextData) },
          ],
          temperature: 0.2, // Low temperature for high factual accuracy
          maxTokens: 500,
        },
        { timeoutMs: options.timeoutMs }
      );

      const isUnavailable =
        rawAnswer.toLowerCase().includes("not specified in the current official") ||
        rawAnswer.toLowerCase().includes("cannot be verified") ||
        rawAnswer.toLowerCase().includes("not mentioned in");

      return {
        answer: rawAnswer.trim(),
        verified: !isUnavailable,
        eventTitle: targetEvent.title,
        sources: [`CampusHub Event Registry: ${targetEvent.title}`],
      };
    } catch (err) {
      if (!options.allowFallback) {
        throw err;
      }
    }
  }

  if (!options.allowFallback && !isAstropodsConfigured()) {
    throw new AstropodsNotConfiguredError();
  }

  // Grounded heuristic fallback
  return generateDeterministicFaqAnswer(contextData);
}

/**
 * FEATURE C: Calculates authoritative financial metrics and synthesizes AI organizer insights.
 */
export async function generateOrganizerInsights(
  user: CampusUser,
  options: AIServiceOptions = {}
): Promise<OrganizerInsightsOutput> {
  // 1. Backend database query: scope events & products to this organizer
  let scopedEvents = store.events;
  let scopedProducts = store.products;

  if (user.role !== "admin") {
    if (user.organizationId) {
      scopedEvents = store.events.filter((e) => e.organizationId === user.organizationId);
      scopedProducts = store.products.filter((p) => p.organizationId === user.organizationId);
    } else {
      scopedEvents = store.events.filter((e) => e.createdBy === user.id);
      scopedProducts = store.products.filter((p) => p.createdBy === user.id);
    }
  }

  const scopedEventIds = new Set(scopedEvents.map((e) => e.id));
  const scopedProductIds = new Set(scopedProducts.map((p) => p.id));

  // Registrations scoped to organizer events
  const scopedRegistrations = store.registrations.filter((r) => scopedEventIds.has(r.eventId));
  const totalRegistrations = scopedRegistrations.length;
  const confirmedRegistrations = scopedRegistrations.filter((r) => r.status === "CONFIRMED").length;
  const pendingRegistrations = scopedRegistrations.filter((r) => r.status === "PENDING_PAYMENT").length;
  const cancelledRegistrations = scopedRegistrations.filter((r) => r.status === "CANCELLED").length;
  const checkedInCount = scopedRegistrations.filter((r) => r.checkedIn).length;
  const activeEventsCount = scopedEvents.filter((e) => e.status !== "CLOSED").length;

  // Event popularity breakdown with division-by-zero protection
  const eventPopularity = scopedEvents.map((e) => {
    const confirmedCount = scopedRegistrations.filter(
      (r) => r.eventId === e.id && r.status === "CONFIRMED"
    ).length;
    const capacity = e.totalCapacity && e.totalCapacity > 0 ? e.totalCapacity : 100;
    const fillRatePercent = Math.min(100, Math.max(0, Math.round((confirmedCount / capacity) * 100)));
    return {
      eventId: e.id,
      title: e.title,
      confirmedCount,
      capacity,
      fillRatePercent,
    };
  });

  // Currency conversion map for multi-currency safety
  const FX_RATES_TO_USD: Record<string, number> = {
    USD: 1.0,
    EUR: 1.08,
    GBP: 1.28,
    CAD: 0.73,
  };

  // Merchandise sales: ONLY count paid, verified orders (strictly exclude pending, cancelled, or failed)
  const seenCaptures = new Set<string>();
  const scopedPaidOrders = store.orders.filter((o) => {
    const isCompletedStatus =
      o.status === "ready_for_pickup" ||
      o.status === "dispatched" ||
      o.status === "delivered" ||
      o.paymentStatus === "COMPLETED";

    const isNonPaid =
      o.status === "pending" ||
      o.status === "cancelled" ||
      o.paymentStatus === "FAILED";

    if (!isCompletedStatus || isNonPaid) {
      return false;
    }

    const isVerifiedPayment = Boolean(o.paypalCaptureId || o.paymentStatus === "COMPLETED");
    if (!isVerifiedPayment) {
      return false;
    }

    // Deduplicate transactions sharing the same capture ID
    if (o.paypalCaptureId) {
      if (seenCaptures.has(o.paypalCaptureId)) {
        return false;
      }
      seenCaptures.add(o.paypalCaptureId);
    }

    return o.items.some((item) => scopedProductIds.has(item.productId));
  });

  // Compute product-by-product verified revenue and unit counts
  const productSalesMap = new Map<string, { unitsSold: number; revenue: number }>();
  for (const prod of scopedProducts) {
    productSalesMap.set(prod.id, { unitsSold: 0, revenue: 0 });
  }

  for (const order of scopedPaidOrders) {
    const currency = (order.currency || "USD").toUpperCase();
    const fxRate = FX_RATES_TO_USD[currency] || 1.0;

    for (const item of order.items) {
      if (scopedProductIds.has(item.productId)) {
        const current = productSalesMap.get(item.productId) || { unitsSold: 0, revenue: 0 };
        current.unitsSold += item.quantity;
        current.revenue += item.price * item.quantity * fxRate;
        productSalesMap.set(item.productId, current);
      }
    }
  }

  const merchandiseSales = scopedProducts.map((p) => {
    const stats = productSalesMap.get(p.id) || { unitsSold: 0, revenue: 0 };
    return {
      productId: p.id,
      name: p.name,
      unitsSold: stats.unitsSold,
      revenue: Number(stats.revenue.toFixed(2)),
    };
  });

  const totalMerchRevenue = merchandiseSales.reduce((acc, curr) => acc + curr.revenue, 0);

  // Authoritative metrics calculated strictly by the backend
  const metrics: OrganizerMetrics = {
    totalRevenue: Number(totalMerchRevenue.toFixed(2)),
    currency: "USD",
    totalRegistrations,
    confirmedRegistrations,
    pendingRegistrations,
    cancelledRegistrations,
    checkedInCount,
    activeEventsCount,
    eventPopularity,
    merchandiseSales,
  };

  if (isAstropodsConfigured()) {
    try {
      const aiResponse = await callAstropodsStructured<{
        summary: string;
        salesTrends: string;
        recommendations: string[];
      }>(
        {
          messages: [
            { role: "system", content: ORGANIZER_INSIGHTS_SYSTEM_PROMPT },
            { role: "user", content: buildOrganizerInsightsUserPrompt(metrics) },
          ],
          temperature: 0.6,
          maxTokens: 1200,
        },
        (parsed) => {
          const p = parsed as Record<string, unknown>;
          if (typeof p.summary !== "string" || !Array.isArray(p.recommendations)) {
            throw new Error("Invalid structure returned by Astropods");
          }
          return {
            summary: p.summary,
            salesTrends: typeof p.salesTrends === "string" ? p.salesTrends : "Sales metrics stable.",
            recommendations: p.recommendations.map(String),
          };
        },
        { timeoutMs: options.timeoutMs }
      );

      const output: OrganizerInsightsOutput = {
        metrics,
        summary: aiResponse.summary,
        salesTrends: aiResponse.salesTrends,
        recommendations: aiResponse.recommendations,
        generatedAt: new Date().toISOString(),
        provider: "astropods-ai-gateway",
      };

      return organizerInsightsOutputSchema.parse(output);
    } catch (err) {
      if (!options.allowFallback) {
        throw err;
      }
    }
  }

  if (!options.allowFallback && !isAstropodsConfigured()) {
    throw new AstropodsNotConfiguredError();
  }

  // Deterministic analytical synthesis from verified database metrics
  return generateDeterministicInsights(metrics);
}

// -----------------------------------------------------------------------------
// DETERMINISTIC FALLBACK GENERATORS (for tests, offline mode & dev)
// -----------------------------------------------------------------------------

function generateDeterministicDraft(input: EventDraftInput): EventDraftOutput {
  const { title, category, tone = "editorial", venue = "Campus Quad", targetAudience = "Campus students" } = input;

  let description = "";
  let summary = "";
  let highlights: string[] = [];

  if (tone === "technical") {
    description = `Deep-dive engineering workshop: ${title}. Organized for ${targetAudience}, this intensive technical session covers architecture principles, live benchmarks, and collaborative coding at ${venue}. Attendees should bring their laptops and development setups.`;
    summary = `Hands-on technical workshop on ${category} featuring live architecture reviews and coding labs.`;
    highlights = [
      "Environment Setup & Architecture Deep-Dive",
      "Interactive Code Walkthrough & Real-Time Benchmarking",
      "Collaborative Builder Sprint with Technical Mentors",
      "Technical Q&A & Resource Package Distribution",
    ];
  } else if (tone === "urgent") {
    description = `⚠️ Limited Capacity Notice: ${title}. High-demand campus registration for ${targetAudience} at ${venue}. Capacity is capped to maintain optimal lab ratios. Fast-Pass digital QR badges are issued upon confirmation.`;
    summary = `High-demand campus event with priority Fast-Pass turnstile entry and restricted seating.`;
    highlights = [
      "Priority Turnstile Fast-Pass Scanning",
      "Keynote Session & Speaker Presentation",
      "Exclusive Student Builder Kit Handout",
    ];
  } else {
    description = `Join the CampusHub community for ${title}. Bringing together students and builders in ${category} at ${venue}. Featuring live showcases, insightful sessions, and networking opportunities. Welcome kits and refreshments provided for registered attendees.`;
    summary = `Premier campus ${category.toLowerCase()} symposium featuring builder showcases and networking.`;
    highlights = [
      "Doors Open & Check-In Badge Issuance",
      "Keynote & Collaborative Showcases",
      "Student Networking Lounge & Refreshments",
      "Closing Remarks & Raffle Winner Announcements",
    ];
  }

  return {
    description,
    summary,
    highlights,
    faqs: [
      {
        question: "Who can attend this event?",
        answer: `This event is open to ${targetAudience} with verified CampusHub accounts.`,
      },
      {
        question: "How do I check in at the venue?",
        answer: "Present your dynamic Fast-Pass QR code from your CampusHub account at the gate scanner.",
      },
    ],
    promotionalAnnouncement: `🚀 ${title} is now open for registration on CampusHub! Reserve your Fast-Pass badge today.`,
  };
}

function generateDeterministicFaqAnswer(context: {
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  plans: Array<{ name: string; price: number; description?: string }>;
  question: string;
}): EventAssistantOutput {
  const qLower = context.question.toLowerCase();

  if (qLower.includes("where") || qLower.includes("location") || qLower.includes("venue")) {
    return {
      answer: `${context.title} takes place at ${context.location}. Walking directions are available via CampusHub Map.`,
      verified: true,
      eventTitle: context.title,
      sources: [`CampusHub Event Registry: ${context.title}`],
    };
  }

  if (qLower.includes("when") || qLower.includes("date") || qLower.includes("time") || qLower.includes("start")) {
    return {
      answer: `${context.title} is scheduled for ${context.date}. Doors open 15 minutes before start for Fast-Pass scanning.`,
      verified: true,
      eventTitle: context.title,
      sources: [`CampusHub Event Registry: ${context.title}`],
    };
  }

  if (qLower.includes("cost") || qLower.includes("price") || qLower.includes("free") || qLower.includes("ticket") || qLower.includes("fee")) {
    if (context.plans.length > 0) {
      const planList = context.plans.map((p) => `${p.name} ($${p.price.toFixed(2)})`).join(", ");
      return {
        answer: `Registration tiers for ${context.title}: ${planList}. Passes can be secured through the CampusHub RSVP portal.`,
        verified: true,
        eventTitle: context.title,
        sources: [`CampusHub Event Registry: ${context.title}`],
      };
    }
    return {
      answer: `This event is free of charge for campus students. RSVP via the CampusHub event page.`,
      verified: true,
      eventTitle: context.title,
      sources: [`CampusHub Event Registry: ${context.title}`],
    };
  }

  if (qLower.includes("about") || qLower.includes("overview") || qLower.includes("what is") || qLower.includes("details")) {
    return {
      answer: `${context.title}: ${context.description}`,
      verified: true,
      eventTitle: context.title,
      sources: [`CampusHub Event Registry: ${context.title}`],
    };
  }

  return {
    answer: `This information is not specified in the current official event details for "${context.title}". Please contact the event organizer at ${context.location} or check back for updates.`,
    verified: false,
    eventTitle: context.title,
    sources: [`CampusHub Event Registry: ${context.title}`],
  };
}

function generateDeterministicInsights(metrics: OrganizerMetrics): OrganizerInsightsOutput {
  const topEvent = [...metrics.eventPopularity].sort((a, b) => b.fillRatePercent - a.fillRatePercent)[0];
  const topMerch = [...metrics.merchandiseSales].sort((a, b) => b.revenue - a.revenue)[0];

  if (metrics.activeEventsCount === 0 && metrics.merchandiseSales.length === 0) {
    return {
      metrics,
      summary: "No active campus events or merchandise listings are currently recorded in your organization repository.",
      salesTrends: "Telemetry data is currently empty. Create an event or list society merchandise to begin capturing real-time student conversions.",
      recommendations: [
        "Create your organization's first campus symposium or workshop via the Event Manager.",
        "Configure custom society merchandise items for campus pickup at MLK Student Union.",
        "Link your verified student organization PayPal account to accept registrations.",
      ],
      generatedAt: new Date().toISOString(),
      provider: "deterministic-analytics-engine",
    };
  }

  const summary = `Your organization currently manages ${metrics.activeEventsCount} active events with ${metrics.confirmedRegistrations} confirmed student registrations and $${metrics.totalRevenue.toFixed(2)} in verified merchandise sales. Overall attendee check-in rate is ${metrics.totalRegistrations > 0 ? Math.round((metrics.checkedInCount / metrics.totalRegistrations) * 100) : 0}%.`;

  const salesTrends = `${topEvent ? `"${topEvent.title}" leads attendee engagement with a ${topEvent.fillRatePercent}% capacity fill rate (${topEvent.confirmedCount}/${topEvent.capacity} seats reserved).` : "No active events."} ${topMerch && topMerch.unitsSold > 0 ? `Merchandise sales are driven primarily by "${topMerch.name}" generating $${topMerch.revenue.toFixed(2)} across ${topMerch.unitsSold} units.` : "Merchandise inventory has positive stock availability ready for campus distribution."}`;

  const recommendations = [
    topEvent && topEvent.fillRatePercent > 75
      ? `High demand on "${topEvent.title}" (${topEvent.fillRatePercent}% full) — consider releasing a VIP overflow tier or secondary session.`
      : "Send an automated RSVP reminder 24 hours prior to upcoming events to boost gate turnstile check-in rates.",
    "Promote smart locker pickup at MLK Student Union to reduce physical merchandise distribution queues.",
    "Introduce early-bird bundle passes pairing event registration with official club apparel to increase average order values.",
  ];

  return {
    metrics,
    summary,
    salesTrends,
    recommendations,
    generatedAt: new Date().toISOString(),
    provider: "deterministic-analytics-engine",
  };
}
