import { z } from "zod";

const serverSchema = z.object({
  REFRESH_TOKEN_EXPIRE_DAYS: z.coerce
    .number({
      invalid_type_error: "REFRESH_TOKEN_EXPIRE_DAYS must be a number",
    })
    .min(1, "REFRESH_TOKEN_EXPIRE_DAYS must be at least 1"),
  ACCESS_TOKEN_EXPIRE_MINUTES: z.coerce
    .number({
      invalid_type_error: "ACCESS_TOKEN_EXPIRE_MINUTES must be a number",
    })
    .min(1, "ACCESS_TOKEN_EXPIRE_MINUTES must be at least 1"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_NAME: z.string().min(1, "NEXT_PUBLIC_SITE_NAME is required"),
  NEXT_PUBLIC_BACKEND_API_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_BACKEND_API_URL is required"),
  NEXT_PUBLIC_SITE_URL: z.string().min(1, "NEXT_PUBLIC_SITE_URL is required"),
  NEXT_PUBLIC_SUBDOMAIN: z.string().min(1, "NEXT_PUBLIC_SUBDOMAIN is required"),
});

function parseSchema<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => {
      const key = i.path.length > 0 ? i.path.join(".") : "(unknown key)";
      return `  ❌ ${key}: ${i.message}`;
    });

    console.error("\nInvalid environment variables:\n");
    console.error(issues.join("\n"));
    console.error("\n");
    throw new Error("Invalid environment variables. See above for details.");
  }
  return parsed.data as z.infer<T>;
}

export const serverEnv =
  typeof window === "undefined"
    ? parseSchema(serverSchema, {
        REFRESH_TOKEN_EXPIRE_DAYS: process.env.REFRESH_TOKEN_EXPIRE_DAYS,
        ACCESS_TOKEN_EXPIRE_MINUTES: process.env.ACCESS_TOKEN_EXPIRE_MINUTES,
      })
    : ({} as z.infer<typeof serverSchema>);

export const clientEnv = parseSchema(clientSchema, {
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUBDOMAIN: process.env.NEXT_PUBLIC_SUBDOMAIN,
});
