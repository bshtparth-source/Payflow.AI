import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getAssistantSystemInstruction } from '@/lib/assistant-prompt';

export const runtime = 'nodejs';

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

export async function POST(req: NextRequest) {
  // 1. In-memory Rate Limiting per IP
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
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
    return Response.json({ error: 'Payload must contain a non-empty messages array' }, { status: 400 });
  }

  // Check character limits (max 1000 chars per message)
  for (const msg of messages) {
    if (!msg || typeof msg.content !== 'string') {
      return Response.json({ error: 'Each message must have a string content' }, { status: 400 });
    }
    if (msg.content.length > 1000) {
      return Response.json(
        { error: 'Individual messages must not exceed 1000 characters.' },
        { status: 400 }
      );
    }
  }

  // 3. Check GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return new Response(
      'Gemini API key is not configured. Add GEMINI_API_KEY to .env.local to enable live responses.',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      }
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
    return Response.json({ error: 'No user message found to respond to.' }, { status: 400 });
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  try {
    const ai = new GoogleGenAI({ apiKey });
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
        } catch (streamErr) {
          console.error('Error during chunk streaming:', streamErr);
          controller.enqueue(
            encoder.encode('\n\n*(Response stream interrupted. Please retry.)*')
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
    return new Response(
      `PayFlow AI encountered an error while analyzing ledger data: ${
        error?.message?.includes('API key')
          ? 'Invalid Gemini API key provided.'
          : 'Service temporarily unavailable. Please retry shortly.'
      }`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      }
    );
  }
}
