import z from "zod";

type FileIDResponse = {
    id: number;
    user: string;
    title: string;
    path: string;
    views: number;
    blob_hash: string;
    mode: string;
    visibility: "public" | "private" | string;
    password: string | null;
    as_guest: boolean;
    modified: string;
    content: string | null;
};

export type { FileIDResponse };

// type File = Omit<FileApiResponse, "as_guest"> & { asGuest: boolean;
// };

export const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export const signUpSchema = loginSchema.extend({
    email: z.string().min(1, "Email is required").email("Email is invalid"),
})
type LoginSchema = z.infer<typeof loginSchema>;
type SignUpSchema = z.infer<typeof signUpSchema>;
type AuthPayload = | { mode: 'signin'; credentials: LoginSchema }
    | { mode: 'signup'; credentials: SignUpSchema };

export type { LoginSchema, SignUpSchema, AuthPayload };

export interface UserFullInfo {
    id: number;
    name: string;
    bio: string;
    username: string;
    email: string;
    active: boolean;
    verified: boolean;
    role: string;
}
