import fs from 'node:fs/promises';
import path from 'node:path';

const EMPTY_STATE = {
  registrationsByTelegramId: {},
  registrationsByUsername: {},
  sentReminders: {}
};

export class JsonStorage {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    this.state = structuredClone(EMPTY_STATE);
    this.ready = this.load();
  }

  async load() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      this.state = {
        ...structuredClone(EMPTY_STATE),
        ...parsed,
        registrationsByTelegramId: parsed.registrationsByTelegramId || {},
        registrationsByUsername: parsed.registrationsByUsername || {},
        sentReminders: parsed.sentReminders || {}
      };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await this.save();
    }
  }

  async save() {
    const tmp = `${this.filePath}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(this.state, null, 2)}\n`);
    await fs.rename(tmp, this.filePath);
  }

  async upsertRegistration(registration) {
    await this.ready;
    const normalized = {
      chatId: String(registration.chatId),
      telegramId: String(registration.telegramId),
      username: registration.username ? registration.username.toLowerCase() : '',
      firstName: registration.firstName || '',
      lastName: registration.lastName || '',
      updatedAt: new Date().toISOString()
    };

    this.state.registrationsByTelegramId[normalized.telegramId] = normalized;
    if (normalized.username) {
      this.state.registrationsByUsername[normalized.username] = normalized;
    }
    await this.save();
    return normalized;
  }

  async findChat(student) {
    await this.ready;
    if (student.telegramUserId) {
      const byId = this.state.registrationsByTelegramId[String(student.telegramUserId)];
      if (byId) return byId.chatId;
    }
    if (student.telegramUsername) {
      const username = String(student.telegramUsername).replace(/^@/, '').toLowerCase();
      const byUsername = this.state.registrationsByUsername[username];
      if (byUsername) return byUsername.chatId;
    }
    if (student.telegramChatId) return String(student.telegramChatId);
    return null;
  }

  async wasReminderSent(key) {
    await this.ready;
    return Boolean(this.state.sentReminders[key]);
  }

  async markReminderSent(key, metadata) {
    await this.ready;
    this.state.sentReminders[key] = {
      ...metadata,
      sentAt: new Date().toISOString()
    };
    await this.save();
  }
}

