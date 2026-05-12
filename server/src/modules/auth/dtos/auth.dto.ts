import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .max(254, 'Email exceeds 254 characters')
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(8, 'Password must be ≥8 characters')
  .max(128, 'Password must be ≤128 characters');

export const registerBodySchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    phone: z.string().trim().max(32).optional(),
  })
  .strict();
export type RegisterBody = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(128),
  })
  .strict();
export type LoginBody = z.infer<typeof loginBodySchema>;

export const refreshBodySchema = z
  .object({
    refreshToken: z.string().min(1, 'refreshToken required').max(512),
  })
  .strict();
export type RefreshBody = z.infer<typeof refreshBodySchema>;

export const logoutBodySchema = refreshBodySchema;
export type LogoutBody = RefreshBody;
