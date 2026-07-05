function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function lessonReminderMessage({ student, group, reminderMinutes }) {
  return [
    `Assalomu alaykum, <b>${escapeHtml(student.fullName || 'aziz oquvchi')}</b>!`,
    '',
    `Dars boshlanishiga <b>${reminderMinutes} daqiqa</b> qoldi.`,
    '',
    `Guruh: <b>${escapeHtml(group.name)}</b>`,
    `Boshlanish vaqti: <b>${escapeHtml(group.startTime)}</b>`,
    '',
    "Iltimos, darsga vaqtida tayyor bo'ling."
  ].join('\n');
}
