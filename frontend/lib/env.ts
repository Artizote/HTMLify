import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    REFRESH_TOKEN_EXPIRE_DAYS: z.coerce.number().min(1).default(30),
    ACCESS_TOKEN_EXPIRE_MINUTES: z.coerce.number().min(1).default(15),
    PROXY_MAX_BODY_SIZE_MB: z.coerce.number().min(1).default(32),
    INTERNAL_API_CODE: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_SITE_NAME: z.string().min(1),
    NEXT_PUBLIC_BACKEND_API_URL: z.string().url(),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_SUBDOMAIN: z.string().min(1),
    NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB: z.coerce.number().min(1).default(10),
    NEXT_PUBLIC_PAGE_SIZE: z.coerce.number().min(1).default(10),
  },
  runtimeEnv: {
    REFRESH_TOKEN_EXPIRE_DAYS: process.env.REFRESH_TOKEN_EXPIRE_DAYS,
    ACCESS_TOKEN_EXPIRE_MINUTES: process.env.ACCESS_TOKEN_EXPIRE_MINUTES,
    PROXY_MAX_BODY_SIZE_MB: process.env.PROXY_MAX_BODY_SIZE_MB,
    INTERNAL_API_CODE: process.env.INTERNAL_API_CODE,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUBDOMAIN: process.env.NEXT_PUBLIC_SUBDOMAIN,
    NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB: process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB,
    NEXT_PUBLIC_PAGE_SIZE: process.env.NEXT_PUBLIC_PAGE_SIZE,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
