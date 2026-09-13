import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  mysql: {
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: required('MYSQL_DATABASE'),
  },
  jwtSecret: required('JWT_SECRET'),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  cookieSecure: (process.env.COOKIE_SECURE ?? 'false') === 'true',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  frontendUrl: process.env.APP_URL ?? 'http://localhost:3000',
  mpAccessToken: process.env.MP_ACCESS_TOKEN ?? '',
  mpWebhookSecret: process.env.MP_WEBHOOK_SECRET ?? '',
  internalJobSecret: process.env.INTERNAL_JOB_SECRET ?? '',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  resendFrom: process.env.RESEND_FROM ?? 'Exiba <onboarding@resend.dev>',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
};

