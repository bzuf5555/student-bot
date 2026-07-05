const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

export function createLogger(level = 'info') {
  const current = LEVELS[level] ?? LEVELS.info;

  function write(name, payload, message) {
    if ((LEVELS[name] ?? LEVELS.info) > current) return;
    const entry = {
      time: new Date().toISOString(),
      level: name,
      message,
      ...payload
    };
    const line = JSON.stringify(entry);
    if (name === 'error') console.error(line);
    else console.log(line);
  }

  return {
    error: (payload, message = 'error') => write('error', payload, message),
    warn: (payload, message = 'warn') => write('warn', payload, message),
    info: (payload, message = 'info') => write('info', payload, message),
    debug: (payload, message = 'debug') => write('debug', payload, message)
  };
}

