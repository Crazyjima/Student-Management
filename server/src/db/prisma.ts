/* eslint-disable @typescript-eslint/dot-notation */
import { PrismaClient } from '@prisma/client';

// Hot-reload-safe singleton: in dev, `tsx watch` re-imports modules on save.
// Without this guard, every reload spawns a new PrismaClient and exhausts the
// connection pool. In production we always create exactly one.
const globalForPrisma = globalThis as unknown as { prismaInstance?: PrismaClient };

const buildPrismaClient = (): PrismaClient => {
  const isProd = process.env['NODE_ENV'] === 'production';
  return new PrismaClient({
    log: isProd ? ['warn', 'error'] : ['warn', 'error'],
    errorFormat: isProd ? 'minimal' : 'pretty',
  });
};

export const prisma: PrismaClient = globalForPrisma.prismaInstance ?? buildPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prismaInstance = prisma;
}

export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};

export type { PrismaClient } from '@prisma/client';
