import dotenv from 'dotenv';
import express from 'express';

dotenv.config();
import fs from 'node:fs';
import path from 'node:path';
import {
  getRuntimeGroqConfig,
  processGroqChat,
} from './server/groqChatService.ts';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    if (!process.env.GROQ_API_KEY?.trim()) {
      dotenv.config({ override: true });
    }
    const { groqKeyConfigured, baseUrl, model } = getRuntimeGroqConfig();
    res.json({
      ok: true,
      endpoint: '/api/chat',
      groqKeyConfigured,
      baseUrl,
      model,
    });
  });

  app.post('/api/chat', async (req, res) => {
    if (!process.env.GROQ_API_KEY?.trim()) {
      dotenv.config({ override: true });
    }
    const requestId = `e-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const result = await processGroqChat(req.body, requestId);
    res.status(result.status).json(result.body);
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
