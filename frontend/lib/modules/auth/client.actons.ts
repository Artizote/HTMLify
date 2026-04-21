import { APICall } from "@/lib/fetch/api";
import { LoginSchema, SignUpSchema } from "@/lib/modules/auth/auth.schema";
import { extractErrorMessage, zodToFormData } from "@/lib/utils";

export const signIn = async (data: LoginSchema) => {
  const formData = zodToFormData(data);
  formData.append("grant_type", "password");

  const response = await APICall(`/api/auth/token`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
};

export const signUp = async (data: SignUpSchema) => {
  const response = await APICall(`/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
};

export const signOut = async () => {
  const response = await APICall(`/api/auth/signout`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }
};
