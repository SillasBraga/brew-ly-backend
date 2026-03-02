import { Config } from 'drizzle-kit';

export default {
  dialect: 'postgresql',
  schema: './src/db/schemas/*',
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
} satisfies Config;
