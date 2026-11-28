import dotenv from 'dotenv';
import express from 'express';

dotenv.config();
import fs from 'node:fs';
import path from 'node:path';
import {
  extractClientIp,
  getRuntimeGroqConfig,
  processGroqChat,
} from './server/groqChatService.ts';

const PORT = Number(process.env.PORT) || 3000;

const SITEMAP_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/achievements', changefreq: 'monthly', priority: '0.8' },
  { path: '/skills', changefreq: 'monthly', priority: '0.8' },
  { path: '/certifications', changefreq: 'monthly', priority: '0.8' },
  { path: '/education', changefreq: 'monthly', priority: '0.8' },
  { path: '/projects', changefreq: 'monthly', priority: '0.7' },
  { path: '/resume', changefreq: 'monthly', priority: '0.8' },
  { path: '/portfolio-deck', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
] as const;

function isLocalHostname(host: string): boolean {
  const bare = host.split(':')[0]?.toLowerCase() ?? '';
  return (
    bare === 'localhost' ||
    bare === '127.0.0.1' ||
    bare === '0.0.0.0' ||
    bare === '[::1]' ||
    bare === '::1'
  );
}

function resolveCanonicalBaseUrl(req: express.Request): string {
  const envUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || '')
    .trim()
    .replace(/\/+$/, '');
  if (envUrl) return envUrl;
  const host = req.get('host');
  if (!host) return '';
  const proto = isLocalHostname(host) ? req.protocol || 'http' : 'https';
  return `${proto}://${host}`;
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  const isProduction = process.env.NODE_ENV === 'production';

  // Force HTTPS in production on public hosts & apply defensive security headers
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    const forwardedProto = req.get('x-forwarded-proto');

    if (
      isProduction &&
      host &&
      !isLocalHostname(host) &&
      forwardedProto &&
      forwardedProto.toLowerCase() === 'http'
    ) {
      res.redirect(301, `https://${host}${req.originalUrl}`);
      return;
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (isProduction && (req.secure || forwardedProto === 'https')) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    next();
  });

  app.use(express.json({ limit: '64kb' }));

  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveCanonicalBaseUrl(req);
    const sitemapUrl = baseUrl ? `${baseUrl}/sitemap.xml` : '/sitemap.xml';
    res.type('text/plain; charset=utf-8');
    res.send(
      `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${sitemapUrl}\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveCanonicalBaseUrl(req);
    const urlEntries = SITEMAP_ROUTES.map(
      (entry) =>
        `  <url>\n    <loc>${baseUrl}${entry.path}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
    ).join('\n');

    res.type('application/xml; charset=utf-8');
    res.send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
    );
  });

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
    const clientIp = extractClientIp(req.headers, req.ip || req.socket.remoteAddress);
    const result = await processGroqChat(req.body, requestId, clientIp);
    if (result.retryAfterSeconds && result.retryAfterSeconds > 0) {
      res.setHeader('Retry-After', String(result.retryAfterSeconds));
    }
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

  if (!isProduction) {
    const publicAssetsDir = path.resolve(import.meta.dirname, 'public', 'assets');
    app.use(
      '/assets',
      express.static(publicAssetsDir, {
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
          if (/\.(webp|png|jpe?g|svg|ico|pdf)$/i.test(filePath)) {
            res.setHeader(
              'Cache-Control',
              'public, max-age=3600, stale-while-revalidate=86400'
            );
          }
        },
      })
    );

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(import.meta.dirname, 'dist');
    const indexHtmlPath = path.join(distDir, 'index.html');

    app.use(
      express.static(distDir, {
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
          const normalized = filePath.replace(/\\/g, '/');
          if (normalized.endsWith('/index.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
            return;
          }
          if (
            /\/assets\/[^/]+-[a-zA-Z0-9_-]{6,}\.(js|css|woff2?)$/i.test(
              normalized
            )
          ) {
            res.setHeader(
              'Cache-Control',
              'public, max-age=31536000, immutable'
            );
            return;
          }
          if (/\.(webp|png|jpe?g|svg|ico|pdf)$/i.test(normalized)) {
            res.setHeader(
              'Cache-Control',
              'public, max-age=604800, stale-while-revalidate=2592000'
            );
          }
        },
      })
    );
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        next();
        return;
      }
      if (fs.existsSync(indexHtmlPath)) {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
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
