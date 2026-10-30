export interface EventDraftInput {
  title: string;
  category: string;
  date?: string | null;
  time?: string | null;
  venue?: string | null;
  targetAudience?: string | null;
  ticketPrice?: number | null;
  capacity?: number | null;
  activities?: string[] | string | null;
  instructions?: string | null;
  tone?: "editorial" | "technical" | "urgent" | "casual";
}

export interface EventDraftOutput {
  description: string;
  summary: string;
  highlights: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  promotionalAnnouncement: string;
}

export interface EventAssistantInput {
  question: string;
  eventId?: string;
}

export interface EventAssistantOutput {
  answer: string;
  verified: boolean;
  eventTitle: string;
  sources: string[];
}

export interface OrganizerMetrics {
  totalRevenue: number;
  currency: string;
  totalRegistrations: number;
  confirmedRegistrations: number;
  pendingRegistrations: number;
  cancelledRegistrations: number;
  checkedInCount: number;
  activeEventsCount: number;
  eventPopularity: Array<{
    eventId: string;
    title: string;
    confirmedCount: number;
    capacity: number;
    fillRatePercent: number;
  }>;
  merchandiseSales: Array<{
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
  }>;
}

export interface OrganizerInsightsOutput {
  metrics: OrganizerMetrics;
  summary: string;
  salesTrends: string;
  recommendations: string[];
  generatedAt: string;
  provider: string;
}

export interface AstropodsClientConfig {
  apiKey?: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export interface AstropodsChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AstropodsChatRequest {
  messages: AstropodsChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" | "text" };
}
