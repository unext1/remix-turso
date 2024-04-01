import "dotenv/config";
import z from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  SITE_URL: z.string().min(1).trim(),
  CSRF_SECRET: z.string().min(1).trim(),
  SESSION_SECRET: z.string().min(1).trim(),
  // DB
  LIBSQL_ADMIN_URL: z.string().min(1).trim(),
  LIBSQL_URL: z.string().min(1).trim(),
  // GOOGLE AUTH
  GOOGLE_CLIENT_ID: z.string().min(1).trim(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).trim(),
});

export const env = environmentSchema.parse(process.env);
