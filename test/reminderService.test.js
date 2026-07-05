import test from 'node:test';
import assert from 'node:assert/strict';
import { ReminderService } from '../src/reminderService.js';

test('ReminderService sends one reminder and marks it idempotently', async () => {
  const sent = [];
  const marks = new Set();
  const service = new ReminderService({
    backendClient: {
      fetchGroups: async () => [
        {
          id: 'g1',
          name: 'Backend',
          startTime: '11:25',
          students: [{ id: 's1', fullName: 'AbuBakir Ravshanov', telegramChatId: 777 }]
        }
      ]
    },
    telegramClient: {
      sendMessage: async (chatId, text) => sent.push({ chatId, text })
    },
    storage: {
      findChat: async (student) => student.telegramChatId,
      wasReminderSent: async (key) => marks.has(key),
      markReminderSent: async (key) => marks.add(key)
    },
    config: {
      timezone: 'Asia/Tashkent',
      reminderMinutes: 10,
      pollIntervalSeconds: 30
    },
    logger: {
      info() {},
      warn() {},
      error() {}
    }
  });

  const now = new Date('2026-07-05T06:15:00.000Z');
  await service.tick(now);
  await service.tick(now);

  assert.equal(sent.length, 1);
  assert.equal(sent[0].chatId, 777);
  assert.match(sent[0].text, /AbuBakir Ravshanov/);
});
