import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

// If env vars were not preloaded via --env-file, load from .env.local safely
if (!process.env.GEMINI_API_KEY) {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey.trim() === '') {
  console.error('ERROR: GEMINI_API_KEY is not configured in .env.local or environment.');
  process.exit(1);
}

const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey });

    // Test a trivial prompt
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Reply with the word "PONG".',
    });

    const reply = (response.text || '').trim();
    console.log(`GEMINI OK: ${reply.slice(0, 80)}`);
  } catch (err) {
    const errMsg = err?.message || String(err);
    console.error(`GEMINI ERROR: ${errMsg}`);

    // If model is not found or unsupported, list available models
    const lower = errMsg.toLowerCase();
    if (lower.includes('not found') || lower.includes('unsupported') || lower.includes('404') || lower.includes('invalid model')) {
      console.log('\nQuerying available models from Gemini API...');
      try {
        const ai = new GoogleGenAI({ apiKey });
        const list = await ai.models.list();
        const available = [];
        for await (const m of list) {
          if (m.name) {
            const cleanName = m.name.replace(/^models\//, '');
            available.push(cleanName);
          }
        }
        console.log('Available models for your API key:');
        console.log(available.join('\n'));
        const flashModels = available.filter((name) => name.includes('flash'));
        if (flashModels.length > 0) {
          console.log(`\nRecommended Flash model: ${flashModels[0]}`);
          console.log(`Set GEMINI_MODEL=${flashModels[0]} in frontend/.env.local`);
        }
      } catch (listErr) {
        console.error('Could not list models:', listErr?.message || listErr);
      }
    }
    process.exit(1);
  }
}

main();
