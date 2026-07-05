import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignoredDirs = new Set(['.git', 'node_modules', 'data', 'logs', 'coverage']);
const tokenPattern = /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g;
const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    const relative = path.relative(root, fullPath);
    if (relative === '.env' || relative.startsWith('.env.')) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const matches = content.match(tokenPattern);
    if (matches) findings.push({ file: relative, count: matches.length });
  }
}

walk(root);

if (findings.length > 0) {
  console.error('Potential Telegram bot token found in tracked project files:');
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.count}`);
  }
  process.exit(1);
}

console.log('No Telegram bot tokens found in project files.');

