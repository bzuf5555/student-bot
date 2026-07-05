function pick(object, keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null && object?.[key] !== '') {
      return object[key];
    }
  }
  return undefined;
}

export function normalizeTime(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toTimeString().slice(0, 5);
  }
  const raw = String(value).trim();
  const hhmm = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (hhmm) return `${hhmm[1].padStart(2, '0')}:${hhmm[2]}`;
  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) return date.toTimeString().slice(0, 5);
  return null;
}

export function normalizeStudent(student) {
  const firstName = pick(student, ['firstName', 'first_name', 'name', 'ism']) || '';
  const lastName = pick(student, ['lastName', 'last_name', 'surname', 'familya']) || '';
  const fullName = pick(student, ['fullName', 'full_name', 'fio']) || `${firstName} ${lastName}`.trim();

  return {
    id: String(pick(student, ['id', '_id', 'studentId', 'student_id']) || fullName),
    fullName,
    telegramUserId: pick(student, ['telegramUserId', 'telegram_user_id', 'telegramId', 'telegram_id']),
    telegramUsername: pick(student, ['telegramUsername', 'telegram_username', 'username']),
    telegramChatId: pick(student, ['telegramChatId', 'telegram_chat_id', 'chatId', 'chat_id'])
  };
}

export function normalizeGroup(group) {
  const startTime = normalizeTime(pick(group, ['startTime', 'start_time', 'lessonTime', 'lesson_time', 'time']));
  const students = pick(group, ['students', 'pupils', 'oquvchilar']) || [];
  const normalizedStudents = Array.isArray(students) ? students.map(normalizeStudent) : [];
  const uniqueStudents = new Map();
  for (const student of normalizedStudents) {
    const key = student.telegramUserId || student.telegramUsername || student.telegramChatId || student.id;
    if (!uniqueStudents.has(String(key))) uniqueStudents.set(String(key), student);
  }

  return {
    id: String(pick(group, ['id', '_id', 'groupId', 'group_id']) || pick(group, ['name', 'title']) || 'unknown-group'),
    name: String(pick(group, ['name', 'title', 'groupName', 'group_name']) || 'Nomsiz guruh'),
    startTime,
    students: [...uniqueStudents.values()]
  };
}

export function normalizeGroups(groups) {
  return groups.map(normalizeGroup).filter((group) => group.startTime && group.students.length > 0);
}
