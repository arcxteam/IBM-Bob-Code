/**
 * IBM watsonx.ai REST Client
 * AROMA — AI-powered Repository & Object Model Analyzer
 * IBM Bob Hackathon 2026
 *
 * This module handles all communication with IBM watsonx.ai:
 * 1. IBM IAM token acquisition and automatic refresh (60-min TTL)
 * 2. IBM Granite foundation model inference via the chat completions endpoint
 *
 * SECURITY: All IBM credentials are read from environment variables server-side.
 * This module is imported ONLY by Next.js API routes — never by client components.
 * The WATSONX_API_KEY value never reaches the browser.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WatsonxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface WatsonxOptions {
  /** Maximum tokens for the generated response. Default: 2000 */
  maxNewTokens?: number;
  /**
   * Sampling temperature. Lower = more deterministic.
   * Use ~0.1 for structured JSON output, ~0.3–0.4 for prose.
   * Default: 0.2
   */
  temperature?: number;
  /** Repetition penalty. Default: 1.05 */
  repetitionPenalty?: number;
}

interface IAMTokenResponse {
  access_token: string;
  expires_in: number;
  expiration: number;
  token_type: string;
}

interface WatsonxChatChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface WatsonxResponse {
  choices?: WatsonxChatChoice[];
  results?: Array<{
    generated_text: string;
    stop_reason: string;
    input_token_count: number;
    generated_token_count: number;
  }>;
  model_id: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Configuration — resolved once at module load
// ---------------------------------------------------------------------------

const WATSONX_API_KEY = process.env.WATSONX_API_KEY ?? "";
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID ?? "";
const WATSONX_ENDPOINT =
  process.env.WATSONX_ENDPOINT ?? "https://us-south.ml.cloud.ibm.com";
const WATSONX_MODEL_ID =
  process.env.WATSONX_MODEL_ID ?? "ibm/granite-4-h-small";

const IBM_IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token";
const WATSONX_CHAT_URL = `${WATSONX_ENDPOINT}/ml/v1/text/chat?version=2023-05-29`;

// Validate required environment variables at startup (server-side only)
if (!WATSONX_API_KEY) {
  console.warn(
    "[watsonx] WARNING: WATSONX_API_KEY is not set. AI calls will fail."
  );
}
if (!WATSONX_PROJECT_ID) {
  console.warn(
    "[watsonx] WARNING: WATSONX_PROJECT_ID is not set. AI calls will fail."
  );
}

// ---------------------------------------------------------------------------
// IAM Token Cache — module-level singleton (shared across requests in process)
// ---------------------------------------------------------------------------

let _cachedToken: string | null = null;
let _tokenExpiresAt: number = 0; // unix timestamp in ms

/**
 * Retrieve a valid IBM IAM bearer token.
 * Fetches a new token from IBM IAM when the cached one has expired or is absent.
 * IBM IAM tokens are valid for 3600 seconds (60 minutes).
 */
async function getIAMToken(): Promise<string> {
  const now = Date.now();
  // Refresh 5 minutes before actual expiry to avoid mid-request expiration
  const refreshBuffer = 5 * 60 * 1000;

  if (_cachedToken && now < _tokenExpiresAt - refreshBuffer) {
    return _cachedToken;
  }

  if (!WATSONX_API_KEY) {
    throw new Error(
      "IBM watsonx.ai: WATSONX_API_KEY environment variable is not configured."
    );
  }

  const response = await fetch(IBM_IAM_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: WATSONX_API_KEY,
    }).toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `IBM IAM token request failed [${response.status}]: ${text}`
    );
  }

  const data: IAMTokenResponse = await response.json();
  _cachedToken = data.access_token;
  // `data.expiration` is a Unix timestamp in seconds
  _tokenExpiresAt = data.expiration * 1000;

  console.log(
    `[watsonx] IAM token refreshed. Valid until: ${new Date(_tokenExpiresAt).toISOString()}`
  );

  return _cachedToken;
}

// ---------------------------------------------------------------------------
// Main inference function
// ---------------------------------------------------------------------------

/**
 * Call IBM watsonx.ai with a structured messages array (chat completions format).
 *
 * @param messages - Conversation messages (system, user, assistant turns)
 * @param options  - Optional model parameters (maxNewTokens, temperature, etc.)
 * @returns The model's generated text response as a plain string
 *
 * @example
 * ```ts
 * const result = await callWatsonx([
 *   { role: "system", content: "You are a code architecture analyst." },
 *   { role: "user", content: sourceCode },
 * ], { temperature: 0.1, maxNewTokens: 2000 });
 * ```
 */
export async function callWatsonx(
  messages: WatsonxMessage[],
  options: WatsonxOptions = {}
): Promise<string> {
  if (!WATSONX_API_KEY || !WATSONX_PROJECT_ID) {
    throw new Error(
      "IBM watsonx.ai is not configured. " +
        "Set WATSONX_API_KEY and WATSONX_PROJECT_ID in your .env.local file."
    );
  }

  const token = await getIAMToken();

  const payload = {
    model_id: WATSONX_MODEL_ID,
    project_id: WATSONX_PROJECT_ID,
    messages,
    parameters: {
      max_new_tokens: options.maxNewTokens ?? 2000,
      temperature: options.temperature ?? 0.2,
      repetition_penalty: options.repetitionPenalty ?? 1.05,
      decoding_method: "greedy",
      stop_sequences: [],
    },
  };

  const response = await fetch(WATSONX_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `IBM watsonx.ai API call failed [${response.status} ${response.statusText}]: ${text}`
    );
  }

  const data: WatsonxResponse = await response.json();

  let generatedText: string | undefined;

  if (data.choices && data.choices.length > 0) {
    generatedText = data.choices[0].message?.content;
  } else if (data.results && data.results.length > 0) {
    generatedText = data.results[0].generated_text;
  }

  if (!generatedText) {
    throw new Error(
      "IBM watsonx.ai returned an empty response. Check model_id and project_id."
    );
  }

  return generatedText.trim();
}

// ---------------------------------------------------------------------------
// Convenience helpers for API routes
// ---------------------------------------------------------------------------

/**
 * Build a simple two-message request (system + user) and call the model.
 * Suitable for single-turn analysis tasks (analyze, refactor, security, generate).
 */
export async function analyzeWithWatsonx(
  systemPrompt: string,
  userContent: string,
  options?: WatsonxOptions
): Promise<string> {
  return callWatsonx(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    options
  );
}

/**
 * Safely parse JSON from a model response.
 * IBM Granite sometimes wraps JSON in markdown fences — this strips them.
 * Returns `null` if parsing fails after cleanup.
 */
export function safeParseJSON<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Strip markdown code fences and try again
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}

/**
 * Extract JSON from a longer string that may contain prose before/after the JSON block.
 * Useful when the model adds explanation before/after the JSON object or array.
 */
export function extractJSON<T>(raw: string): T | null {
  // Try direct parse first
  const direct = safeParseJSON<T>(raw);
  if (direct !== null) return direct;

  // Try to extract first {...} or [...] block
  const objectMatch = raw.match(/\{[\s\S]*\}/);
  const arrayMatch = raw.match(/\[[\s\S]*\]/);

  if (objectMatch) {
    const parsed = safeParseJSON<T>(objectMatch[0]);
    if (parsed !== null) return parsed;
  }

  if (arrayMatch) {
    const parsed = safeParseJSON<T>(arrayMatch[0]);
    if (parsed !== null) return parsed;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Model configuration per route (exported for documentation/testing)
// ---------------------------------------------------------------------------

export const WATSONX_ROUTE_CONFIG = {
  analyze: {
    temperature: 0.1,
    maxNewTokens: 2000,
    description: "Deterministic JSON extraction for code architecture",
  },
  chat: {
    temperature: 0.3,
    maxNewTokens: 1500,
    description: "Slightly creative for conversational flow explanations",
  },
  refactor: {
    temperature: 0.1,
    maxNewTokens: 2000,
    description: "Consistent pattern detection across runs",
  },
  generate: {
    temperature: 0.4,
    maxNewTokens: 3000,
    description: "More creative for documentation and test prose",
  },
  security: {
    temperature: 0.05,
    maxNewTokens: 2000,
    description: "Highly deterministic for reproducible security findings",
  },
} as const;