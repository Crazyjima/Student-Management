import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';
 
loadDotenv();
 
const csvOrigins = z
  .string()
  .default('http://localhost:5173')
  .transform((s) =>
    s
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0),
  );
 
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().max(65_535).default(3000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
 
    DATABASE_URL: z.string().url(),
 
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be ≥32 chars'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be ≥32 chars'),
    JWT_ACCESS_TTL: z
      .string()
      .regex(/^\d+(ms|s|m|h|d)$/, 'JWT_ACCESS_TTL must match e.g. "15m", "1h", "500ms"')
      .default('15m'),
    JWT_REFRESH_TTL: z
      .string()
      .regex(/^\d+(ms|s|m|h|d)$/, 'JWT_REFRESH_TTL must match e.g. "7d", "168h"')
      .default('7d'),
    BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
 
    CORS_ORIGINS: csvOrigins,
 
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    JSON_BODY_LIMIT: z.string().default('100kb'),
  })
  .refine((e) => e.JWT_ACCESS_SECRET !== e.JWT_REFRESH_SECRET, {
    message: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ',
    path: ['JWT_REFRESH_SECRET'],
  });
 
export type Env = z.infer<typeof envSchema>;
 
const parsed = envSchema.safeParse(process.env);
 
if (!parsed.success) {
  // Logger isn't available yet — env validation runs first. Plain stderr is the
  // best we can do here, and fail-fast on misconfig is the whole point.
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    // eslint-disable-next-line no-console
    console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}
 
export const env: Env = parsed.data;