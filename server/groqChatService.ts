import OpenAI from 'openai';
import { PORTFOLIO_SYSTEM_PROMPT } from '../src/data/portfolioContext.ts';

export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
export const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.1-8b-instant',
] as const;

export const MAX_HISTORY_MESSAGES = 20;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_BODY_BYTES = 64 * 1024;
export const GROQ_REQUEST_TIMEOUT_MS = 22000;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const MAX_URLS_IN_SINGLE_MESSAGE = 4;

const ipRequestTimestamps = new Map<string, number[]>();

export interface IncomingChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatServiceResult {
  status: number;
  retryAfterSeconds?: number;
  body: {
    reply?: string;
    error?: string;
    code?: string;
  };
}

export function extractClientIp(headers: Record<string, string | string[] | undefined>, fallbackIp?: string): string {
  const forwarded = headers['x-forwarded-for'];
  const rawForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof rawForwarded === 'string' && rawForwarded.trim()) {
    return rawForwarded.split(',')[0].trim();
  }
  const realIp = headers['x-real-ip'];
  const rawReal = Array.isArray(realIp) ? realIp[0] : realIp;
  if (typeof rawReal === 'string' && rawReal.trim()) {
    return rawReal.trim();
  }
  return fallbackIp || 'unknown';
}

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Periodic bounded cleanup to avoid unbounded map growth
  if (ipRequestTimestamps.size > 500) {
    for (const [key, timestamps] of ipRequestTimestamps.entries()) {
      const recent = timestamps.filter((ts) => ts > windowStart);
      if (recent.length === 0) {
        ipRequestTimestamps.delete(key);
      } else {
        ipRequestTimestamps.set(key, recent);
      }
    }
  }

  const existing = (ipRequestTimestamps.get(clientIp) ?? []).filter((ts) => ts > windowStart);
  if (existing.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = existing[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
    ipRequestTimestamps.set(clientIp, existing);
    return { allowed: false, retryAfterSeconds };
  }

  existing.push(now);
  ipRequestTimestamps.set(clientIp, existing);
  return { allowed: true, retryAfterSeconds: 0 };
}

function containsExcessiveUrls(text: string): boolean {
  const matches = text.match(/https?:\/\/[^\s]+/gi);
  return Boolean(matches && matches.length > MAX_URLS_IN_SINGLE_MESSAGE);
}

export function sanitizeSecretStrings(text: string): string {
  return text
    .replace(/gsk_[A-Za-z0-9_-]+/g, '[REDACTED_KEY]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]');
}

export function getRuntimeGroqConfig() {
  const apiKey = process.env.GROQ_API_KEY?.trim() || '';
  const model = process.env.GROQ_MODEL?.trim() || GROQ_MODELS[0];
  return {
    apiKey,
    groqKeyConfigured: Boolean(apiKey),
    baseUrl: GROQ_BASE_URL,
    model,
  };
}

export function buildRealtimeDateTimeContext(now: Date = new Date()): string {
  const tz = 'Asia/Kolkata';
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
  }).format(now);
  const fullDate = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(now);
  const isoDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const time12 = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);
  const time24 = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  return [
    '=== REAL-TIME SERVER CLOCK (AUTHORITATIVE) ===',
    'Timezone: Asia/Kolkata (IST, UTC+05:30)',
    `Current Day of Week: ${weekday}`,
    `Current Date: ${fullDate} (${isoDate})`,
    `Current Time: ${time12} (${time24} 24-hour)`,
    'When asked about the current date, current time, day of the week, today, tomorrow, or yesterday, ALWAYS answer directly using this authoritative Asia/Kolkata server clock above instead of guessing from training data.',
  ].join('\n');
}

export function sanitizeMessages(raw: unknown): IncomingChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  const sanitized: IncomingChatMessage[] = [];
  for (const entry of raw.slice(-MAX_HISTORY_MESSAGES)) {
    if (!entry || typeof entry !== 'object') {
      return null;
    }
    const candidate = entry as Record<string, unknown>;
    const role = candidate.role;
    const content = candidate.content;

    if (role !== 'user' && role !== 'assistant') {
      return null;
    }
    if (typeof content !== 'string') {
      return null;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      continue;
    }

    sanitized.push({
      role,
      content: trimmed.slice(0, MAX_MESSAGE_LENGTH),
    });
  }

  if (
    sanitized.length === 0 ||
    sanitized[sanitized.length - 1].role !== 'user'
  ) {
    return null;
  }

  return sanitized;
}

function isTimeoutError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const candidate = err as { name?: string; code?: string; message?: string };
  const name = (candidate.name || '').toLowerCase();
  const code = (candidate.code || '').toLowerCase();
  const message = (candidate.message || '').toLowerCase();
  return (
    name.includes('timeout') ||
    name === 'aborterror' ||
    code === 'etimedout' ||
    code === 'esockettimedout' ||
    message.includes('timed out') ||
    message.includes('timeout')
  );
}

export async function processGroqChat(
  rawBody: unknown,
  requestId = `chat-${Date.now().toString(36)}`,
  clientIp = 'unknown'
): Promise<ChatServiceResult> {
  const bodyObj =
    rawBody && typeof rawBody === 'object' ? (rawBody as Record<string, unknown>) : null;

  // Honeypot bot trap validation
  const honeypotValue =
    typeof bodyObj?.website === 'string'
      ? bodyObj.website.trim()
      : typeof bodyObj?.company === 'string'
        ? bodyObj.company.trim()
        : '';

  if (honeypotValue) {
    console.warn(`[api/chat][${requestId}] Honeypot triggered; ignoring automated submission.`);
    return {
      status: 400,
      body: {
        error: 'Unable to validate this submission. Please refresh and try again.',
        code: 'SPAM_DETECTED',
      },
    };
  }

  // Sliding-window rate limit per client IP
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    console.warn(`[api/chat][${requestId}] IP rate limit triggered (${rateCheck.retryAfterSeconds}s).`);
    return {
      status: 429,
      retryAfterSeconds: rateCheck.retryAfterSeconds,
      body: {
        error: `Too many requests in a short window. Please wait ${rateCheck.retryAfterSeconds} seconds and try again.`,
        code: 'RATE_LIMITED',
      },
    };
  }

  const messages = sanitizeMessages(bodyObj?.messages);

  if (!messages) {
    console.warn(`[api/chat][${requestId}] Rejected invalid chat payload.`);
    return {
      status: 400,
      body: {
        error: 'Please enter a valid message before sending.',
        code: 'INVALID_REQUEST',
      },
    };
  }

  const latestUserMessage = messages[messages.length - 1].content;
  if (containsExcessiveUrls(latestUserMessage)) {
    console.warn(`[api/chat][${requestId}] Rejected message with excessive external URLs.`);
    return {
      status: 400,
      body: {
        error: 'Messages containing excessive links are not permitted.',
        code: 'SPAM_LINKS_DETECTED',
      },
    };
  }

  const { apiKey, model } = getRuntimeGroqConfig();

  if (!apiKey) {
    console.error(`[api/chat][${requestId}] Missing GROQ_API_KEY in runtime environment.`);
    return {
      status: 503,
      body: {
        error:
          'GROQ_API_KEY is not configured on the server. Add GROQ_API_KEY in your deployment environment variables and redeploy.',
        code: 'MISSING_API_KEY',
      },
    };
  }

  const startedAt = Date.now();

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: GROQ_BASE_URL,
      timeout: GROQ_REQUEST_TIMEOUT_MS,
      maxRetries: 0,
    });

    const candidateModels = Array.from(new Set([model, ...GROQ_MODELS]));
    const runtimeSystemPrompt = `${PORTFOLIO_SYSTEM_PROMPT}\n\n${buildRealtimeDateTimeContext(new Date())}`;

    let reply = '';
    let lastModelError: unknown = null;

    for (const modelId of candidateModels) {
      try {
        const completion = await client.chat.completions.create({
          model: modelId,
          messages: [
            { role: 'system', content: runtimeSystemPrompt },
            ...messages,
          ],
          temperature: 0.5,
          max_tokens: 1600,
        });

        const rawContent = completion.choices[0]?.message?.content;
        const candidateReply =
          typeof rawContent === 'string' ? rawContent.trim() : '';

        if (candidateReply) {
          reply = candidateReply;
          break;
        }

        console.warn(
          `[api/chat][${requestId}] Model "${modelId}" returned empty message content.`
        );
      } catch (modelErr: unknown) {
        const errInfo = modelErr as { status?: number; message?: string };
        const status = errInfo?.status;
        if (status === 404 || status === 400) {
          console.warn(
            `[api/chat][${requestId}] Model "${modelId}" failed (${status}): ${sanitizeSecretStrings(
              errInfo?.message || 'Unknown model error'
            )}`
          );
          lastModelError = modelErr;
          continue;
        }
        throw modelErr;
      }
    }

    if (!reply) {
      if (lastModelError) {
        throw lastModelError;
      }
      console.error(
        `[api/chat][${requestId}] All candidate models returned empty responses after ${
          Date.now() - startedAt
        }ms.`
      );
      return {
        status: 502,
        body: {
          error: 'The AI assistant returned an empty response. Please try again.',
          code: 'EMPTY_RESPONSE',
        },
      };
    }

    return {
      status: 200,
      body: { reply },
    };
  } catch (err: unknown) {
    const apiErr = err as { status?: number; name?: string; code?: string; message?: string };
    const status = typeof apiErr?.status === 'number' ? apiErr.status : 502;
    const elapsedMs = Date.now() - startedAt;
    const safeMsg = sanitizeSecretStrings(apiErr?.message || String(err));

    if (status === 401 || status === 403) {
      console.error(
        `[api/chat][${requestId}] Groq authentication failed (${status}) in ${elapsedMs}ms.`
      );
      return {
        status: 401,
        body: {
          error:
            'Groq API authentication failed. Please check that GROQ_API_KEY is valid on the server.',
          code: 'INVALID_API_KEY',
        },
      };
    }

    if (status === 429) {
      console.warn(
        `[api/chat][${requestId}] Groq rate limit reached (429) in ${elapsedMs}ms.`
      );
      return {
        status: 429,
        body: {
          error: 'Groq API rate limit reached. Please wait a moment and try again.',
          code: 'RATE_LIMITED',
        },
      };
    }

    if (isTimeoutError(err) || status === 408 || status === 504) {
      console.error(
        `[api/chat][${requestId}] Groq request timed out after ${elapsedMs}ms: ${safeMsg}`
      );
      return {
        status: 504,
        body: {
          error:
            'The AI assistant took too long to respond. Please try again in a moment.',
          code: 'UPSTREAM_TIMEOUT',
        },
      };
    }

    console.error(
      `[api/chat][${requestId}] Groq upstream failure (status=${status}, elapsed=${elapsedMs}ms): ${safeMsg}`
    );
    return {
      status: 502,
      body: {
        error: 'Unable to reach the AI assistant right now. Please try again in a moment.',
        code: 'UPSTREAM_ERROR',
      },
    };
  }
}
