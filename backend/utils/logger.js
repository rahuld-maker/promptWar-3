const levelOrder = ['info', 'warn', 'error'];

const formatEntry = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const payload = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${payload}`;
};

/**
 * Lightweight structured logger for backend diagnostics.
 *
 * @type {{info: (message: string, meta?: Record<string, unknown>) => void, warn: ... , error: ...}}
 */
export const logger = {
  info(message, meta = {}) {
    if (process.env.NODE_ENV !== 'test') {
      console.info(formatEntry('info', message, meta));
    }
  },
  warn(message, meta = {}) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(formatEntry('warn', message, meta));
    }
  },
  error(message, meta = {}) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(formatEntry('error', message, meta));
    }
  },
};

export const logLevel = (level, message, meta = {}) => {
  if (!levelOrder.includes(level)) {
    return;
  }

  logger[level](message, meta);
};
