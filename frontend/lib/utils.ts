import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function zodToFormData<T extends object>(data: T) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) =>
          formData.append(key, v instanceof File ? v : String(v)),
        );
      } else {
        formData.append(key, value instanceof File ? value : String(value));
      }
    }
  }
  return formData;
}
async function extractErrorFromResponse(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    return text || `HTTP ${res.status} ${res.statusText}`;
  }

  const body = await res.json().catch(() => null);

  if (!body) {
    return `HTTP ${res.status} ${res.statusText}`;
  }

  const { detail } = body;

  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        const field = err.loc?.slice(1).join(".") ?? "";
        return field ? `${field}: ${err.msg}` : err.msg;
      })
      .join(", ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (detail && typeof detail === "object") {
    return (
      detail.message ?? detail.msg ?? detail.error ?? JSON.stringify(detail)
    );
  }

  return `HTTP ${res.status} ${res.statusText}`;
}

export async function extractErrorMessage(error: unknown): Promise<string> {
  if (error instanceof TypeError) {
    return "Network error :could not reach the server";
  }

  if (error instanceof Response) {
    return extractErrorFromResponse(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}
