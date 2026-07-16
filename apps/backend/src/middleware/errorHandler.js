import { logger } from '../lib/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error({ err, path: req.path }, 'unhandled request error');
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.publicMessage || 'internal_error' });
}
