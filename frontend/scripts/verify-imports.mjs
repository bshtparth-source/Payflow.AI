import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Get all files tracked by git inside frontend
const trackedOutput = execSync('git ls-files', { encoding: 'utf8' });
const trackedSet = new Set(trackedOutput.split('\n').map((f) => f.trim().replace(/\\/g, '/')).filter(Boolean));

function getAllSourceFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(full.replace(/\\/g, '/'));
    }
  }
  return results;
}

const sourceFiles = getAllSourceFiles('src');
let errors = 0;

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const importLines = content.match(/from\s+['"][^'"]+['"]/g) || [];

  for (const imp of importLines) {
    const target = imp.match(/from\s+['"]([^'"]+)['"]/)[1];
    if (target.startsWith('@/')) {
      const relPath = target.replace('@/', 'src/');
      const candidates = [
        `${relPath}.ts`,
        `${relPath}.tsx`,
        `${relPath}.json`,
        `${relPath}/index.ts`,
        `${relPath}/index.tsx`,
        relPath,
      ];

      const found = candidates.find((c) => trackedSet.has(c));
      if (!found) {
        console.error(`Import error in ${file}: target "${target}" (tried ${candidates.join(', ')}) not found in tracked git files!`);
        errors++;
      }
    } else if (target.startsWith('.')) {
      const resolved = path.normalize(path.join(path.dirname(file), target)).replace(/\\/g, '/');
      const candidates = [
        `${resolved}.ts`,
        `${resolved}.tsx`,
        `${resolved}.json`,
        `${resolved}/index.ts`,
        `${resolved}/index.tsx`,
        resolved,
      ];

      const found = candidates.find((c) => trackedSet.has(c));
      if (!found) {
        console.error(`Import error in ${file}: relative target "${target}" (tried ${candidates.join(', ')}) not found in tracked git files!`);
        errors++;
      }
    }
  }
}

if (errors === 0) {
  console.log('CASE-SENSITIVITY & IMPORT CHECK PASSED: All module imports match git tracked file casing perfectly.');
} else {
  console.error(`Found ${errors} import casing or resolution errors.`);
  process.exit(1);
}
