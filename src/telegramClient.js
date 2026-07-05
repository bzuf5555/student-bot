import { TokenBucket } from './rateLimiter.js';

export class TelegramClient {
  constructor({ token, logger }) {
    this.token = token;
    this.logger = logger;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.bucket = new TokenBucket({ capacity: 25, refillPerSecond: 25 });
  }

  async call(method, body) {
    await this.bucket.take();
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      const description = payload.description || response.statusText;
      throw new Error(`Telegram ${method} failed: ${description}`);
    }
    return payload.result;
  }

  sendMessage(chatId, text, extra = {}) {
    return this.call('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra
    });
  }

  getUpdates(offset, timeout = 25) {
    return this.call('getUpdates', {
      offset,
      timeout,
      allowed_updates: ['message']
    });
  }
}

