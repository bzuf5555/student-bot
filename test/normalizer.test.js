import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGroups, normalizeTime } from '../src/normalizer.js';

test('normalizeTime accepts HH:mm and pads hour', () => {
  assert.equal(normalizeTime('9:05'), '09:05');
  assert.equal(normalizeTime('11:25'), '11:25');
});

test('normalizeGroups accepts common backend field variants', () => {
  const groups = normalizeGroups([
    {
      _id: 'g1',
      group_name: 'Frontend',
      lesson_time: '11:25',
      oquvchilar: [
        {
          _id: 's1',
          ism: 'Biloliddin',
          familya: 'Zufarov',
          telegram_user_id: 123
        }
      ]
    }
  ]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].id, 'g1');
  assert.equal(groups[0].name, 'Frontend');
  assert.equal(groups[0].startTime, '11:25');
  assert.equal(groups[0].students[0].fullName, 'Biloliddin Zufarov');
  assert.equal(groups[0].students[0].telegramUserId, 123);
});

