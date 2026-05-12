import type { RequestHandler } from 'express';
import { NotFoundError, UnauthorizedError } from '../../shared/errors/app-error.js';
import { authService } from './service.js';
import type {
  LoginBody,
  LogoutBody,
  RefreshBody,
  RegisterBody,
} from './dtos/auth.dto.js';
import type { RequestContext } from './types/index.js';

const buildContext = (req: Parameters<RequestHandler>[0]): RequestContext => {
  const ctx: RequestContext = {};
  const ua = req.header('user-agent');
  if (ua !== undefined) {
    ctx.userAgent = ua;
  }
  if (req.ip !== undefined) {
    ctx.ip = req.ip;
  }
  return ctx;
};

export const register: RequestHandler = async (req, res) => {
  const body = req.body as RegisterBody;
  const result = await authService.register(body, buildContext(req));
  res.status(201).json(result);
};

export const login: RequestHandler = async (req, res) => {
  const body = req.body as LoginBody;
  const result = await authService.login(body, buildContext(req));
  res.json(result);
};

export const refresh: RequestHandler = async (req, res) => {
  const body = req.body as RefreshBody;
  const result = await authService.refresh(body.refreshToken, buildContext(req));
  res.json(result);
};

export const logout: RequestHandler = async (req, res) => {
  const body = req.body as LogoutBody;
  await authService.logout(body.refreshToken);
  res.status(204).send();
};

export const me: RequestHandler = async (req, res) => {
  if (req.user === undefined) {
    throw new UnauthorizedError();
  }
  const user = await authService.getUserPublic(req.user.id);
  if (user === null) {
    throw new NotFoundError('User');
  }
  res.json(user);
};
