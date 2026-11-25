import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const BASE_URL = process.env.DIAGNOSE_BASE_URL || 'http://127.0.0.1:3000';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';

async function runDiagnostics() {
  console.log('=== Portfolio Assistant Backend Diagnostics ===');
  console.log(`Target server: ${BASE_URL}`);

  // 1. Check local environment access (never print secret values)
  const localKey = process.env.GROQ_API_KEY?.trim();
  console.log(
    `[1/4] Local process.env.GROQ_API_KEY: ${
      localKey ? `SET (length ${localKey.length})` : 'NOT SET'
    }`
  );

  // 2. Check /api/health endpoint reachability and server-side env access
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthType = healthRes.headers.get('content-type') || '';
    if (!healthType.includes('application/json')) {
      console.error(
        `[2/4] FAIL: /api/health returned ${healthRes.status} (${healthType}) instead of JSON.`
      );
      process.exitCode = 1;
      return;
    }
    const healthData = (await healthRes.json()) as {
      ok?: boolean;
      endpoint?: string;
      groqKeyConfigured?: boolean;
      model?: string;
      baseUrl?: string;
    };
    console.log(
      `[2/4] /api/health reachable (HTTP ${healthRes.status}) — groqKeyConfigured: ${Boolean(
        healthData.groqKeyConfigured
      )}, model: ${healthData.model}, baseUrl: ${healthData.baseUrl}`
    );
  } catch (err) {
    console.error(
      `[2/4] FAIL: Cannot reach ${BASE_URL}/api/health — ${(err as Error).message}`
    );
    process.exitCode = 1;
    return;
  }

  // 3. Test POST /api/chat endpoint reachability and response structure
  try {
    const chatRes = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Say "Assistant online" in 3 words.' }],
      }),
    });

    const chatType = chatRes.headers.get('content-type') || '';
    if (!chatType.includes('application/json')) {
      console.error(
        `[3/4] FAIL: POST /api/chat returned ${chatRes.status} (${chatType}) instead of JSON.`
      );
      process.exitCode = 1;
      return;
    }

    const chatData = (await chatRes.json()) as {
      reply?: string;
      error?: string;
      code?: string;
    };

    if (chatRes.ok && chatData.reply?.trim()) {
      console.log(
        `[3/4] PASS: POST /api/chat returned HTTP ${chatRes.status} with non-empty reply: "${chatData.reply.trim()}"`
      );
    } else {
      console.warn(
        `[3/4] POST /api/chat reachable (HTTP ${chatRes.status}, code=${
          chatData.code || 'UNKNOWN'
        }): ${chatData.error || 'No reply'}`
      );
      if (chatData.code === 'MISSING_API_KEY') {
        console.warn(
          '      Action needed: Set GROQ_API_KEY in /.env or server Secrets so /api/chat can call Groq.'
        );
      }
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(
      `[3/4] FAIL: Error calling POST /api/chat — ${(err as Error).message}`
    );
    process.exitCode = 1;
  }

  // 4. Direct OpenAI SDK + Groq initialization check when local key is present
  if (localKey) {
    try {
      const client = new OpenAI({
        apiKey: localKey,
        baseURL: GROQ_BASE_URL,
      });
      const test = await client.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: 'Reply with OK.' }],
        max_tokens: 300,
      });
      const text = test.choices[0]?.message?.content?.trim();
      console.log(
        `[4/4] Direct Groq SDK initialization check: ${
          text ? `PASS ("${text}")` : 'FAIL (empty choice)'
        }`
      );
    } catch (err) {
      console.error(
        `[4/4] Direct Groq SDK check failed: ${(err as Error).message}`
      );
      process.exitCode = 1;
    }
  } else {
    console.log(
      '[4/4] Skipped direct Groq SDK check because local GROQ_API_KEY is not set.'
    );
  }
}

void runDiagnostics();
