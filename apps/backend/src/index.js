import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { closeBrowser } from './services/renderService.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'backend listening');
});

server.requestTimeout = 120_000;

process.on('SIGTERM', () => {
  server.close(async () => {
    await closeBrowser();
    process.exit(0);
  });
});
