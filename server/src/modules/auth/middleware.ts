import type { RequestHandler } from 'express';
import type { RoleName } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/app-error.js';
import { verifyAccessToken } from '../../shared/utils/jwt.js';

const BEARER = 'Bearer ';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const auth = req.header('authorization');
  if (auth === undefined || !auth.startsWith(BEARER)) {
    next(new UnauthorizedError('Missing or malformed Authorization header'));
    return;
  }

  const token = auth.slice(BEARER.length).trim();
  if (token.length === 0) {
    next(new UnauthorizedError('Empty bearer token'));
    return;
  }

  try {
    const claims = verifyAccessToken(token);
    req.user = {
      id: claims.sub,
      email: claims.email,
      roles: claims.roles,
    };
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRoles = (...allowed: readonly RoleName[]): RequestHandler => {
  if (allowed.length === 0) {
    throw new Error('requireRoles: at least one role must be supplied');
  }
  return (req, _res, next) => {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }
    const matched = req.user.roles.some((r) => allowed.includes(r));
    if (!matched) {
      next(new ForbiddenError(`Requires role: ${allowed.join(' or ')}`));
      return;
    }
    next();
  };
};
