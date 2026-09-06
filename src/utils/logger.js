/**
 * Minimal timestamped logger.
 *
 * Page objects log the actions they perform, so a failing run reads as a
 * narrative of what was done rather than a bare stack trace.
 */

const LEVELS = { INFO: 'INFO ', WARN: 'WARN ', ERROR: 'ERROR' };

function write(level, message) {
  const stamp = new Date().toISOString().slice(11, 23);
  // eslint-disable-next-line no-console
  console.log(`${stamp} ${level} ${message}`);
}

const logger = {
  info: (message) => write(LEVELS.INFO, message),
  warn: (message) => write(LEVELS.WARN, message),
  error: (message) => write(LEVELS.ERROR, message),
};

module.exports = { logger };
