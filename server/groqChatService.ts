import OpenAI from 'openai';
import { PORTFOLIO_SYSTEM_PROMPT } from '../src/data/portfolioContext.ts';

export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
export const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.1-8b-instant',
] as const;

export const MAX_HISTORY_MESSAGES = 10;
export const MAX_HISTORY_CHARS = 3600;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_BODY_BYTES = 64 * 1024;
export const GROQ_REQUEST_TIMEOUT_MS = 22000;
export const GROQ_MAX_TOKENS = 850;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const MAX_URLS_IN_SINGLE_MESSAGE = 4;

const ipRequestTimestamps = new Map<string, number[]>();
const modelCooldownUntil = new Map<string, number>();
const unavailableModels = new Set<string>();

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
    '=== REAL-TIME SERVER CLOCK (Asia/Kolkata, IST UTC+05:30) ===',
    `Day: ${weekday} | Date: ${fullDate} (${isoDate}) | Time: ${time12} (${time24} 24h)`,
    'Always use this authoritative clock for current date, weekday, time, today, tomorrow, or yesterday.',
  ].join('\n');
}

const TAMIL_SCRIPT_RE = /[\u0B80-\u0BFF]/;

const TANGLISH_WORDS_RE =
  /\b(?:vanakkam|vanakam|vankam|namaskaram|nandri|nanri|machan|macha|machi|nanba|nanbaa|thala|thalaiva|thambi|neenga|namma|naanga|nanga|naan|avan|aval|avar|avaru|avaroda|avanga|avangaloda|ivan|ivaru|ivaroda|ivanga|idhu|ithu|adhu|athu|unga|enga|yenga|yenge|ennoda|unnoda|enakku|enaku|unakku|unaku|avangalukku|sabariku|sabariyoda|sabarioda|epdi|eppadi|yeppadi|epadi|epidi|epd|enna|yenna|ennanga|ennathu|entha|yentha|endha|yaaru|yaru|ethana|eththana|yeththana|evlo|yevlo|evvalavu|eppo|yeppo|eppothu|eppa|enge|engiruku|inniku|innikku|innaiku|inikki|innaikki|naalaiku|nalaiku|nethu|netru|ippo|ippothu|inga|anga|mela|keela|ulla|veliya|appuram|apram|apdiye|appadiye|kooda|mattum|matum|thaan|thaana|kitta|iruku|irukku|iruka|irukka|iruke|irukke|iruken|irukken|irukinga|irukeenga|irukanga|irukaanga|irukkanga|irukiraaru|irukar|irukaaru|irukkaaru|illa|illai|ille|illaya|aama|aamaa|sollu|sollunga|solunga|sollunge|solren|solra|solla|solli|solluva|solluvinga|pathi|paththi|padipu|padippu|padikira|padikkira|padikuran|padikkuran|padikaran|padikuraru|padikkiraaru|padikiraaru|padikkiraar|padikiraar|padicha|padichirukaru|padichirukkaaru|pannu|panna|panni|pannunga|panra|panraru|panrathu|pannirukaru|pannirukaaru|pannirukkaaru|pannirukanga|pannanga|pannalam|panlaam|pannuvaaru|pannuvaru|poraru|poraaru|poranga|vararu|varaaru|varuvaaru|mudicha|mudicharu|mudichirukaru|mudichirukaaru|mudichirukkaaru|mudichirukanga|vachirukaru|vechirukaru|vachirukaaru|vechirukaaru|vachirukanga|vechirukanga|vachiruka|theriyuma|theriyum|therila|theriyala|therinja|therinjikalam|puriyala|purinjidhu|puriyudha|kedaikum|kidaikum|kedaikuma|kidaikuma|kidaikkuma|mudiyuma|mudiyum|mudiyathu|mudiyala|venum|venaam|venam|pothum|seri|sari|romba|nalla|nallathu|nalladhu|paravala|paravailla|konjam|kandippa|semma|sema|kalakkal|veralevel|aachu|achu|aagum|aaguthu|paaru|parunga|kaatu|katunga|kelu|kelunga|vaanga|ponga|pesu|pesunga|pesalam|kudu|kudunga|kodunga|thanga|tharuvingala|edhachum|edhavathu|ethachum|ethavathu|onnum|onnume|ellam|ellaam|ellame|ellaame|dei)\b/i;

const TANGLISH_PHRASE_OR_MORPH_RE =
  /(?:\b(?:tamil|english|tanglish|college|school|project|skills?|certificates?|time|date|sabari|sir|bro)\s+(?:la|oda|kku|ku|nu|pathi|paththi)\b|\b(?:detail|brief|clear|correct|proper|fast|short|simple|full)\s+ah\b|-(?:la|oda|kku|ah)\b|\b(?:hi|hey|hello|ok|okay|seri|sari|thanks|thank\s+you|nandri|bye|sollu|anna|bro|super|semma|sema)\s+da\b|\bda\s*[?!.]*$|\b\w+(?:iruk[ku]+|pann(?:u|a|i|unga|iruk)|panr(?:a|aru|athu)|padik(?:ira|kira|ura)|mudich(?:a|iru)|vachiruk|vechiruk|theriy(?:um|ala)|mudiy(?:um|athu|ala))\b|\bvera\s+level\b)/i;

export type DetectedChatLanguage = 'tamil' | 'tanglish' | 'english' | 'inherit';

export function detectTurnLanguage(latestUserMessage: string): DetectedChatLanguage {
  const text = latestUserMessage.trim();
  if (!text) return 'inherit';

  if (
    /\b(?:in english|reply in english|english please|speak in english|explain in english|answer in english|english la)\b/i.test(
      text
    ) ||
    text.includes('ஆங்கிலத்தில்')
  ) {
    return 'english';
  }

  if (
    /\b(?:in tanglish|tanglish la|tanglish-la|reply in tanglish|speak in tanglish|write in tanglish)\b/i.test(
      text
    )
  ) {
    return 'tanglish';
  }

  if (
    /\b(?:in tamil|reply in tamil|tamil please|speak in tamil|explain in tamil|answer in tamil|tamil script|tamil la)\b/i.test(
      text
    ) ||
    text.includes('தமிழில்')
  ) {
    return 'tamil';
  }

  if (TAMIL_SCRIPT_RE.test(text)) {
    return 'tamil';
  }

  if (TANGLISH_WORDS_RE.test(text) || TANGLISH_PHRASE_OR_MORPH_RE.test(text)) {
    return 'tanglish';
  }

  if (/^[\s\d\p{P}\p{S}okhm]+$/iu.test(text) && text.length <= 8) {
    return 'inherit';
  }

  return 'english';
}

export function buildTurnLanguageContext(latestUserMessage: string): string {
  const detected = detectTurnLanguage(latestUserMessage);

  if (detected === 'tamil') {
    return '=== TURN LANGUAGE: TAMIL (தமிழ்) ===\nReply 100% in natural Tamil script (தமிழ்) from first word to last—write every heading, degree, and tech term in Tamil script (e.g., சபரி, பி.டெக் செயற்கை நுண்ணறிவு மற்றும் தரவு அறிவியல், பைதான், சி, எஸ்க்யூஎல், டிபிஎம்எஸ், மாங்கோடிபி, மேட்லேப், மைக்ரோசாஃப்ட் எக்ஸெல், ஸ்ரீ ராமகிருஷ்ணா இன்ஸ்டிடியூட் ஆஃப் டெக்னாலஜி, கோயம்புத்தூர்). Zero English words or parentheticals (except raw email/URLs if asked for links). Always write பி.டெக், never பிஎச்.டி.';
  }

  if (detected === 'tanglish') {
    return '=== TURN LANGUAGE: TANGLISH (Tamil + English) ===\nReply in a natural Tamil + English mix written in English letters from start to finish (e.g., "Sabari ippo 2nd year B.Tech AI & Data Science padikkiraaru..."). Never slip into pure English.';
  }

  if (detected === 'inherit') {
    return '=== TURN LANGUAGE: INHERIT ===\nMatch the exact language style (Tamil script, English, or Tanglish) of the immediately preceding turn, or English if starting fresh.';
  }

  return '=== TURN LANGUAGE: ENGLISH ===\nReply 100% in clear, natural English from start to finish. Do not mix Tamil or Tanglish words.';
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

  // Keep recent turns within a compact character budget so TPM limits stay healthy
  const budgeted: IncomingChatMessage[] = [];
  let charBudget = 0;
  for (let i = sanitized.length - 1; i >= 0; i -= 1) {
    const msg = sanitized[i];
    const isLatestUser = i === sanitized.length - 1;
    if (!isLatestUser && charBudget + msg.content.length > MAX_HISTORY_CHARS) {
      break;
    }
    budgeted.unshift(msg);
    charBudget += msg.content.length;
  }

  return budgeted;
}

function parseRetryDelayMs(err: unknown): number {
  if (!err || typeof err !== 'object') return 0;
  const candidate = err as {
    message?: string;
    headers?: { get?: (name: string) => string | null; [key: string]: unknown };
  };

  const retryHeader =
    typeof candidate.headers?.get === 'function'
      ? candidate.headers.get('retry-after')
      : typeof candidate.headers?.['retry-after'] === 'string'
        ? candidate.headers['retry-after']
        : null;

  if (retryHeader) {
    const seconds = Number(retryHeader);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(Math.ceil(seconds * 1000), 60_000);
    }
  }

  const msg = candidate.message || '';
  const msMatch = msg.match(/try again in\s+(\d+(?:\.\d+)?)\s*ms/i);
  if (msMatch) {
    return Math.min(Math.ceil(Number(msMatch[1])), 60_000);
  }
  const secMatch = msg.match(/try again in\s+(\d+(?:\.\d+)?)\s*s/i);
  if (secMatch) {
    return Math.min(Math.ceil(Number(secMatch[1]) * 1000), 60_000);
  }
  return 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

    const baseModels = Array.from(new Set([model, ...GROQ_MODELS])).filter(
      (id) => !unavailableModels.has(id)
    );
    const activeBaseModels = baseModels.length > 0 ? baseModels : [...GROQ_MODELS];
    const now = Date.now();
    const readyModels = activeBaseModels.filter(
      (id) => (modelCooldownUntil.get(id) ?? 0) <= now
    );
    const coolingModels = activeBaseModels
      .filter((id) => (modelCooldownUntil.get(id) ?? 0) > now)
      .sort(
        (a, b) => (modelCooldownUntil.get(a) ?? 0) - (modelCooldownUntil.get(b) ?? 0)
      );
    const candidateModels = [...readyModels, ...coolingModels];

    const runtimeSystemPrompt = [
      PORTFOLIO_SYSTEM_PROMPT,
      buildRealtimeDateTimeContext(new Date()),
      buildTurnLanguageContext(latestUserMessage),
    ].join('\n\n');

    let reply = '';
    let lastModelError: unknown = null;
    const attemptNotes: string[] = [];

    for (let idx = 0; idx < candidateModels.length; idx += 1) {
      const modelId = candidateModels[idx];
      let retriedShortWait = false;

      while (true) {
        try {
          const completion = await client.chat.completions.create({
            model: modelId,
            messages: [
              { role: 'system', content: runtimeSystemPrompt },
              ...messages,
            ],
            temperature: 0.5,
            max_tokens: GROQ_MAX_TOKENS,
          });

          const rawContent = completion.choices[0]?.message?.content;
          const candidateReply =
            typeof rawContent === 'string' ? rawContent.trim() : '';

          if (candidateReply) {
            modelCooldownUntil.delete(modelId);
            reply = candidateReply;
            break;
          }

          attemptNotes.push(`${modelId}: empty content`);
          break;
        } catch (modelErr: unknown) {
          const errInfo = modelErr as { status?: number; message?: string };
          const status = errInfo?.status;

          if (status === 429) {
            const retryDelayMs = parseRetryDelayMs(modelErr);
            const hasMoreReadyModels = candidateModels
              .slice(idx + 1)
              .some((nextId) => (modelCooldownUntil.get(nextId) ?? 0) <= Date.now());

            // If retry wait is tiny (e.g. 285ms) and no other un-cooled model is immediately ready, wait & retry once
            if (!retriedShortWait && !hasMoreReadyModels && retryDelayMs > 0 && retryDelayMs <= 1100) {
              retriedShortWait = true;
              await sleep(retryDelayMs + 60);
              continue;
            }

            modelCooldownUntil.set(
              modelId,
              Date.now() + Math.max(retryDelayMs + 250, 5000)
            );
            attemptNotes.push(
              `${modelId} (429): ${sanitizeSecretStrings(errInfo?.message || 'Rate limited')}`
            );
            lastModelError = modelErr;
            break;
          }

          if (status === 404) {
            unavailableModels.add(modelId);
            attemptNotes.push(
              `${modelId} (404): ${sanitizeSecretStrings(errInfo?.message || 'Model unavailable')}`
            );
            lastModelError = modelErr;
            break;
          }

          if (status === 400 || status === 503) {
            attemptNotes.push(
              `${modelId} (${status}): ${sanitizeSecretStrings(errInfo?.message || 'Model error')}`
            );
            lastModelError = modelErr;
            break;
          }

          throw modelErr;
        }
      }

      if (reply) {
        break;
      }
    }

    if (!reply) {
      if (attemptNotes.length > 0) {
        console.warn(
          `[api/chat][${requestId}] All candidate models failed: ${attemptNotes.join(' | ')}`
        );
      }
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
