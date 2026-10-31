import { spawn } from 'node:child_process';
import http from 'node:http';

const routes = [
  { path: '/', expectRedirect: true },
  { path: '/dashboard', expectStatus: 200 },
  { path: '/buyers', expectStatus: 200 },
  { path: '/buyers/buyer_05', expectStatus: 200 },
  { path: '/invoices', expectStatus: 200 },
  { path: '/risk-radar', expectStatus: 200 },
  { path: '/cashflow', expectStatus: 200 },
  { path: '/reminders', expectStatus: 200 },
  { path: '/disputes', expectStatus: 200 },
  { path: '/assistant', expectStatus: 200 },
];

function checkServerReady(port, retries = 30) {
  return new Promise((resolve, reject) => {
    const check = (attempt) => {
      const req = http.get(`http://127.0.0.1:${port}/dashboard`, (res) => {
        resolve();
      });
      req.on('error', () => {
        if (attempt >= retries) {
          reject(new Error('Server failed to start in time.'));
        } else {
          setTimeout(() => check(attempt + 1), 500);
        }
      });
    };
    check(1);
  });
}

function fetchRoute(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}${path}`, {
      // Don't auto-follow redirects so we can inspect '/'
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          location: res.headers.location,
          bodyLength: body.length,
        });
      });
    });
    req.on('error', reject);
  });
}

async function main() {
  const port = 3001;
  console.log(`Starting next start on port ${port}...`);

  const serverProc = spawn('npx.cmd', ['next', 'start', '-p', String(port)], {
    shell: true,
    stdio: 'pipe',
  });

  serverProc.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
  serverProc.stderr.on('data', (d) => process.stderr.write(`[server err] ${d}`));

  try {
    await checkServerReady(port);
    console.log('\nServer is ready! Testing routes...\n');

    let allPassed = true;
    for (const r of routes) {
      const result = await fetchRoute(port, r.path);
      const isOk = r.expectRedirect
        ? (result.status === 307 || result.status === 308 || result.status === 200)
        : (result.status === 200);

      const statusNote = r.expectRedirect ? `${result.status} -> ${result.location}` : `${result.status}`;
      console.log(`Route: ${r.path.padEnd(22)} | Status: ${statusNote.padEnd(20)} | Result: ${isOk ? 'PASS' : 'FAIL'}`);

      if (!isOk) allPassed = false;
    }

    if (!allPassed) {
      console.error('\nSome routes failed verification!');
      process.exit(1);
    } else {
      console.log('\nALL 10 ROUTES VERIFIED (Status 200 / Redirects OK)!');
    }
  } catch (err) {
    console.error('Error during route testing:', err);
    process.exit(1);
  } finally {
    // Kill the server process and its process tree
    if (serverProc.pid) {
      try {
        spawn('taskkill', ['/pid', String(serverProc.pid), '/f', '/t']);
      } catch {}
    }
  }
}

main();
