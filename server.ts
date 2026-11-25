import dotenv from 'dotenv';
import express from 'express';

dotenv.config();
import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import { PORTFOLIO_SYSTEM_PROMPT } from './src/data/portfolioContext.ts';

const PORT = Number(process.env.PORT) || 3000;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
] as const;
const GROQ_MODEL = process.env.GROQ_MODEL?.trim() || GROQ_MODELS[0];
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

interface IncomingChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function sanitizeMessages(raw: unknown): IncomingChatMessage[] | null {
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

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    if (!process.env.GROQ_API_KEY?.trim()) {
      dotenv.config({ override: true });
    }
    const configured = Boolean(process.env.GROQ_API_KEY?.trim());
    res.json({
      ok: true,
      endpoint: '/api/chat',
      groqKeyConfigured: configured,
      baseUrl: GROQ_BASE_URL,
      model: GROQ_MODEL,
    });
  });

  app.post('/api/chat', async (req, res) => {
    if (!process.env.GROQ_API_KEY?.trim()) {
      dotenv.config({ override: true });
    }
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        error:
          'GROQ_API_KEY is not configured on the server. Add GROQ_API_KEY to your server environment variables or local .env file and restart the server.',
        code: 'MISSING_API_KEY',
      });
      return;
    }

    const messages = sanitizeMessages(req.body?.messages);
    if (!messages) {
      res.status(400).json({
        error: 'Please enter a valid message before sending.',
        code: 'INVALID_REQUEST',
      });
      return;
    }

    try {
      const client = new OpenAI({
        apiKey,
        baseURL: GROQ_BASE_URL,
        timeout: 30000,
      });

      const candidateModels = Array.from(
        new Set([GROQ_MODEL, ...GROQ_MODELS])
      );

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
        } catch (modelErr: unknown) {
          const status = (modelErr as { status?: number })?.status;
          if (status === 404 || status === 400) {
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
        res.status(502).json({
          error: 'The AI assistant returned an empty response. Please try again.',
          code: 'EMPTY_RESPONSE',
        });
        return;
      }

      res.json({ reply });
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string };
      const status = typeof apiErr?.status === 'number' ? apiErr.status : 502;

      if (status === 401 || status === 403) {
        res.status(401).json({
          error:
            'Groq API authentication failed. Please check that GROQ_API_KEY is valid on the server.',
          code: 'INVALID_API_KEY',
        });
        return;
      }

      if (status === 429) {
        res.status(429).json({
          error:
            'Groq API rate limit reached. Please wait a moment and try again.',
          code: 'RATE_LIMITED',
        });
        return;
      }

      console.error('Groq chat error:', apiErr?.message ?? err);
      res.status(502).json({
        error:
          'Unable to reach the AI assistant right now. Please try again in a moment.',
        code: 'UPSTREAM_ERROR',
      });
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.', code: 'NOT_FOUND' });
  });

  app.use(
    (
      err: { type?: string; status?: number; message?: string },
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (!req.path.startsWith('/api')) {
        next(err);
        return;
      }
      if (err?.type === 'entity.parse.failed') {
        res.status(400).json({
          error: 'Invalid JSON request body.',
          code: 'INVALID_JSON',
        });
        return;
      }
      if (err?.type === 'entity.too.large') {
        res.status(413).json({
          error: 'Request payload is too large.',
          code: 'PAYLOAD_TOO_LARGE',
        });
        return;
      }
      const status = typeof err?.status === 'number' && err.status >= 400 ? err.status : 500;
      res.status(status).json({
        error: 'Internal server error while processing chat request.',
        code: 'SERVER_ERROR',
      });
    }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(import.meta.dirname, 'dist');
    const indexHtmlPath = path.join(distDir, 'index.html');

    app.use(express.static(distDir));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        next();
        return;
      }
      if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
