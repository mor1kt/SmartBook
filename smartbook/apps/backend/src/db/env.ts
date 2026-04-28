import { z } from 'zod';
import dotenv from 'dotenv';

// Load apps/backend/.env when running locally (tsx/dev). In production, env vars should be injected by the runtime.
dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  FRONTEND_ORIGINS: z.string().default('http://localhost:5173'),
  // Optional in development scaffold; required in production.
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof schema>;

export const env: Env = schema.parse(process.env);

if (env.NODE_ENV === 'production') {
  const missing: string[] = [];
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length) {
    throw new Error(`Missing required env var(s) in production: ${missing.join(', ')}`);
  }
}
