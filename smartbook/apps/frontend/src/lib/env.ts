type Env = {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_API_BASE_URL: string;
};

function getEnv(name: keyof Env): string {
  console.log('Available env vars:', import.meta.env);
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env: Env = {
  VITE_SUPABASE_URL: getEnv('VITE_SUPABASE_URL'),
  VITE_SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY'),
  VITE_API_BASE_URL: getEnv('VITE_API_BASE_URL'),
};

