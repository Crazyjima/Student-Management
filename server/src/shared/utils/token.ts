import { createHash, randomBytes } from 'node:crypto';

const REFRESH_TOKEN_BYTES = 48;

export const generateRefreshToken = (): string => {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
};

export const hashToken = (raw: string): string => {
  return createHash('sha256').update(raw).digest('hex');
};
