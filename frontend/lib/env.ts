import { z } from "zod";

const serverSchema = z.object({});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_NAME: z.string().min(1, "NEXT_PUBLIC_SITE_NAME is required"),
  NEXT_PUBLIC_BACKEND_API_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_BACKEND_API_URL is required"),
  NEXT_PUBLIC_SUBDOMAIN: z.string().min(1, "NEXT_PUBLIC_SUBDOMAIN is required"),
});

function parseSchema<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (i) => `  ❌ ${i.path.join(".")}: ${i.message}`,
    );
    console.error("\nInvalid environment variables:\n");
    console.error(issues.join("\n"));
    throw new Error("Invalid environment variables.");
  }
  return parsed.data as z.infer<T>;
}

export const serverEnv =
  typeof window === "undefined"
    ? parseSchema(serverSchema, process.env)
    : ({} as z.infer<typeof serverSchema>);

export const clientEnv = parseSchema(clientSchema, {
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  NEXT_PUBLIC_SUBDOMAIN: process.env.NEXT_PUBLIC_SUBDOMAIN,
});
