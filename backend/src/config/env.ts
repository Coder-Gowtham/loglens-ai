import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  CORS_ORIGINS: z
    .string()
    .default(
      "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173,https://loglens-ai-frontend-production.up.railway.app"
    ),
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  openaiApiKey: parsed.data.OPENAI_API_KEY,
  corsOrigins: parsed.data.CORS_ORIGINS
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  redisUrl: parsed.data.REDIS_URL,
  redisHost: parsed.data.REDIS_HOST,
  redisPort: parsed.data.REDIS_PORT,
};
