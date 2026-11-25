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

export interface IncomingChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatServiceResult {
  status: number;
  body: {
    reply?: string;
    error?: string;
    code?: string;
  };
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
  requestId = `chat-${Date.now().toString(36)}`
): Promise<ChatServiceResult> {
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

  const bodyObj =
    rawBody && typeof rawBody === 'object' ? (rawBody as Record<string, unknown>) : null;
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

  const startedAt = Date.now();

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: GROQ_BASE_URL,
      timeout: GROQ_REQUEST_TIMEOUT_MS,
      maxRetries: 0,
    });

    const candidateModels = Array.from(new Set([model, ...GROQ_MODELS]));

    let reply = '';
    let lastModelError: unknown = null;

    for (const modelId of candidateModels) {
      try {
        const completion = await client.chat.completions.create({
          model: modelId,
          messages: [
            { role: 'system', content: PORTFOLIO_SYSTEM_PROMPT },
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
