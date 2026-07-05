import { normalizeGroups } from './normalizer.js';
import { lessonReminderMessage } from './messageTemplate.js';
import { isReminderDue, zonedDateKey } from './time.js';

export class ReminderService {
  constructor({ backendClient, telegramClient, storage, config, logger }) {
    this.backendClient = backendClient;
    this.telegramClient = telegramClient;
    this.storage = storage;
    this.config = config;
    this.logger = logger;
    this.timer = null;
    this.running = false;
  }

  start() {
    const intervalMs = this.config.pollIntervalSeconds * 1000;
    this.tick().catch((error) => this.logger.error({ error: error.message }, 'initial reminder tick failed'));
    this.timer = setInterval(() => {
      this.tick().catch((error) => this.logger.error({ error: error.message }, 'reminder tick failed'));
    }, intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  async tick(now = new Date()) {
    if (this.running) return;
    this.running = true;
    try {
      const rawGroups = await this.backendClient.fetchGroups();
      const groups = normalizeGroups(rawGroups);
      for (const group of groups) {
        if (!isReminderDue({
          now,
          timeZone: this.config.timezone,
          startTime: group.startTime,
          reminderMinutes: this.config.reminderMinutes
        })) {
          continue;
        }
        await this.sendGroupReminders(group, now);
      }
    } finally {
      this.running = false;
    }
  }

  async sendGroupReminders(group, now) {
    const dateKey = zonedDateKey(now, this.config.timezone);
    for (const student of group.students) {
      const reminderKey = `${dateKey}|${group.id}|${group.startTime}|${student.id}`;
      if (await this.storage.wasReminderSent(reminderKey)) continue;

      const chatId = await this.storage.findChat(student);
      if (!chatId) {
        this.logger.warn({ groupId: group.id, studentId: student.id }, 'student telegram chat not found');
        continue;
      }

      await this.telegramClient.sendMessage(
        chatId,
        lessonReminderMessage({ student, group, reminderMinutes: this.config.reminderMinutes })
      );
      await this.storage.markReminderSent(reminderKey, {
        groupId: group.id,
        groupName: group.name,
        startTime: group.startTime,
        studentId: student.id,
        studentName: student.fullName,
        chatId
      });
      this.logger.info({ groupId: group.id, studentId: student.id, chatId }, 'reminder sent');
    }
  }
}

