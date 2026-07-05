import fs from 'node:fs';
import path from 'node:path';

export function loadDotEnv(filePath = '.env') {
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) return;

  const lines = fs.readFileSync(absolute, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, '');
  }
}

function numberEnv(name, fallback, { min = 0 } = {}) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min) {
    throw new Error(`${name} must be a number >= ${min}`);
  }
  return value;
}

export function getConfig() {
  const botToken = process.env.BOT_TOKEN;
  const backendBaseUrl = process.env.BACKEND_BASE_URL;

  if (!botToken) throw new Error('BOT_TOKEN is required');
  if (!backendBaseUrl) throw new Error('BACKEND_BASE_URL is required');

  return {
    botToken,
    backendBaseUrl: backendBaseUrl.replace(/\/+$/, ''),
    backendApiKey: process.env.BACKEND_API_KEY || '',
    timezone: process.env.TIMEZONE || 'Asia/Tashkent',
    reminderMinutes: numberEnv('REMINDER_MINUTES', 10, { min: 1 }),
    pollIntervalSeconds: numberEnv('POLL_INTERVAL_SECONDS', 30, { min: 5 }),
    port: numberEnv('PORT', 3000, { min: 1 }),
    dataFile: process.env.DATA_FILE || './data/bot-state.json',
    logLevel: process.env.LOG_LEVEL || 'info'
  };
}

