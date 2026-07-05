export function getZonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);

  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
}

export function minutesSinceMidnight(date, timeZone) {
  const parts = getZonedParts(date, timeZone);
  return Number(parts.hour) * 60 + Number(parts.minute);
}

export function zonedDateKey(date, timeZone) {
  const parts = getZonedParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function targetReminderMinute(startTime, reminderMinutes) {
  const [hour, minute] = startTime.split(':').map(Number);
  return hour * 60 + minute - reminderMinutes;
}

export function isReminderDue({ now, timeZone, startTime, reminderMinutes }) {
  const current = minutesSinceMidnight(now, timeZone);
  const target = targetReminderMinute(startTime, reminderMinutes);
  return current >= target && current < target + 2;
}

