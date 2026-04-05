import z from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = loginSchema.extend({
  email: z.string().min(1, "Email is required").email("Email is invalid"),
});
type LoginSchema = z.infer<typeof loginSchema>;
type SignUpSchema = z.infer<typeof signUpSchema>;
type AuthPayload =
  | { mode: "signin"; credentials: LoginSchema }
  | { mode: "signup"; credentials: SignUpSchema };

export type { AuthPayload,LoginSchema, SignUpSchema };
