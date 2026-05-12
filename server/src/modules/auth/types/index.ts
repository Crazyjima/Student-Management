import type { RoleName, User, UserRole, Role } from '@prisma/client';

export type UserWithRoles = User & {
  userRoles: (UserRole & { role: Role })[];
};

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleName[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: PublicUser;
}

export interface RequestContext {
  userAgent?: string;
  ip?: string;
}
