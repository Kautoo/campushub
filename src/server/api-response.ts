import { NextResponse } from "next/server";
import { ApiResponse, ApiErrorResponse } from "@/types";

export function successResponse<T>(data: T, message?: string, status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  return NextResponse.json(payload, { status });
}

export function errorResponse(
  message: string,
  code = "BAD_REQUEST",
  status = 400,
  details?: unknown
) {
  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return NextResponse.json(payload, { status });
}

export function unauthorizedResponse(message = "Unauthorized access", code = "UNAUTHORIZED") {
  return errorResponse(message, code, 401);
}

export function forbiddenResponse(message = "Forbidden operation", code = "FORBIDDEN") {
  return errorResponse(message, code, 403);
}

export function notFoundResponse(message = "Resource not found", code = "NOT_FOUND") {
  return errorResponse(message, code, 404);
}

export function serverErrorResponse(
  error: unknown,
  fallbackMessage = "An unexpected server error occurred"
) {
  // Never leak raw stack traces or internal DB details to clients
  console.error("[ServerError]:", error);
  const message = error instanceof Error ? error.message : fallbackMessage;
  return errorResponse(message, "INTERNAL_SERVER_ERROR", 500);
}
