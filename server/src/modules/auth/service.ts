import bcrypt from 'bcryptjs';
import { RoleName } from '@prisma/client';
import { env } from '../../config/env.js';
import {
  ConflictError,
  UnauthorizedError,
} from '../../shared/errors/app-error.js';
import { logger } from '../../shared/utils/logger.js';
import { hashPassword, verifyPassword } from '../../shared/utils/password.js';
import { generateRefreshToken, hashToken } from '../../shared/utils/token.js';
import { signAccessToken } from '../../shared/utils/jwt.js';
import { parseDurationMs } from '../../shared/utils/duration.js';
import { authRepository } from './repository.js';
import type { LoginBody, RegisterBody } from './dtos/auth.dto.js';
import type {
  PublicUser,
  RequestContext,
  TokenPair,
  UserWithRoles,
} from './types/index.js';

const TIMING_DUMMY_HASH = bcrypt.hashSync('timing_equalization_only', env.BCRYPT_ROUNDS);

const toPublicUser = (u: UserWithRoles): PublicUser => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  roles: u.userRoles.map((ur) => ur.role.name),
});

const issueTokens = async (
  user: UserWithRoles,
  context: RequestContext,
): Promise<TokenPair> => {
  const roles = user.userRoles.map((ur) => ur.role.name);

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    roles,
  });

  const refreshTokenRaw = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshTokenRaw);
  const refreshTtlMs = parseDurationMs(env.JWT_REFRESH_TTL);
  const accessTtlMs = parseDurationMs(env.JWT_ACCESS_TTL);

  const stored = await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + refreshTtlMs),
    userAgent: context.userAgent ?? null,
    ipAddress: context.ip ?? null,
  });

  return {
    accessToken,
    refreshToken: refreshTokenRaw,
    refreshTokenId: stored.id,
    tokenType: 'Bearer',
    expiresIn: Math.floor(accessTtlMs / 1000),
    user: toPublicUser(user),
  };
};

export const authService = {
  register: async (input: RegisterBody, context: RequestContext): Promise<TokenPair> => {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing !== null) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUserWithRole(
      {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone ?? null,
      },
      RoleName.STUDENT,
    );

    logger.info({ userId: user.id, email: user.email }, 'user registered');
    return issueTokens(user, context);
  },

  login: async (input: LoginBody, context: RequestContext): Promise<TokenPair> => {
    const user = await authRepository.findUserByEmail(input.email);

    const fail = (): never => {
      throw new UnauthorizedError('Invalid credentials');
    };

    if (user === null || user.deletedAt !== null || !user.isActive) {
      if (user === null) {
        await verifyPassword(input.password, TIMING_DUMMY_HASH);
      }
      fail();
    }

    const activeUser = user as UserWithRoles;
    const valid = await verifyPassword(input.password, activeUser.passwordHash);
    if (!valid) {
      fail();
    }

    await authRepository.updateLastLogin(activeUser.id);
    logger.info({ userId: activeUser.id }, 'user login');
    return issueTokens(activeUser, context);
  },

  refresh: async (rawToken: string, context: RequestContext): Promise<TokenPair> => {
    const tokenHash = hashToken(rawToken);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);

    if (stored === null) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    if (stored.revokedAt !== null) {
      const revokedCount = await authRepository.revokeAllUserRefreshTokens(stored.userId);
      logger.warn(
        { userId: stored.userId, revokedCount },
        'refresh-token reuse detected — all sessions revoked',
      );
      throw new UnauthorizedError('Refresh token reused — session revoked');
    }

    const user = await authRepository.findUserById(stored.userId);
    if (user === null || user.deletedAt !== null || !user.isActive) {
      throw new UnauthorizedError('User unavailable');
    }

    const pair = await issueTokens(user, context);
    await authRepository.revokeRefreshToken(stored.id, pair.refreshTokenId);
    return pair;
  },

  logout: async (rawToken: string): Promise<void> => {
    const tokenHash = hashToken(rawToken);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);
    if (stored !== null && stored.revokedAt === null) {
      await authRepository.revokeRefreshToken(stored.id);
    }
  },

  getUserPublic: async (userId: string): Promise<PublicUser | null> => {
    const user = await authRepository.findUserById(userId);
    if (user === null || user.deletedAt !== null) {
      return null;
    }
    return toPublicUser(user);
  },
};
