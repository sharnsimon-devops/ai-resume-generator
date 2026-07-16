import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { metaRouter } from './routes/meta.routes.js';
import { keysRouter } from './routes/keys.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { generationRouter } from './routes/generation.routes.js';
import { templateRouter } from './routes/template.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  const corsOptions = { origin: true, credentials: true, allowedHeaders: ['Content-Type', 'Authorization'] };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(express.json({ limit: '2mb' }));
  app.use(pinoHttp({ logger, redact: ['req.headers.authorization'] }));

  app.use('/api', metaRouter);
  app.use('/api/keys', keysRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/generations', generationRouter);
  app.use('/api/templates', templateRouter);

  app.use(errorHandler);

  return app;
}
