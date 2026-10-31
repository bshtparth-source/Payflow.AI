import { NextRequest } from 'next/server';
import { getGeminiClient, getGeminiApiKey, getGeminiModel } from '@/lib/gemini';
import { getAssistantSystemInstruction } from '@/lib/assistant-prompt';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// In-memory IP rate limiter: max 20 requests per minute
const ipRateLimits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (record.count >= 20) {
    return true;
  }
  record.count += 1;
  return false;
}

function isProductionMode(): boolean {
  if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') {
    return true;
  }
  if (process.env.VERCEL_ENV === 'development') {
    return false;
  }
  const dynamicNodeEnv = process.env[['NODE', 'ENV'].join('_')];
  if (dynamicNodeEnv === 'production') {
    return true;
  }
  if (dynamicNodeEnv === 'development' || dynamicNodeEnv === 'test') {
    return false;
  }
  return process.env.NODE_ENV === 'production';
}

function mapGeminiError(error: any, modelName: string): { status: number; message: string } {
  const errMsg = error?.message || String(error);
  const lower = errMsg.toLowerCase();
  const isProd = isProductionMode();

  if (
    lower.includes('api key') ||
    lower.includes('unauthenticated') ||
    lower.includes('invalid api_key')
  ) {
    console.warn(
      `[chat] Invalid or missing Gemini API key (VERCEL_ENV=${process.env.VERCEL_ENV ?? 'local'}, NODE_ENV=${process.env.NODE_ENV})`
    );
    return {
      status: 401,
      message: isProd
        ? 'The AI assistant is temporarily unavailable. Please try again in a moment.'
        : 'Invalid or unconfigured Gemini API key. Please verify GEMINI_API_KEY in frontend/.env.local.',
    };
  }
  if (
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('resource_exhausted') ||
    lower.includes('429')
  ) {
    return {
      status: 429,
      message: 'Too many requests, please wait a few seconds and retry',
    };
  }
  if (
    lower.includes('not found') ||
    lower.includes('404') ||
    lower.includes('unsupported model')
  ) {
    console.warn(`[chat] Gemini model "${modelName}" not found or unsupported`);
    return {
      status: 404,
      message: 'The AI assistant is temporarily unavailable. Please try again in a moment.',
    };
  }
  if (lower.includes('timed out') || lower.includes('timeout')) {
    return {
      status: 504,
      message: 'Request timed out. Please try again in a moment.',
    };
  }
  if (
    lower.includes('fetch failed') ||
    lower.includes('econnrefused') ||
    lower.includes('network')
  ) {
    return {
      status: 502,
      message: 'Network error connecting to Gemini AI. Please check your connection and retry.',
    };
  }
  return {
    status: 500,
    message: 'The AI assistant is temporarily unavailable. Please try again in a moment.',
  };
}

export async function POST(req: NextRequest) {
  // 1. In-memory Rate Limiting per IP
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  if (isRateLimited(clientIp)) {
    return Response.json(
      { error: 'Too many requests, please wait a few seconds and retry' },
      { status: 429 }
    );
  }

  // 2. Parse & Validate Request Body
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: 'Payload must contain a non-empty messages array.' },
      { status: 400 }
    );
  }

  // Check character limits (max 1000 chars per message)
  for (const msg of messages) {
    if (!msg || typeof msg.content !== 'string') {
      return Response.json(
        { error: 'Each message must have a string content.' },
        { status: 400 }
      );
    }
    if (msg.content.length > 1000) {
      return Response.json(
        { error: 'Individual messages must not exceed 1000 characters.' },
        { status: 400 }
      );
    }
  }

  // 3. Verify Gemini Configuration at Request Time
  const apiKey = getGeminiApiKey();
  const modelName = getGeminiModel();

  if (!apiKey) {
    console.warn(
      `[chat] GEMINI_API_KEY is missing (VERCEL_ENV=${process.env.VERCEL_ENV ?? 'local'}, NODE_ENV=${process.env.NODE_ENV})`
    );
    const friendlyMsg = isProductionMode()
      ? 'The AI assistant is temporarily unavailable. Please try again in a moment.'
      : 'Gemini API key is not configured. Add GEMINI_API_KEY to frontend/.env.local to enable live responses.';

    return Response.json({ error: friendlyMsg }, { status: 400 });
  }

  // 4. Trim to last 10 messages and format for Gemini SDK
  const trimmed = messages.slice(-10);
  const contents = trimmed.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Ensure conversation begins with a 'user' message
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  if (contents.length === 0) {
    return Response.json(
      { error: 'No valid user message found to respond to.' },
      { status: 400 }
    );
  }

  try {
    const ai = getGeminiClient();
    const systemInstruction = getAssistantSystemInstruction();

    // 30 seconds max timeout promise
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
    );

    const streamPromise = ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const responseStream = await Promise.race([streamPromise, timeoutPromise]);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (streamErr: any) {
          console.error('[chat] Stream interrupted:', streamErr?.message || streamErr);
          const mapped = mapGeminiError(streamErr, modelName);
          controller.enqueue(
            encoder.encode(`\n\n*(Error: ${mapped.message})*`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: any) {
    console.error('[chat] Gemini API Error:', error?.message || error);
    const mapped = mapGeminiError(error, modelName);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}
