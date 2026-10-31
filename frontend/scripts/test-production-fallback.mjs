import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Read local .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
let savedKey = '';
let savedModel = '';

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (key === 'GEMINI_API_KEY') savedKey = val;
        if (key === 'GEMINI_MODEL') savedModel = val;
      }
    }
  }
}

// Load built handlers
const aiStatusModule = require(path.resolve(process.cwd(), '.next/server/app/api/ai-status/route.js'));
const chatModule = require(path.resolve(process.cwd(), '.next/server/app/api/chat/route.js'));

const statusHandler = aiStatusModule.routeModule?.userland?.GET || aiStatusModule.GET;
const chatHandler = chatModule.routeModule?.userland?.POST || chatModule.POST;

async function runTests() {
  console.log('--- Test Suite: Production Fallback & Status Probe ---\n');

  // Test Case A1: Unset key in Development
  console.log('1. Testing unset key in DEVELOPMENT:');
  delete process.env.GEMINI_API_KEY;
  process.env.NODE_ENV = 'development';
  delete process.env.VERCEL_ENV;

  const resA1Status = await statusHandler(new Request('http://localhost/api/ai-status'));
  const statusDataA1 = await resA1Status.json();
  console.log('   /api/ai-status -> configured:', statusDataA1.configured);
  if (statusDataA1.configured !== false) {
    throw new Error('Expected configured to be false when key is unset');
  }

  const resA1Chat = await chatHandler(
    new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
    })
  );
  console.log('   /api/chat HTTP status:', resA1Chat.status);
  const chatDataA1 = await resA1Chat.json();
  console.log('   /api/chat error message:', chatDataA1.error);
  if (resA1Chat.status !== 400 || !chatDataA1.error.includes('.env.local')) {
    throw new Error('Expected 400 with dev setup instructions');
  }

  // Test Case A2: Unset key in Production
  console.log('\n2. Testing unset key in PRODUCTION:');
  delete process.env.GEMINI_API_KEY;
  process.env.NODE_ENV = 'production';
  process.env.VERCEL_ENV = 'production';

  const resA2Chat = await chatHandler(
    new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
    })
  );
  console.log('   /api/chat HTTP status:', resA2Chat.status);
  const chatDataA2 = await resA2Chat.json();
  console.log('   /api/chat error message:', chatDataA2.error);
  if (
    resA2Chat.status !== 400 ||
    chatDataA2.error !==
      'The AI assistant is temporarily unavailable. Please try again in a moment.'
  ) {
    throw new Error('Expected 400 with friendly production fallback message');
  }

  // Test Case B: Set key
  console.log('\n3. Testing configured key:');
  if (!savedKey) {
    console.log('   (Skipping live generation: no GEMINI_API_KEY in local .env.local)');
    return;
  }

  process.env.GEMINI_API_KEY = savedKey;
  process.env.GEMINI_MODEL = savedModel || 'gemini-3.5-flash';
  process.env.NODE_ENV = 'development';
  delete process.env.VERCEL_ENV;

  const resBStatus = await statusHandler(new Request('http://localhost/api/ai-status'));
  const statusDataB = await resBStatus.json();
  console.log('   /api/ai-status -> configured:', statusDataB.configured, 'model:', statusDataB.model);
  if (statusDataB.configured !== true) {
    throw new Error('Expected configured to be true when key is set');
  }

  console.log('   Calling /api/chat stream with sample prompt...');
  const resBChat = await chatHandler(
    new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Say OK' }] }),
    })
  );
  console.log('   /api/chat HTTP status:', resBChat.status);
  if (resBChat.status !== 200) {
    throw new Error(`Expected 200 stream, got ${resBChat.status}`);
  }

  const reader = resBChat.body.getReader();
  const decoder = new TextDecoder();
  let streamed = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    streamed += decoder.decode(value);
  }
  console.log('   Streamed reply length:', streamed.length, 'chars');
  console.log('\nAll production fallback and status probe tests passed successfully!');
}

runTests().catch((err) => {
  console.error('\nTest failed:', err);
  process.exit(1);
});
