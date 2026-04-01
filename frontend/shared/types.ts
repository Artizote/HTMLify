import z from "zod";

type FileIDResponse = {
  id: number;
  user: string;
  title: string;
  path: string;
  views: number;
  blob_hash: string;
  mode: "source" | "render";
  visibility: "public" | "private" | string;
  password: string | null;
  locked: boolean;
  as_guest: boolean;
  modified: string;
  content: string | null;
};

type FileItem = {
  id: number;
  user: string;
  title: string;
  path: string;
  views: number;
  blob_hash: string | null;
  mode: "render" | "source";
  visibility: "public" | "private" | string;
  password: string | null;
  locked: boolean;
  as_guest: boolean;
  modified: string;
  content: string | null;
};

type FolderItem = {
  name: string;
  path: string;
  items: (FileItem | FolderItem)[];
};

type FolderResponse = {
  name: string;
  path: string;
  items: (FileItem | FolderItem)[];
};

function isFolderItem(item: FileItem | FolderItem): item is FolderItem {
  return "name" in item;
}

export type { FileIDResponse, FileItem, FolderItem, FolderResponse };
export { isFolderItem };

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
