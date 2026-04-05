import { LoginSchema, SignUpSchema } from "@/lib/modules/auth/auth.schema";
import { extractErrorMessage, zodToFormData } from "@/lib/utils";

export const signIn = async (data: LoginSchema) => {
  const formData = zodToFormData(data);
  formData.append("grant_type", "password");

  let response: Response;

  try {
    response = await fetch(`/api/auth/token`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
  } catch (error) {
    throw new Error(await extractErrorMessage(error));
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
};
export const signUp = async (data: SignUpSchema) => {
  let response: Response;

  try {
    response = await fetch(`/api/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw new Error(await extractErrorMessage(error));
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
};

export const signOut = async () => {
  try {
    await fetch(`/api/auth/signout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    throw new Error(await extractErrorMessage(error));
  }
};
