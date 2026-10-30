import "server-only";
import { AstropodsClientConfig, AstropodsChatRequest } from "./ai-types";

export class AstropodsError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code = "AI_PROVIDER_ERROR", statusCode = 500) {
    super(message);
    this.name = "AstropodsError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AstropodsNotConfiguredError extends AstropodsError {
  constructor(message = "Astropods AI credentials are not configured in environment variables.") {
    super(message, "PROVIDER_UNAVAILABLE", 503);
    this.name = "AstropodsNotConfiguredError";
  }
}

export class AstropodsAuthError extends AstropodsError {
  constructor(message = "Astropods authentication failed. Check your API key.") {
    super(message, "AI_AUTH_ERROR", 401);
    this.name = "AstropodsAuthError";
  }
}

export class AstropodsRateLimitError extends AstropodsError {
  constructor(message = "Astropods AI request rate limit exceeded. Please try again shortly.") {
    super(message, "RATE_LIMIT_EXCEEDED", 429);
    this.name = "AstropodsRateLimitError";
  }
}

export class AstropodsTimeoutError extends AstropodsError {
  constructor(message = "Astropods AI request timed out. Gateway did not respond in time.") {
    super(message, "PROVIDER_TIMEOUT", 504);
    this.name = "AstropodsTimeoutError";
  }
}

export class AstropodsValidationError extends AstropodsError {
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 502);
    this.name = "AstropodsValidationError";
    this.details = details;
  }
}

/**
 * Resolves verified Astropods client configuration from server environment variables.
 */
export function getAstropodsConfig(): AstropodsClientConfig {
  const apiKey =
    process.env.ASTROPODS_API_KEY ||
    process.env.ASTRO_GATEWAY_API_KEY ||
    process.env.AI_API_KEY;

  let baseUrl =
    process.env.ASTROPODS_BASE_URL ||
    process.env.ASTRO_GATEWAY_URL ||
    "https://gateway.astropods.com/v1";

  // Strip trailing slashes
  baseUrl = baseUrl.replace(/\/+$/, "");

  const model =
    process.env.ASTROPODS_MODEL ||
    process.env.ASTRO_GATEWAY_MODEL ||
    "gpt-4o";

  const timeoutMs = Number(process.env.ASTROPODS_TIMEOUT_MS) || 15000;

  return {
    apiKey,
    baseUrl,
    model,
    timeoutMs,
  };
}

/**
 * Returns true if an active, non-placeholder Astropods key is configured.
 */
export function isAstropodsConfigured(): boolean {
  const { apiKey } = getAstropodsConfig();
  if (!apiKey) return false;
  const lower = apiKey.toLowerCase();
  return (
    !lower.includes("your-") &&
    !lower.includes("placeholder") &&
    !lower.includes("example") &&
    apiKey.trim().length > 8
  );
}

/**
 * Cleans markdown code fences (e.g. ```json ... ```) or conversational preambles
 * from model text output before JSON parsing.
 */
export function extractJsonFromResponse(raw: string): string {
  const trimmed = raw.trim();

  // 1. Try markdown code fence match (including any conversational preamble)
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].trim();
  }

  // 2. Try extracting outermost JSON object { ... }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.substring(firstBrace, lastBrace + 1).trim();
  }

  return trimmed;
}

/**
 * Dispatches an OpenAI-compatible chat completion request to the Astropods AI Gateway.
 */
export async function callAstropodsChat(
  request: AstropodsChatRequest,
  options: { timeoutMs?: number } = {}
): Promise<string> {
  const config = getAstropodsConfig();

  if (!isAstropodsConfigured()) {
    throw new AstropodsNotConfiguredError();
  }

  const timeoutMs = options.timeoutMs ?? config.timeoutMs;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const endpoint = config.baseUrl.endsWith("/chat/completions")
    ? config.baseUrl
    : `${config.baseUrl}/chat/completions`;

  const payload = {
    model: request.model || config.model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 1500,
    ...(request.responseFormat ? { response_format: request.responseFormat } : {}),
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "x-api-key": config.apiKey || "",
        "User-Agent": "CampusHub-AI-Copilot/1.0",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const status = res.status;
      let errorBody: string | undefined;
      try {
        errorBody = await res.text();
      } catch {
        // ignore
      }

      if (status === 401 || status === 403) {
        throw new AstropodsAuthError(
          `Astropods authentication failed (HTTP ${status}). Verify ASTROPODS_API_KEY.`
        );
      }
      if (status === 429) {
        const retrySec = res.headers.get("retry-after");
        throw new AstropodsRateLimitError(
          `Astropods rate limit reached.${retrySec ? ` Retry after ${retrySec} seconds.` : " Please throttle requests."}`
        );
      }
      if (status === 504 || status === 408) {
        throw new AstropodsTimeoutError("Astropods Gateway connection timed out.");
      }

      throw new AstropodsError(
        `Astropods Gateway error HTTP ${status}: ${errorBody || res.statusText}`,
        "PROVIDER_ERROR",
        status
      );
    }

    const data = await res.json();
    const contentRaw = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;

    let content = "";
    if (typeof contentRaw === "string") {
      content = contentRaw;
    } else if (Array.isArray(contentRaw)) {
      content = contentRaw
        .map((part: unknown) =>
          typeof part === "string" ? part : (part as { text?: string })?.text || ""
        )
        .join("\n");
    }

    if (!content.trim()) {
      throw new AstropodsValidationError("Astropods returned an empty response.");
    }

    return content;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof AstropodsError) {
      throw err;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new AstropodsTimeoutError(
        `Astropods Gateway request exceeded ${timeoutMs}ms timeout limit.`
      );
    }

    throw new AstropodsError(
      `Network error connecting to Astropods Gateway: ${
        err instanceof Error ? err.message : String(err)
      }`,
      "PROVIDER_UNAVAILABLE",
      503
    );
  }
}

/**
 * Dispatches a chat completion and parses + validates the JSON response against a validator function.
 */
export async function callAstropodsStructured<T>(
  request: AstropodsChatRequest,
  validator: (parsed: unknown) => T,
  options: { timeoutMs?: number } = {}
): Promise<T> {
  const rawText = await callAstropodsChat(
    {
      ...request,
      responseFormat: { type: "json_object" },
    },
    options
  );

  const cleanJson = extractJsonFromResponse(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (parseError) {
    throw new AstropodsValidationError(
      `Failed to parse JSON response from Astropods: ${
        parseError instanceof Error ? parseError.message : String(parseError)
      }`,
      cleanJson
    );
  }

  try {
    return validator(parsed);
  } catch (validationError) {
    throw new AstropodsValidationError(
      `Astropods response failed schema validation: ${
        validationError instanceof Error ? validationError.message : String(validationError)
      }`,
      parsed
    );
  }
}
