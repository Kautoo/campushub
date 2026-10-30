import { CampusEvent } from "@/data/mockEvents";
import { parseEventDateTime } from "./event-adapter";

export interface CandidateSchedule {
  id?: string;
  title?: string;
  location?: string;
  date?: string;
  time?: string;
  endTime?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  organizationId?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType?: "VENUE_COLLISION" | "ORGANIZATION_OVERLAP" | "INVALID_TIME_RANGE";
  reason?: string;
  conflictingEvent?: CampusEvent;
}

/**
 * Checks if a venue string indicates a virtual/online location that does not conflict physically
 */
export function isVirtualLocation(location?: string): boolean {
  if (!location) return true;
  const normalized = location.trim().toLowerCase();
  return (
    normalized === "" ||
    normalized === "tbd" ||
    normalized.includes("online") ||
    normalized.includes("zoom") ||
    normalized.includes("virtual") ||
    normalized.includes("discord") ||
    normalized.includes("livestream")
  );
}

/**
 * Normalizes start and end timestamps into epoch milliseconds for safe interval overlap calculation
 */
function resolveTimeRange(schedule: {
  date?: string;
  time?: string;
  endTime?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}): { startMs: number; endMs: number; valid: boolean } {
  if (schedule.startDate && schedule.endDate) {
    const startMs = new Date(schedule.startDate).getTime();
    const endMs = new Date(schedule.endDate).getTime();
    return {
      startMs,
      endMs,
      valid: !isNaN(startMs) && !isNaN(endMs) && endMs > startMs,
    };
  }

  const { startDate, endDate } = parseEventDateTime(
    schedule.date,
    schedule.time,
    schedule.endTime
  );

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  return {
    startMs,
    endMs,
    valid: !isNaN(startMs) && !isNaN(endMs) && endMs > startMs,
  };
}

/**
 * Evaluates whether candidate event schedule creates a conflict against existing events.
 * 
 * Rules:
 * 1. candidate.end must be strictly after candidate.start
 * 2. If venue is physical, no two events may overlap at the exact same location:
 *    startA < endB && endA > startB
 * 3. An organization cannot schedule two overlapping events simultaneously
 */
export function checkScheduleConflict(
  existingEvents: CampusEvent[],
  candidate: CandidateSchedule,
  excludeEventId?: string
): ConflictCheckResult {
  const candidateRange = resolveTimeRange(candidate);

  if (!candidateRange.valid) {
    return {
      hasConflict: true,
      conflictType: "INVALID_TIME_RANGE",
      reason: "Event end time must be strictly after start time.",
    };
  }

  const candidateLocation = candidate.location?.trim().toLowerCase();
  const candidateOrgId = candidate.organizationId;
  const isCandidateVirtual = isVirtualLocation(candidate.location);

  for (const event of existingEvents) {
    // Skip checking against itself when updating
    if (excludeEventId && (event.id === excludeEventId || event.slug === excludeEventId)) {
      continue;
    }
    if (candidate.id && (event.id === candidate.id || event.slug === candidate.id)) {
      continue;
    }

    // Skip closed / cancelled events
    if (event.status === "CLOSED") {
      continue;
    }

    const eventRange = resolveTimeRange({
      date: event.date,
      time: event.time,
    });

    if (!eventRange.valid) {
      continue;
    }

    // Interval overlap condition: startA < endB && endA > startB
    const overlaps =
      candidateRange.startMs < eventRange.endMs &&
      candidateRange.endMs > eventRange.startMs;

    if (!overlaps) {
      continue;
    }

    // Check 1: Venue Collision
    if (!isCandidateVirtual && candidateLocation) {
      const eventLocation = event.location?.trim().toLowerCase();
      if (!isVirtualLocation(event.location) && eventLocation === candidateLocation) {
        return {
          hasConflict: true,
          conflictType: "VENUE_COLLISION",
          reason: `Venue "${event.location}" is already reserved by "${event.title}" during this time slot.`,
          conflictingEvent: event,
        };
      }
    }

    // Check 2: Same Organization Scheduling Overlap
    if (candidateOrgId && event.organizationId && candidateOrgId === event.organizationId) {
      return {
        hasConflict: true,
        conflictType: "ORGANIZATION_OVERLAP",
        reason: `Your organization already has "${event.title}" scheduled during an overlapping time slot.`,
        conflictingEvent: event,
      };
    }
  }

  return {
    hasConflict: false,
  };
}
