import { NextRequest } from 'next/server';
import { getGeminiClient, geminiModel } from '@/lib/gemini';
import { getAssistantSystemInstruction } from '@/lib/assistant-prompt';

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

function mapGeminiError(error: any): { status: number; message: string } {
  const errMsg = error?.message || String(error);
  const lower = errMsg.toLowerCase();

  if (
    lower.includes('api key') ||
    lower.includes('unauthenticated') ||
    lower.includes('invalid api_key')
  ) {
    return {
      status: 401,
      message:
        'Invalid or unconfigured Gemini API key. Please verify GEMINI_API_KEY in frontend/.env.local.',
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
      message: 'Gemini API quota or rate limit exceeded. Please wait a minute and retry.',
    };
  }
  if (
    lower.includes('not found') ||
    lower.includes('404') ||
    lower.includes('unsupported model')
  ) {
    return {
      status: 404,
      message: `Gemini model "${geminiModel}" was not found or is unsupported for this key.`,
    };
  }
  if (lower.includes('timed out') || lower.includes('timeout')) {
    return {
      status: 504,
      message: 'Request timed out after 30 seconds. Please try again.',
    };
  }
  if (
    lower.includes('fetch failed') ||
    lower.includes('econnrefused') ||
    lower.includes('network')
  ) {
    return {
      status: 502,
      message: 'Network error connecting to Gemini API. Please check your internet connection.',
    };
  }
  return {
    status: 500,
    message: `Gemini API server error: ${errMsg.slice(0, 150)}`,
  };
}

export async function POST(req: NextRequest) {
  // 1. In-memory Rate Limiting per IP
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  if (isRateLimited(clientIp)) {
    return Response.json(
      { error: 'Rate limit exceeded. Please wait a minute before sending more queries.' },
      { status: 429 }
    );
  }

  // 2. Parse & Validate Request Body
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
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

  // 3. Verify Gemini Client
  let ai;
  try {
    ai = getGeminiClient();
  } catch (err: any) {
    return Response.json(
      {
        error:
          'Gemini API key is not configured. Add GEMINI_API_KEY to frontend/.env.local to enable live responses.',
      },
      { status: 400 }
    );
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
    const systemInstruction = getAssistantSystemInstruction();

    // 30 seconds max timeout promise
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
    );

    const streamPromise = ai.models.generateContentStream({
      model: geminiModel,
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
          console.error('Error during chunk streaming:', streamErr);
          const mapped = mapGeminiError(streamErr);
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
    console.error('Gemini API Error:', error?.message || error);
    const mapped = mapGeminiError(error);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}
