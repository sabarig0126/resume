import type { IncomingMessage, ServerResponse } from 'node:http';
import { getRuntimeGroqConfig } from '../server/groqChatService.ts';

export default function handler(
  req: IncomingMessage,
  res: ServerResponse
): void {
  const method = (req.method || 'GET').toUpperCase();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (method !== 'GET' && method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end(
      JSON.stringify({
        ok: false,
        error: 'Method not allowed. Use GET /api/health.',
        code: 'METHOD_NOT_ALLOWED',
      })
    );
    return;
  }

  const { groqKeyConfigured, baseUrl, model } = getRuntimeGroqConfig();
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      ok: true,
      endpoint: '/api/chat',
      groqKeyConfigured,
      baseUrl,
      model,
    })
  );
}
