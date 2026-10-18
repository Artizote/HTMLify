import z from "zod";

const fileFormSchema = z.object({
  content: z.string().optional(),
  file: z.instanceof(File).nullish(),
  title: z.string().optional(),
  path: z.string().min(1, "Path is required"),
  password: z.string().optional(),
  mode: z
    .enum(["source", "render"], { required_error: "Mode is required" })
    .default("source"),
  visibility: z.string().optional().default("public"),
});

type FileFormType = z.infer<typeof fileFormSchema>;

export { fileFormSchema, type FileFormType };

const gitCloneSchema = z.object({
  repo_url: z.string().url("Please enter a valid repository URL"),
  folder: z.string(), // Empty means sub path relative to the user's root
  mode: z.enum(["source", "render"]),
  visibility: z.enum(["public", "hidden", "once"]),
  overwrite: z.boolean(),
});

type GitCloneFormType = z.infer<typeof gitCloneSchema>;
export { type GitCloneFormType, gitCloneSchema };
