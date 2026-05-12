import type { RoleName } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        id: string;
        email: string;
        roles: RoleName[];
      };
    }
  }
}

export {};
