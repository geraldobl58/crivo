import z from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8000/api"),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
