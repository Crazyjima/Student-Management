import type { Server } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './shared/utils/logger.js';
import { disconnectPrisma } from './db/prisma.js';
 
const SHUTDOWN_TIMEOUT_MS = 10_000;
 
const start = (): Server => {
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'server started');
  });
  return server;
};
 
const shutdown = async (server: Server, signal: string): Promise<void> => {
  logger.info({ signal }, 'shutdown initiated');
 
  // Stop accepting new connections; let in-flight requests finish.
  const closeServer = new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
 
  // Hard cap on graceful shutdown — kills hung connections after the deadline.
  const timeout = new Promise<never>((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`shutdown timed out after ${SHUTDOWN_TIMEOUT_MS}ms`));
    }, SHUTDOWN_TIMEOUT_MS).unref();
  });
 
  try {
    await Promise.race([closeServer, timeout]);
    await disconnectPrisma();
    logger.info('shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'shutdown error');
    process.exit(1);
  }
};
 
const main = (): void => {
  const server = start();
 
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
      void shutdown(server, signal);
    });
  }
 
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaughtException');
    process.exit(1);
  });
 
  process.on('unhandledRejection', (reason) => {
    logger.fatal({ err: reason }, 'unhandledRejection');
    process.exit(1);
  });
};
 
main();