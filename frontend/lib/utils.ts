import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "@/lib/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pathToPublicUrl(path: string): string {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  if (!path) return base;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * URL-encode every segment of a file path
 */
export function encodeUrlPath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

export function formatDateTime(value: string | number | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * Generate a unique id.
 *
 * use crypto.randomUUID if available, else random bytes
 * safe to use in plain HTTP environment
 */
export function randomId(): string {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  if (typeof cryptoObj?.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }

  if (typeof cryptoObj?.getRandomValues === "function") {
    const bytes = cryptoObj.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  return `id-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
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
export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
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
