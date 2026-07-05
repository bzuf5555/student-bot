import test from 'node:test';
import assert from 'node:assert/strict';
import { isReminderDue, targetReminderMinute } from '../src/time.js';

test('targetReminderMinute subtracts reminder window', () => {
  assert.equal(targetReminderMinute('11:25', 10), 675);
});

test('isReminderDue returns true inside due minute window', () => {
  const now = new Date('2026-07-05T06:15:00.000Z');
  assert.equal(
    isReminderDue({
      now,
      timeZone: 'Asia/Tashkent',
      startTime: '11:25',
      reminderMinutes: 10
    }),
    true
  );
});

