import { NextResponse } from 'next/server';
import { isGeminiConfigured, getGeminiModel } from '@/lib/gemini';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const configured = isGeminiConfigured();
  const model = getGeminiModel();
  const environment = process.env.VERCEL_ENV ?? 'local';

  return NextResponse.json({
    configured,
    model,
    environment,
  });
}
