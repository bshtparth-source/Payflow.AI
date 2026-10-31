import 'server-only';
import { GoogleGenAI } from '@google/genai';

function cleanEnvValue(val?: string): string | null {
  if (!val) return null;
  let trimmed = val.trim();
  // Strip surrounding quotes if user entered them in Vercel UI or .env
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed.length > 0 ? trimmed : null;
}

export function getGeminiApiKey(): string | null {
  return cleanEnvValue(process.env.GEMINI_API_KEY);
}

export function getGeminiModel(): string {
  const model = cleanEnvValue(process.env.GEMINI_MODEL);
  return model || 'gemini-3.5-flash';
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey() !== null;
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing or empty.');
  }
  return new GoogleGenAI({ apiKey });
}
