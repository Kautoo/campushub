import { CampusEvent, EventPlan } from "@/data/mockEvents";

export interface BryntumEventModel {
  id: string;
  name: string;
  startDate: string; // ISO 8601 string
  endDate: string; // ISO 8601 string
  allDay: boolean;
  eventColor?: string;
  iconCls?: string;
  location?: string;
  venueHref?: string;
  category: CampusEvent["category"];
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  organizer: string;
  organizationId?: string;
  createdBy?: string;
  isFree: boolean;
  totalCapacity: number;
  registeredCount: number;
  description: string;
  subtitle?: string;
  image?: string;
  plans?: EventPlan[];
  hasTeeSize?: boolean;
  slug?: string;
}

export const MALAYSIA_TIMEZONE = "Asia/Kuala_Lumpur";
export const MALAYSIA_UTC_OFFSET_HOURS = 8;

/**
 * Category color mappings conforming to CampusHub theme and Bryntum event styling
 */
export const CATEGORY_COLORS: Record<string, string> = {
  "Athletics & Fun Runs": "#ea580c", // Athletic Orange
  "Green & Community": "#16a34a",   // Emerald Green
  "Tech & Hackathons": "#0284c7",   // Tech Cyan
  "Workshops & Design": "#7c3aed",  // Violet
  "E-Sports": "#e11d48",           // Crimson Rose
  "Tech & AI": "#4b671b",          // CampusHub Olive Primary
  General: "#475569",              // Slate
};

/**
 * Category icon mappings for Bryntum event rendering
 */
export const CATEGORY_ICONS: Record<string, string> = {
  "Athletics & Fun Runs": "directions_run",
  "Green & Community": "eco",
  "Tech & Hackathons": "terminal",
  "Workshops & Design": "palette",
  "E-Sports": "sports_esports",
  "Tech & AI": "smart_toy",
  General: "event",
};

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Parses diverse date and time formats found in CampusHub into normalized local Date objects
 * and ISO 8601 strings in Malaysia Standard Time (+08:00).
 */
export function parseEventDateTime(
  dateInput?: string,
  timeInput?: string,
  endTimeInput?: string
): { startDate: Date; endDate: Date; isoStart: string; isoEnd: string } {
  const fallbackYear = 2025;
  let year = fallbackYear;
  let month = 10; // November default (0-indexed)
  let day = 15;
  let startHour = 10;
  let startMinute = 0;
  let endHour = 12;
  let endMinute = 0;

  if (dateInput) {
    const isoDateMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDateMatch) {
      year = parseInt(isoDateMatch[1], 10);
      month = parseInt(isoDateMatch[2], 10) - 1;
      day = parseInt(isoDateMatch[3], 10);
    } else {
      // E.g. "Saturday, Nov 8, 2025" or "Nov 8, 2025"
      const textMatch = dateInput.match(/([a-zA-Z]{3,})\s+(\d{1,2})(?:,\s*(\d{4}))?/i);
      if (textMatch) {
        const monKey = textMatch[1].substring(0, 3).toLowerCase();
        if (MONTH_MAP[monKey] !== undefined) {
          month = MONTH_MAP[monKey];
        }
        day = parseInt(textMatch[2], 10);
        if (textMatch[3]) {
          year = parseInt(textMatch[3], 10);
        }
      }
    }
  }

  // Parse start time (e.g., "17:00", "6:30 PM PST", "18:00 PST", "9:00 AM")
  if (timeInput) {
    const timeMatch = timeInput.match(/(\d{1,2}):(\d{2})(?:\s*([AP]M))?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const meridian = timeMatch[3]?.toUpperCase();

      if (meridian === "PM" && h < 12) h += 12;
      if (meridian === "AM" && h === 12) h = 0;

      startHour = h;
      startMinute = m;
      // Default duration is 2 hours if end time not specified
      endHour = (startHour + 2) % 24;
      endMinute = startMinute;
    }
  }

  // Parse custom end time if provided
  if (endTimeInput) {
    const endMatch = endTimeInput.match(/(\d{1,2}):(\d{2})(?:\s*([AP]M))?/i);
    if (endMatch) {
      let h = parseInt(endMatch[1], 10);
      const m = parseInt(endMatch[2], 10);
      const meridian = endMatch[3]?.toUpperCase();

      if (meridian === "PM" && h < 12) h += 12;
      if (meridian === "AM" && h === 12) h = 0;

      endHour = h;
      endMinute = m;
    }
  }

  // Construct UTC dates with explicit +08:00 offset to prevent host-timezone shifting
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const padYear = (y: number) => String(y).padStart(4, "0");

  const isoStart = `${padYear(year)}-${pad(month + 1)}-${pad(day)}T${pad(startHour)}:${pad(startMinute)}:00+08:00`;
  
  // Handle cross-midnight duration (e.g., 23:00 to 02:00)
  let endDay = day;
  let endMonth = month;
  let endYear = year;
  if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
    // Crosses to next calendar day
    const nextDayDate = new Date(Date.UTC(year, month, day + 1));
    endYear = nextDayDate.getUTCFullYear();
    endMonth = nextDayDate.getUTCMonth();
    endDay = nextDayDate.getUTCDate();
  }

  const isoEnd = `${padYear(endYear)}-${pad(endMonth + 1)}-${pad(endDay)}T${pad(endHour)}:${pad(endMinute)}:00+08:00`;

  return {
    startDate: new Date(isoStart),
    endDate: new Date(isoEnd),
    isoStart,
    isoEnd,
  };
}

/**
 * Maps a CampusHub event to Bryntum Calendar EventModel format
 */
export function campusEventToBryntum(event: CampusEvent): BryntumEventModel {
  const { isoStart, isoEnd } = parseEventDateTime(event.date, event.time);

  return {
    id: event.id,
    name: event.title,
    startDate: isoStart,
    endDate: isoEnd,
    allDay: false,
    eventColor: CATEGORY_COLORS[event.category] || "#4b671b",
    iconCls: CATEGORY_ICONS[event.category] || "event",
    location: event.location || "TBD",
    venueHref: event.venueHref,
    category: event.category,
    status: event.status || "PUBLISHED",
    organizer: event.organizer,
    organizationId: event.organizationId,
    createdBy: event.createdBy,
    isFree: event.isFree,
    totalCapacity: event.totalCapacity,
    registeredCount: event.registeredCount,
    description: event.description || "",
    subtitle: event.subtitle,
    image: event.image,
    plans: event.plans,
    hasTeeSize: event.hasTeeSize,
    slug: event.slug,
  };
}

/**
 * Serializes Bryntum Calendar drag-and-drop or resize changes back into CampusHub event fields
 */
export function bryntumToCampusEvent(
  bryntumEvent: Partial<BryntumEventModel>,
  original?: CampusEvent
): Partial<CampusEvent> {
  const updates: Partial<CampusEvent> = {};

  if (bryntumEvent.name) {
    updates.title = bryntumEvent.name;
  }
  if (bryntumEvent.location) {
    updates.location = bryntumEvent.location;
  }
  if (bryntumEvent.category) {
    updates.category = bryntumEvent.category;
  }
  if (bryntumEvent.status) {
    updates.status = bryntumEvent.status;
  }

  if (bryntumEvent.startDate) {
    const d = new Date(bryntumEvent.startDate);
    // Parse in UTC+8
    const utcMs = d.getTime();
    const mytDate = new Date(utcMs + 8 * 3600 * 1000);

    const year = mytDate.getUTCFullYear();
    const monthIndex = mytDate.getUTCMonth();
    const day = mytDate.getUTCDate();
    const dayOfWeekIndex = mytDate.getUTCDay();
    const hours = mytDate.getUTCHours();
    const minutes = mytDate.getUTCMinutes();

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const dateFormatted = `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
    const timeFormatted = `${pad(hours)}:${pad(minutes)}`;

    updates.date = dateFormatted;
    updates.time = timeFormatted;
    updates.month = MONTH_NAMES[monthIndex];
    updates.dayNumber = day;
    updates.dayOfWeek = DAY_NAMES[dayOfWeekIndex].toUpperCase();
    updates.fullDayName = FULL_DAY_NAMES[dayOfWeekIndex];
  }

  return {
    ...original,
    ...updates,
  };
}
