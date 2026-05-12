import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';

import { env } from './config/env.js';
import { prisma } from './db/prisma.js';
import { logger } from './shared/utils/logger.js';
import {
  requestId,
  httpLogger,
  notFoundHandler,
  errorHandler,
} from './shared/middleware/index.js';
import { authRouter } from './modules/auth/routes.js';
import { usersRouter } from './modules/users/routes.js';

export const createApp = (): Application => {
  const app = express();

  app.disable('x-powered-by');

  // Trust the first proxy hop (e.g., nginx, cloudflare)
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }),
  );

  // Body parsers
  app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: false, limit: env.JSON_BODY_LIMIT }));

  // Compression
  app.use(compression());

  // Logging / request tracing
  app.use(requestId);
  app.use(httpLogger);

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  // Root route
  app.get('/', (_req: Request, res: Response): void => {
    res.json({
      message: 'Server is running',
    });
  });

  // Liveness check
  app.get('/health', (_req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    });
  });

  // Readiness check
  app.get('/health/ready', async (_req: Request, res: Response): Promise<void> => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      res.json({
        status: 'ready',
        db: 'ok',
      });
    } catch (err) {
      logger.warn({ err }, 'readiness check failed');

      res.status(503).json({
        status: 'not_ready',
        db: 'failed',
      });
    }
  });

  // API routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', usersRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};