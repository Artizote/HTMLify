export const QUERY_KEYS = {
  files: {
    all: ["files"] as const,
    content: (path: string) =>
      [...QUERY_KEYS.files.all, "content", path] as const,
    id: (path: string) => [...QUERY_KEYS.files.all, "id", path] as const,
  },
  auth: {
    me: ["auth", "me"] as const,
  },
} as const;
