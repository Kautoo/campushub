/**
 * CampusHub - Core Domain and Shared TypeScript Contracts
 */

export type UserRole = "student" | "org_admin" | "super_admin";

export type ProductStatus = "draft" | "active" | "archived" | "out_of_stock";

export type CampaignStatus = "draft" | "active" | "funded" | "completed" | "cancelled";

export type OrderStatus = "pending" | "ready_for_pickup" | "dispatched" | "delivered" | "cancelled";

export type FulfillmentMethod = "pickup" | "delivery";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  category: string;
  verified: boolean;
  memberCount: number;
  contactEmail: string;
  avatarUrl: string;
  paypalConnected: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    verified: boolean;
    badge: string;
  };
  description: string;
  images: string[];
  sizes?: string[];
  inStock: boolean;
  stockCount: number;
  societyImpact: string;
  specs: ProductSpec[];
  campusPickup: boolean;
  featured?: boolean;
  batchDrop?: string;
  tags?: string[];
  aspectRatio?: "portrait" | "tall" | "square" | "landscape";
  rating?: number;
  reviewCount?: number;
  releaseModel?:
    | "In Stock"
    | "Pre-order"
    | "Limited Batch"
    | "Certified Grade"
    | "Locker Ready"
    | "Best Seller"
    | "Low Stock";
  dispatchNote?: string;
  isActive?: boolean;
  status?: ProductStatus;
  organizationId?: string;
  createdBy?: string;
}

export interface ContributionTier {
  id: string;
  title: string;
  amount: number;
  description: string;
  perks: string[];
  recommended?: boolean;
  backerCount?: number;
}

export interface CampaignUpdate {
  id: string;
  date: string;
  title: string;
  author: string;
  badge?: string;
  content: string;
  images?: string[];
}

export interface CampaignFaq {
  question: string;
  answer: string;
}

export interface BudgetAllocation {
  category: string;
  subtitle?: string;
  phase?: string;
  status?: string;
  percentage: number;
  amount: number;
  color: string;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  organization: {
    id: string;
    name: string;
    verified: boolean;
    badge: string;
  };
  category: string;
  summary: string;
  story: string;
  pullQuote?: {
    quote: string;
    attribution: string;
  };
  technicalSpecs?: {
    label: string;
    value: string;
    subtext: string;
  }[];
  goalAmount: number;
  raisedAmount: number;
  backersCount: number;
  daysLeft: number;
  featuredImage: string;
  galleryImages: string[];
  tiers: ContributionTier[];
  updates: CampaignUpdate[];
  faqs: CampaignFaq[];
  budgetBreakdown: BudgetAllocation[];
  featured?: boolean;
  matchingGrant?: string;
  linkedProductId?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  organizationName: string;
  image: string;
}

export interface OrderContribution {
  campaignId: string;
  title: string;
  amount: number;
  tierTitle?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  expiresAt?: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  items: OrderItem[];
  contribution?: OrderContribution;
  subtotal: number;
  shipping: number;
  total: number;
  currency?: string;
  fulfillmentMethod: FulfillmentMethod;
  fulfillmentLocation?: string;
  pickupPassCode?: string;
  trackingNumber?: string;
  status: OrderStatus;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  orderType?: "merchandise" | "event_registration";
  registrationId?: string;
  eventId?: string;
  paymentStatus?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  studentId?: string;
  provider: string;
  providerOrderId: string;
  providerCaptureId?: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  payerEmail?: string;
  payerName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  capturedAt?: string;
}

export interface BagItem {
  id: string; // unique item cart entry id (productId + size)
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
