import { APICall } from "@/lib/fetch/api";
import { LoginSchema, SignUpSchema } from "@/lib/modules/auth/auth.schema";
import { zodToFormData } from "@/lib/utils";

export const signIn = async (data: LoginSchema) => {
  const formData = zodToFormData(data);
  formData.append("grant_type", "password");

  return await APICall(`/api/auth/token`, {
    method: "POST",
    body: formData,
  });
};

export const signUp = async (data: SignUpSchema) => {
  return await APICall(`/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const signOut = async () => {
  return await APICall(`/api/auth/logout`, {
    method: "POST",
  });
};
