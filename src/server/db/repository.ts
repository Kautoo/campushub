import "server-only";
import { CAMPUS_EVENTS, CampusEvent } from "@/data/mockEvents";
import { MOCK_PRODUCTS, MOCK_ORGANIZATIONS } from "@/data/mockData";
import { Product, Order, OrderItem, Organization } from "@/types";
import { CampusUser } from "@/server/auth";
import { checkScheduleConflict } from "@/lib/calendar/conflict-detector";

export interface StoredRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  planId: string;
  planName: string;
  planPrice: number;
  currency: string;
  teeSize?: string;
  passCode: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";
  checkedIn: boolean;
  orderId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  confirmedAt?: string;
  createdAt: string;
}

// In-memory data store for safe fallback / offline / test mode
interface InMemoryStore {
  events: CampusEvent[];
  products: Product[];
  organizations: Organization[];
  registrations: StoredRegistration[];
  orders: Order[];
  payments: {
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
  }[];
  reconciliationQueue: {
    paypalOrderId: string;
    captureId: string;
    internalOrderId: string;
    error: string;
    createdAt: string;
  }[];
}

// Global singleton to preserve in-memory changes across hot reloads in development
const globalForStore = globalThis as unknown as { __campushubStore?: InMemoryStore };

function initStore(): InMemoryStore {
  const initialEvents: CampusEvent[] = JSON.parse(JSON.stringify(CAMPUS_EVENTS));
  const initialProducts: Product[] = JSON.parse(JSON.stringify(MOCK_PRODUCTS)).map((p: Product) => {
    // Associate products with organizations
    const orgId = p.organization?.id || (p.category === "Apparel" ? "org_engineering" : "org_sustainable");
    return {
      ...p,
      organizationId: orgId,
      createdBy: orgId === "org_engineering" ? "usr_organizer_sarah" : "usr_organizer_elena",
    };
  });

  return {
    events: initialEvents,
    products: initialProducts,
    organizations: JSON.parse(JSON.stringify(MOCK_ORGANIZATIONS)),
    registrations: [
      {
        id: "reg_default_1",
        eventId: "neon_fun_run_5k",
        eventTitle: "Neon 5K Campus Fun Run & Night Lights",
        eventDate: "Saturday, Nov 8, 2025",
        eventTime: "6:30 PM PST",
        eventLocation: "Main Quad Archway → Lake Lagunita Loop",
        studentId: "#STU-882194",
        studentName: "Alex Rivera",
        studentEmail: "arivera27@stanford.edu",
        planId: "plan_b",
        planName: "Tech Tee + Finisher Medal + Acai Bowl",
        planPrice: 22.0,
        currency: "USD",
        teeSize: "M",
        passCode: "FASTPASS-NEON-882194",
        status: "CONFIRMED",
        checkedIn: false,
        createdAt: new Date().toISOString(),
      },
    ],
    orders: [
      {
        id: "ord_sample_101",
        orderNumber: "CH-2025-882194",
        createdAt: "Today at 2:14 PM",
        studentName: "Alex Rivera",
        studentEmail: "arivera27@stanford.edu",
        studentId: "#STU-882194",
        items: [
          {
            id: "item_1",
            productId: "prod_archival_hoodie",
            name: "Heavyweight Archival Hoodie",
            price: 61.2,
            quantity: 1,
            size: "M",
            organizationName: "Stanford Student Store",
            image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
          },
        ],
        subtotal: 61.2,
        shipping: 0.0,
        total: 61.2,
        fulfillmentMethod: "pickup",
        fulfillmentLocation: "Student Union Hub A — Compartment #B-104",
        pickupPassCode: "LOCKER-B104-PIN-8492",
        status: "ready_for_pickup",
        paymentStatus: "COMPLETED",
        currency: "USD",
        paypalOrderId: "SANDBOX-CH-882194",
        paypalCaptureId: "CAP-SB-882194",
      },
    ],
    payments: [],
    reconciliationQueue: [],
  };
}

export const store: InMemoryStore =
  globalForStore.__campushubStore ?? (globalForStore.__campushubStore = initStore());

export function isDatabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    anonKey &&
    !url.includes("your-project-id") &&
    !anonKey.includes("your-supabase-anon-key")
  );
}

// -----------------------------------------------------------------------------
// EVENT REPOSITORY
// -----------------------------------------------------------------------------

export async function getEvents(filters: { status?: string; category?: string; organizationId?: string } = {}) {
  let list = store.events;
  if (filters.status) {
    list = list.filter((e) => (e.status || "PUBLISHED") === filters.status);
  }
  if (filters.category) {
    list = list.filter((e) => e.category === filters.category);
  }
  if (filters.organizationId) {
    list = list.filter((e) => e.organizationId === filters.organizationId);
  }
  return list;
}

export async function getEventById(id: string) {
  return store.events.find((e) => e.id === id || e.slug === id) || null;
}

export async function validateEventSchedule(
  schedule: {
    id?: string;
    title?: string;
    location?: string;
    date?: string;
    time?: string;
    endTime?: string;
    organizationId?: string;
  },
  excludeEventId?: string
) {
  return checkScheduleConflict(store.events, schedule, excludeEventId);
}

export async function createEvent(data: Partial<CampusEvent>, user?: CampusUser) {
  if (!data.title || !data.category) {
    throw new Error("Missing required event fields: title and category are required.");
  }

  const orgId = data.organizationId || user?.organizationId || "org_engineering";

  // Enforce conflict detection on backend
  const conflictCheck = checkScheduleConflict(store.events, {
    title: data.title,
    location: data.location || "Main Campus Quad",
    date: data.date || "Upcoming Date",
    time: data.time || "18:00 PST",
    organizationId: orgId,
  });

  if (conflictCheck.hasConflict) {
    throw new Error(`CONFLICT: ${conflictCheck.reason}`);
  }

  const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const newEvent: CampusEvent = {
    id: data.id || `event_${Date.now()}`,
    slug,
    title: data.title,
    subtitle: data.subtitle || "",
    description: data.description || "",
    category: data.category as CampusEvent["category"],
    date: data.date || "Upcoming Date",
    month: data.month || "NOV",
    dayNumber: data.dayNumber || 15,
    dayOfWeek: data.dayOfWeek || "SAT",
    fullDayName: data.fullDayName || "Saturday",
    time: data.time || "18:00 PST",
    location: data.location || "Main Campus Quad",
    venueHref: data.venueHref || "/map",
    organizer: data.organizer || user?.name || "CampusHub Society",
    organizationId: orgId,
    createdBy: user?.id || "usr_organizer_sarah",
    currency: data.currency || "USD",
    isFree: data.isFree ?? false,
    totalCapacity: data.totalCapacity || 100,
    registeredCount: data.registeredCount !== undefined ? data.registeredCount : 0,
    image:
      data.image ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    plans: data.plans || [
      {
        id: "plan_default",
        code: "STANDARD",
        name: "General Admission",
        price: data.isFree ? 0 : 10,
        description: "Official campus registration entry.",
        perks: ["Entry Pass", "Campus Check-in"],
      },
    ],
    hasTeeSize: data.hasTeeSize ?? false,
    status: data.status || "DRAFT",
  };

  store.events.unshift(newEvent);
  return newEvent;
}

export async function updateEvent(id: string, updates: Partial<CampusEvent>, user?: CampusUser) {
  const index = store.events.findIndex((e) => e.id === id || e.slug === id);
  if (index === -1) {
    throw new Error(`Event with id "${id}" not found.`);
  }

  const existingEvent = store.events[index];

  // Enforce organizer authorization: only admin or the event owner / organization can update
  if (user && user.role !== "admin") {
    const isOwner =
      (existingEvent.createdBy && existingEvent.createdBy === user.id) ||
      (existingEvent.organizationId && existingEvent.organizationId === user.organizationId);

    if (!isOwner) {
      throw new Error("FORBIDDEN: You do not have permission to modify this event.");
    }
  }

  // Validate schedule conflicts if date, time, or location are being changed
  const targetLocation = updates.location !== undefined ? updates.location : existingEvent.location;
  const targetDate = updates.date !== undefined ? updates.date : existingEvent.date;
  const targetTime = updates.time !== undefined ? updates.time : existingEvent.time;
  const targetOrgId = updates.organizationId || existingEvent.organizationId;

  const conflictCheck = checkScheduleConflict(
    store.events,
    {
      id: existingEvent.id,
      title: updates.title || existingEvent.title,
      location: targetLocation,
      date: targetDate,
      time: targetTime,
      organizationId: targetOrgId,
    },
    existingEvent.id
  );

  if (conflictCheck.hasConflict) {
    throw new Error(`CONFLICT: ${conflictCheck.reason}`);
  }

  const updated = { ...existingEvent, ...updates };
  store.events[index] = updated;
  return updated;
}

export async function deleteEvent(id: string, user?: CampusUser) {
  const index = store.events.findIndex((e) => e.id === id || e.slug === id);
  if (index === -1) {
    throw new Error(`Event with id "${id}" not found.`);
  }

  const existingEvent = store.events[index];

  // Enforce organizer authorization: only admin or the event owner / organization can delete
  if (user && user.role !== "admin") {
    const isOwner =
      (existingEvent.createdBy && existingEvent.createdBy === user.id) ||
      (existingEvent.organizationId && existingEvent.organizationId === user.organizationId);

    if (!isOwner) {
      throw new Error("FORBIDDEN: You do not have permission to delete this event.");
    }
  }

  const deleted = store.events.splice(index, 1)[0];
  return deleted;
}

// -----------------------------------------------------------------------------
// PRODUCT REPOSITORY
// -----------------------------------------------------------------------------

export async function getProducts(filters: { category?: string; inStock?: boolean; isActive?: boolean } = {}) {
  let list = store.products;
  if (filters.isActive !== undefined) {
    list = list.filter((p) => (p.isActive ?? true) === filters.isActive);
  } else {
    list = list.filter((p) => p.isActive !== false);
  }
  if (filters.category && filters.category !== "All" && filters.category !== "All Collection") {
    list = list.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters.inStock !== undefined) {
    list = list.filter((p) => p.inStock === filters.inStock);
  }
  return list;
}

export async function getProductById(id: string) {
  return store.products.find((p) => p.id === id || p.slug === id) || null;
}

export async function createProduct(data: Partial<Product>, user?: CampusUser) {
  if (!data.name || data.price === undefined || !data.category) {
    throw new Error("Missing required product fields: name, price, and category.");
  }

  const orgId = data.organizationId || user?.organizationId || "org_engineering";
  const org = store.organizations.find((o) => o.id === orgId) || {
    id: orgId,
    name: "Stanford Student Store",
    slug: "stanford-student-store",
    verified: true,
    badge: "Locker Ready",
  };

  const newProduct: Product = {
    id: data.id || `prod_${Date.now()}`,
    name: data.name,
    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    price: Number(data.price),
    originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
    category: data.category,
    organizationId: orgId,
    createdBy: user?.id || "usr_organizer_sarah",
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      verified: org.verified,
      badge: "Locker Ready",
    },
    description: data.description || "",
    images: data.images && data.images.length > 0
      ? data.images
      : ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80"],
    sizes: data.sizes || ["S", "M", "L", "XL"],
    inStock: (data.stockCount ?? 25) > 0 ? (data.inStock ?? true) : false,
    stockCount: data.stockCount ?? 25,
    societyImpact: data.societyImpact || "100% of proceeds fund student community initiatives.",
    specs: data.specs || [],
    campusPickup: data.campusPickup ?? true,
    isActive: data.isActive ?? true,
  };

  store.products.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>, user?: CampusUser) {
  const index = store.products.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) {
    throw new Error(`Product with id "${id}" not found.`);
  }

  const existingProduct = store.products[index];

  // Enforce organizer authorization: only admin or product's organization can update
  if (user && user.role !== "admin") {
    const prodOrgId = existingProduct.organizationId || existingProduct.organization?.id;
    const isOwner =
      (existingProduct.createdBy && existingProduct.createdBy === user.id) ||
      (prodOrgId && prodOrgId === user.organizationId);

    if (!isOwner) {
      throw new Error("FORBIDDEN: You do not have permission to modify this product.");
    }
  }

  const newStockCount = updates.stockCount !== undefined ? updates.stockCount : existingProduct.stockCount;
  const inStock = newStockCount > 0 ? (updates.inStock !== undefined ? updates.inStock : existingProduct.inStock) : false;

  const updated = {
    ...existingProduct,
    ...updates,
    stockCount: newStockCount,
    inStock,
  };

  store.products[index] = updated;
  return updated;
}

// -----------------------------------------------------------------------------
// EVENT REGISTRATION REPOSITORY
// -----------------------------------------------------------------------------

export async function getRegistrations(filters: { studentId?: string; eventId?: string } = {}) {
  let list = store.registrations;
  if (filters.studentId) {
    list = list.filter((r) => r.studentId === filters.studentId);
  }
  if (filters.eventId) {
    list = list.filter((r) => r.eventId === filters.eventId);
  }
  return list;
}

export async function createRegistration({
  eventId,
  studentId,
  studentName,
  studentEmail,
  planId,
  teeSize,
  orderId,
  paypalOrderId,
}: {
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  planId: string;
  teeSize?: string;
  orderId?: string;
  paypalOrderId?: string;
}) {
  const event = store.events.find((e) => e.id === eventId || e.slug === eventId);
  if (!event) {
    throw new Error("Event not found.");
  }

  // Enforce publication status: registrations allowed only on published events
  if (event.status && event.status !== "PUBLISHED") {
    throw new Error("EVENT_NOT_ACCEPTING_REGISTRATIONS: This event is currently closed or not published for registrations.");
  }

  // Prevent duplicate registrations
  const existing = store.registrations.find(
    (r) => r.eventId === event.id && r.studentId === studentId && r.status !== "CANCELLED"
  );
  if (existing) {
    throw new Error("DUPLICATE_REGISTRATION: You are already registered for this campus event.");
  }

  // Capacity check
  if (event.registeredCount >= event.totalCapacity) {
    throw new Error("EVENT_CAPACITY_EXCEEDED: This event has reached full capacity.");
  }

  // Strict plan validation: must match an existing plan for this event
  const selectedPlan = event.plans.find((p) => p.id === planId);
  if (!selectedPlan) {
    throw new Error("INVALID_PLAN: The selected ticket plan does not exist for this event.");
  }

  // Atomically increment registered count
  event.registeredCount += 1;

  const registrationRecord: StoredRegistration = {
    id: `reg_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    eventLocation: event.location,
    studentId,
    studentName,
    studentEmail,
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    planPrice: selectedPlan.price,
    currency: event.currency || "USD",
    teeSize,
    passCode: `FASTPASS-${event.id.toUpperCase().substring(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`,
    status: (selectedPlan.price > 0 ? "PENDING_PAYMENT" : "CONFIRMED"),
    checkedIn: false,
    orderId,
    paypalOrderId,
    createdAt: new Date().toISOString(),
  };

  store.registrations.unshift(registrationRecord);
  return registrationRecord;
}

export async function confirmRegistrationPayment(
  registrationIdOrOrderId: string,
  paymentDetails: {
    paypalCaptureId: string;
    paypalOrderId?: string;
  }
) {
  const reg = store.registrations.find(
    (r) =>
      r.id === registrationIdOrOrderId ||
      r.orderId === registrationIdOrOrderId ||
      (paymentDetails.paypalOrderId && r.paypalOrderId === paymentDetails.paypalOrderId)
  );

  if (!reg) return null;

  if (reg.status === "CONFIRMED") return reg;

  reg.status = "CONFIRMED";
  reg.paypalCaptureId = paymentDetails.paypalCaptureId;
  if (paymentDetails.paypalOrderId) {
    reg.paypalOrderId = paymentDetails.paypalOrderId;
  }
  reg.confirmedAt = new Date().toISOString();
  return reg;
}

// -----------------------------------------------------------------------------
// ORDER REPOSITORY
// -----------------------------------------------------------------------------

export async function getOrders(filters: { studentId?: string } = {}) {
  let list = store.orders;
  if (filters.studentId) {
    list = list.filter((o) => o.studentId === filters.studentId);
  }
  return list;
}

export async function getOrderById(id: string) {
  return store.orders.find((o) => o.id === id || o.orderNumber === id || o.paypalOrderId === id) || null;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const order = store.orders.find((o) => o.id === id || o.orderNumber === id || o.paypalOrderId === id);
  if (!order) return null;
  Object.assign(order, updates);
  return order;
}

export async function createEventOrder(params: {
  eventId: string;
  planId: string;
  teeSize?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  paypalOrderId?: string;
}) {
  const {
    eventId,
    planId,
    teeSize,
    studentId,
    studentName,
    studentEmail,
    paypalOrderId,
  } = params;

  const event = store.events.find((e) => e.id === eventId || e.slug === eventId);
  if (!event) {
    throw new Error("Event not found.");
  }

  if (event.status && event.status !== "PUBLISHED") {
    throw new Error("EVENT_NOT_ACCEPTING_REGISTRATIONS: This event is currently closed or not published for registrations.");
  }

  const existing = store.registrations.find(
    (r) => r.eventId === event.id && r.studentId === studentId && r.status !== "CANCELLED"
  );
  if (existing) {
    throw new Error("DUPLICATE_REGISTRATION: You are already registered for this campus event.");
  }

  if (event.registeredCount >= event.totalCapacity) {
    throw new Error("EVENT_CAPACITY_EXCEEDED: This event has reached full capacity.");
  }

  const selectedPlan = event.plans.find((p) => p.id === planId);
  if (!selectedPlan) {
    throw new Error("INVALID_PLAN: The selected ticket plan does not exist for this event.");
  }

  // Increment capacity held during checkout
  event.registeredCount += 1;

  const orderId = `ord_evt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  const orderNumber = `CH-EVT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const passCode = `FASTPASS-${event.id.toUpperCase().substring(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`;

  const registrationRecord: StoredRegistration = {
    id: `reg_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    eventLocation: event.location,
    studentId,
    studentName,
    studentEmail,
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    planPrice: selectedPlan.price,
    currency: event.currency || "USD",
    teeSize,
    passCode,
    status: selectedPlan.price > 0 ? "PENDING_PAYMENT" : "CONFIRMED",
    checkedIn: false,
    orderId,
    paypalOrderId,
    createdAt: new Date().toISOString(),
  };

  store.registrations.unshift(registrationRecord);

  const orderItem: OrderItem = {
    id: `item_evt_${Date.now()}`,
    productId: event.id,
    name: `${event.title} - ${selectedPlan.name}`,
    price: selectedPlan.price,
    quantity: 1,
    size: teeSize,
    organizationName: event.organizer,
    image: event.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
  };

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    studentName,
    studentEmail,
    studentId,
    items: [orderItem],
    subtotal: selectedPlan.price,
    shipping: 0,
    total: selectedPlan.price,
    currency: event.currency || "USD",
    fulfillmentMethod: "pickup",
    fulfillmentLocation: event.location,
    pickupPassCode: passCode,
    status: selectedPlan.price > 0 ? "pending" : "ready_for_pickup",
    orderType: "event_registration",
    registrationId: registrationRecord.id,
    eventId: event.id,
    paymentStatus: selectedPlan.price > 0 ? "PENDING" : "COMPLETED",
    paypalOrderId,
  };

  store.orders.unshift(newOrder);

  return { order: newOrder, registration: registrationRecord };
}

export async function createInternalOrder(params: {
  studentName: string;
  studentEmail: string;
  studentId: string;
  items?: {
    productId?: string;
    name?: string;
    price?: number;
    quantity: number;
    selectedSize?: string;
  }[];
  shipping?: number;
  contribution?: {
    campaignId: string;
    title: string;
    amount: number;
    tierTitle?: string;
  };
  fulfillmentMethod?: "pickup" | "delivery";
  fulfillmentLocation?: string;
  paypalOrderId?: string;
  orderType?: "merchandise" | "event_registration";
  eventId?: string;
  planId?: string;
  teeSize?: string;
}) {
  if (params.orderType === "event_registration" || (params.eventId && params.planId)) {
    const res = await createEventOrder({
      eventId: params.eventId!,
      planId: params.planId!,
      teeSize: params.teeSize,
      studentId: params.studentId,
      studentName: params.studentName,
      studentEmail: params.studentEmail,
      paypalOrderId: params.paypalOrderId,
    });
    return res.order;
  }

  const {
    studentName,
    studentEmail,
    studentId,
    items,
    shipping = 0,
    contribution,
    fulfillmentMethod = "pickup",
    fulfillmentLocation = "Student Union Hub A — Compartment #B-104",
    paypalOrderId,
  } = params;

  if (!items || items.length === 0) {
    throw new Error("VALIDATION_ERROR: Order must contain at least one item.");
  }

  // 1. Authoritative catalogue verification & atomic inventory check
  const verifiedProducts: { product: Product; requestedQty: number; selectedSize?: string }[] = [];

  for (const item of items) {
    if (!item.productId) {
      throw new Error("VALIDATION_ERROR: productId is required for every order item.");
    }
    const dbProduct = store.products.find((p) => p.id === item.productId || p.slug === item.productId);
    if (!dbProduct) {
      throw new Error(`PRODUCT_NOT_FOUND: Product "${item.productId}" was not found in the campus catalogue.`);
    }
    if (item.quantity <= 0) {
      throw new Error(`VALIDATION_ERROR: Invalid quantity ${item.quantity} for product "${dbProduct.name}".`);
    }
    if (!dbProduct.inStock || dbProduct.stockCount < item.quantity) {
      throw new Error(`OUT_OF_STOCK: Insufficient inventory for "${dbProduct.name}". Available: ${dbProduct.stockCount}, Requested: ${item.quantity}`);
    }
    verifiedProducts.push({ product: dbProduct, requestedQty: item.quantity, selectedSize: item.selectedSize });
  }

  // 2. Decrement inventory atomically and build order items
  const orderItems: OrderItem[] = verifiedProducts.map(({ product: dbProduct, requestedQty, selectedSize }, idx) => {
    // Atomically decrement stock
    dbProduct.stockCount -= requestedQty;
    if (dbProduct.stockCount <= 0) {
      dbProduct.inStock = false;
    }

    // Authoritative pricing: apply standard 10% student benefit to DB unit price
    const unitPrice = Number((dbProduct.price * 0.9).toFixed(2));
    const orgName = dbProduct.organization?.name || "CampusHub Store";
    const img = dbProduct.images?.[0] || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80";

    return {
      id: `item_${Date.now()}_${idx}`,
      productId: dbProduct.id,
      name: dbProduct.name,
      price: unitPrice,
      quantity: requestedQty,
      size: selectedSize,
      organizationName: orgName,
      image: img,
    };
  });

  const subtotal = Number(
    orderItems.reduce((acc, it) => acc + it.price * it.quantity, 0).toFixed(2)
  );
  const contributionAmount = contribution ? Number(contribution.amount.toFixed(2)) : 0.0;
  const shippingAmount = Number(shipping.toFixed(2));
  const total = Number((subtotal + shippingAmount + contributionAmount).toFixed(2));

  const orderId = `ord_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  const orderNumber = `CH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const pickupPassCode = `LOCKER-${Math.random().toString(36).substring(2, 6).toUpperCase()}-PIN-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    studentName,
    studentEmail,
    studentId,
    items: orderItems,
    contribution,
    subtotal,
    shipping: shippingAmount,
    total,
    currency: "USD",
    fulfillmentMethod,
    fulfillmentLocation,
    pickupPassCode,
    status: "pending",
    orderType: "merchandise",
    paymentStatus: "PENDING",
    paypalOrderId,
  };

  store.orders.unshift(newOrder);
  return newOrder;
}

export async function markOrderPaid(
  orderId: string,
  paypalData: {
    paypalCaptureId: string;
    paypalOrderId?: string;
    payerEmail?: string;
    payerName?: string;
    verifiedAmount?: number;
    verifiedCurrency?: string;
  }
) {
  const order = store.orders.find((o) => o.id === orderId || o.paypalOrderId === orderId);
  if (!order) {
    throw new Error(`Order "${orderId}" not found.`);
  }

  // Idempotency: if already paid, return without mutating
  if (order.status === "ready_for_pickup" || order.status === "dispatched" || order.paymentStatus === "COMPLETED") {
    return order;
  }

  // Verification: verify amount and currency match internal order
  if (paypalData.verifiedAmount !== undefined) {
    const diff = Math.abs(paypalData.verifiedAmount - order.total);
    if (diff > 0.01) {
      throw new Error(`PAYMENT_AMOUNT_MISMATCH: Captured amount ${paypalData.verifiedAmount} does not match expected order total ${order.total}`);
    }
  }
  const expectedCurrency = (order.currency || "USD").toUpperCase();
  if (paypalData.verifiedCurrency && paypalData.verifiedCurrency.toUpperCase() !== expectedCurrency) {
    throw new Error(`PAYMENT_CURRENCY_MISMATCH: Captured currency ${paypalData.verifiedCurrency} does not match expected currency ${expectedCurrency}`);
  }

  // Idempotency & security: ensure capture ID is not stolen or reused across different orders
  const existingPaymentWithCapture = store.payments.find(
    (p) => p.providerCaptureId === paypalData.paypalCaptureId && p.orderId !== order.id
  );
  if (existingPaymentWithCapture) {
    throw new Error(`DUPLICATE_CAPTURE_ID: Capture ID "${paypalData.paypalCaptureId}" is already associated with order "${existingPaymentWithCapture.orderId}".`);
  }

  order.status = "ready_for_pickup";
  order.paymentStatus = "COMPLETED";
  order.paypalCaptureId = paypalData.paypalCaptureId;
  if (paypalData.paypalOrderId) {
    order.paypalOrderId = paypalData.paypalOrderId;
  }

  // Confirm event registration if applicable
  const associatedReg = store.registrations.find(
    (r) => r.id === order.registrationId || r.orderId === order.id || (order.paypalOrderId && r.paypalOrderId === order.paypalOrderId)
  );
  if (associatedReg) {
    associatedReg.status = "CONFIRMED";
    associatedReg.paypalCaptureId = paypalData.paypalCaptureId;
    if (paypalData.paypalOrderId) {
      associatedReg.paypalOrderId = paypalData.paypalOrderId;
    }
    associatedReg.confirmedAt = new Date().toISOString();
  }

  // Record payment in ledger
  store.payments.push({
    id: `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    orderId: order.id,
    studentId: order.studentId,
    provider: "paypal",
    providerOrderId: paypalData.paypalOrderId || order.paypalOrderId || "simulated",
    providerCaptureId: paypalData.paypalCaptureId,
    amount: order.total,
    currency: order.currency || "USD",
    status: "COMPLETED",
    payerEmail: paypalData.payerEmail || order.studentEmail,
    payerName: paypalData.payerName || order.studentName,
    createdAt: new Date().toISOString(),
    capturedAt: new Date().toISOString(),
  });

  return order;
}

export async function cancelInternalOrder(orderId: string) {
  const order = store.orders.find((o) => o.id === orderId || o.paypalOrderId === orderId);
  if (!order) return null;

  if (order.status === "cancelled") return order;

  // Restore inventory if merchandise
  if (!order.orderType || order.orderType === "merchandise") {
    for (const item of order.items) {
      const prod = store.products.find((p) => p.id === item.productId || p.slug === item.productId);
      if (prod) {
        prod.stockCount += item.quantity;
        prod.inStock = true;
      }
    }
  }

  // Release registration hold if event
  if (order.orderType === "event_registration" || order.registrationId) {
    const reg = store.registrations.find(
      (r) => r.id === order.registrationId || r.orderId === order.id
    );
    if (reg && reg.status === "PENDING_PAYMENT") {
      reg.status = "CANCELLED";
      const ev = store.events.find((e) => e.id === reg.eventId);
      if (ev && ev.registeredCount > 0) {
        ev.registeredCount -= 1;
      }
    }
  }

  order.status = "cancelled";
  order.paymentStatus = "FAILED";
  return order;
}

/**
 * Server-side expiry and cleanup strategy:
 * Cancels pending uncaptured orders exceeding max age or TTL, preventing abandoned checkouts
 * from permanently consuming event capacity or merchandise stock.
 */
export async function cleanupExpiredPendingOrders(maxAgeMinutes: number = 30): Promise<number> {
  const now = Date.now();
  const cutoff = now - maxAgeMinutes * 60 * 1000;
  let cleanedCount = 0;

  for (const order of [...store.orders]) {
    if (
      order.status === "pending" &&
      order.paymentStatus === "PENDING"
    ) {
      const isExpiredByTtl = order.expiresAt ? new Date(order.expiresAt).getTime() <= now : false;
      const isExpiredByCutoff = !isNaN(new Date(order.createdAt).getTime()) && new Date(order.createdAt).getTime() <= cutoff;

      if (isExpiredByTtl || isExpiredByCutoff) {
        await cancelInternalOrder(order.id);
        cleanedCount++;
      }
    }
  }

  return cleanedCount;
}

export async function getPayments(filters: { orderId?: string; studentId?: string; providerOrderId?: string } = {}) {
  let list = store.payments;
  if (filters.orderId) list = list.filter((p) => p.orderId === filters.orderId);
  if (filters.studentId) list = list.filter((p) => p.studentId === filters.studentId);
  if (filters.providerOrderId) list = list.filter((p) => p.providerOrderId === filters.providerOrderId);
  return list;
}

export async function getPaymentByCaptureId(captureId: string) {
  return store.payments.find((p) => p.providerCaptureId === captureId) || null;
}

// -----------------------------------------------------------------------------
// ORGANIZER DASHBOARD METRICS
// -----------------------------------------------------------------------------

export async function getOrganizerStats(user?: CampusUser) {
  // Determine scoped events for the organizer
  let scopedEvents = store.events;
  let scopedProducts = store.products;

  if (user && user.role !== "admin") {
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

  // Orders scoped to products managed by this organizer
  const scopedOrders = store.orders.filter((o) =>
    o.status !== "cancelled" &&
    o.items.some((item) => scopedProductIds.has(item.productId))
  );

  const totalSales = scopedOrders
    .filter((o) => o.status !== "pending")
    .reduce((sum, o) => {
      // Sum the portion of the order that belongs to this organizer's products
      const orgItemTotal = o.items
        .filter((item) => scopedProductIds.has(item.productId))
        .reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
      return sum + orgItemTotal;
    }, 0);

  const totalRegistrations = scopedRegistrations.length;
  const activeEventsCount = scopedEvents.filter((e) => e.status !== "CLOSED").length;
  const checkedInCount = scopedRegistrations.filter((r) => r.checkedIn).length;

  return {
    totalRevenue: Number(totalSales.toFixed(2)),
    totalRegistrations,
    checkedInCount,
    activeEventsCount,
    events: scopedEvents,
    recentRegistrations: scopedRegistrations.slice(0, 10),
    recentOrders: scopedOrders.slice(0, 10),
  };
}

export async function getOrganizerRegistrations(user?: CampusUser) {
  let scopedEvents = store.events;
  if (user && user.role !== "admin") {
    if (user.organizationId) {
      scopedEvents = store.events.filter((e) => e.organizationId === user.organizationId);
    } else {
      scopedEvents = store.events.filter((e) => e.createdBy === user.id);
    }
  }
  const scopedEventIds = new Set(scopedEvents.map((e) => e.id));
  return store.registrations.filter((r) => scopedEventIds.has(r.eventId));
}

export async function toggleRegistrationCheckIn(registrationId: string, user?: CampusUser) {
  const reg = store.registrations.find((r) => r.id === registrationId);
  if (!reg) {
    throw new Error(`Registration with id "${registrationId}" not found.`);
  }

  if (user && user.role !== "admin") {
    const targetEvent = store.events.find((e) => e.id === reg.eventId);
    const isOwner =
      targetEvent &&
      ((targetEvent.createdBy && targetEvent.createdBy === user.id) ||
        (targetEvent.organizationId && targetEvent.organizationId === user.organizationId));
    if (!isOwner) {
      throw new Error("FORBIDDEN: You do not have permission to manage this registration.");
    }
  }

  reg.checkedIn = !reg.checkedIn;
  return reg;
}

export async function getOrganizerOrders(user?: CampusUser) {
  let scopedProducts = store.products;
  if (user && user.role !== "admin") {
    if (user.organizationId) {
      scopedProducts = store.products.filter((p) => p.organizationId === user.organizationId);
    } else {
      scopedProducts = store.products.filter((p) => p.createdBy === user.id);
    }
  }
  const scopedProductIds = new Set(scopedProducts.map((p) => p.id));
  return store.orders
    .filter((o) => o.items.some((item) => scopedProductIds.has(item.productId)))
    .map((o) => ({
      ...o,
      paymentStatus: o.paymentStatus || (o.paypalCaptureId ? "COMPLETED" : "PENDING"),
      currency: o.currency || "USD",
    }));
}
