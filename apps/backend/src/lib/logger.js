import pino from 'pino';

export const logger = pino({
  redact: {
    paths: [
      'apiKey',
      'anthropicKey',
      'plaintextKey',
      '*.apiKey',
      '*.anthropicKey',
      '*.plaintextKey',
      'req.headers.authorization',
    ],
    censor: '[REDACTED]',
  },
});
