import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

// Validates VITE_-prefixed env vars at module load. Anything reading from
// `env` here is guaranteed by Zod to be of the right shape - no runtime guards
// needed downstream. Validation failures throw immediately and crash the app
// at boot, which is the right behaviour for misconfiguration.
export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_API_BASE_URL: z.string().min(1).default('/api/v1'),
    VITE_NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
