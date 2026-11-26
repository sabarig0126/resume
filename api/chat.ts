import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  extractClientIp,
  MAX_BODY_BYTES,
  processGroqChat,
  sanitizeSecretStrings,
} from '../server/groqChatService.ts';

type VercelLikeRequest = IncomingMessage & {
  body?: unknown;
};

type VercelLikeResponse = ServerResponse & {
  status?: (code: number) => VercelLikeResponse;
  json?: (data: unknown) => void;
};

function sendJson(
  res: VercelLikeResponse,
  statusCode: number,
  payload: unknown,
  retryAfterSeconds?: number
): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
  }
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: VercelLikeRequest): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) {
        throw Object.assign(new Error('Request payload is too large.'), {
          code: 'PAYLOAD_TOO_LARGE',
        });
      }
      return req.body.trim() ? JSON.parse(req.body) : {};
    }
    if (Buffer.isBuffer(req.body)) {
      if (req.body.byteLength > MAX_BODY_BYTES) {
        throw Object.assign(new Error('Request payload is too large.'), {
          code: 'PAYLOAD_TOO_LARGE',
        });
      }
      const text = req.body.toString('utf8');
      return text.trim() ? JSON.parse(text) : {};
    }
    return req.body;
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    const buf = typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : Buffer.from(chunk);
    totalBytes += buf.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      throw Object.assign(new Error('Request payload is too large.'), {
        code: 'PAYLOAD_TOO_LARGE',
      });
    }
    chunks.push(buf);
  }

  if (chunks.length === 0) {
    return {};
  }

  const rawText = Buffer.concat(chunks).toString('utf8').trim();
  return rawText ? JSON.parse(rawText) : {};
}

export default async function handler(
  req: VercelLikeRequest,
  res: VercelLikeResponse
): Promise<void> {
  const requestId = `v-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  try {
    const method = (req.method || 'GET').toUpperCase();

    if (method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Allow', 'POST, OPTIONS');
      res.setHeader('Cache-Control', 'no-store');
      res.end();
      return;
    }

    if (method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      sendJson(res, 405, {
        error: 'Method not allowed. Use POST /api/chat.',
        code: 'METHOD_NOT_ALLOWED',
      });
      return;
    }

    let parsedBody: unknown;
    try {
      parsedBody = await readJsonBody(req);
    } catch (parseErr: unknown) {
      const errCode = (parseErr as { code?: string })?.code;
      if (errCode === 'PAYLOAD_TOO_LARGE') {
        console.warn(`[api/chat][${requestId}] Payload exceeded ${MAX_BODY_BYTES} bytes.`);
        sendJson(res, 413, {
          error: 'Request payload is too large.',
          code: 'PAYLOAD_TOO_LARGE',
        });
        return;
      }
      console.warn(`[api/chat][${requestId}] Invalid JSON body.`);
      sendJson(res, 400, {
        error: 'Invalid JSON request body.',
        code: 'INVALID_JSON',
      });
      return;
    }

    const clientIp = extractClientIp(req.headers, req.socket?.remoteAddress);
    const result = await processGroqChat(parsedBody, requestId, clientIp);
    sendJson(res, result.status, result.body, result.retryAfterSeconds);
  } catch (err: unknown) {
    const safeMsg = sanitizeSecretStrings(
      err instanceof Error ? err.message : String(err)
    );
    console.error(`[api/chat][${requestId}] Unhandled handler error: ${safeMsg}`);
    sendJson(res, 500, {
      error: 'Internal server error while processing chat request.',
      code: 'SERVER_ERROR',
    });
  }
}
