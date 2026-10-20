"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export async function copyToClipboard(
  text: string,
  options?: { successMessage?: string; errorMessage?: string },
): Promise<boolean> {
  let copied = false;

  try {
    // `navigator.clipboard` is not avilable on plain HTTP
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      copied = true;
    } else {
      copied = fallbackCopy(text);
    }
  } catch {
    copied = fallbackCopy(text);
  }

  if (copied) {
    if (options?.successMessage) {
      toast.success(options.successMessage);
    }
    return true;
  }

  if (options?.errorMessage) {
    toast.error(options.errorMessage);
  }
  return false;
}

/**
 * Copy text using the `document.execCommand("copy")` API.
 * Used as a fallback when the async Clipboard API is unavailable
 */
function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";

  const selection = document.getSelection();
  const previousRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);

  if (selection && previousRange) {
    selection.removeAllRanges();
    selection.addRange(previousRange);
  }

  return copied;
}

export function downloadFile(url: string, filename?: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadFiles(
  files: { url: string; filename?: string }[],
  delay = 300,
): void {
  files.forEach((file, i) => {
    window.setTimeout(() => downloadFile(file.url, file.filename), i * delay);
  });
}

export async function shareContent(options: {
  title?: string;
  text?: string;
  url: string;
  fallbackCopy?: boolean;
}): Promise<boolean> {
  const { title, text, url, fallbackCopy = true } = options;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      if (!fallbackCopy) {
        return false;
      }
    }
  }

  if (fallbackCopy) {
    return copyToClipboard(url, {
      successMessage: "URL copied to clipboard",
      errorMessage: "Failed to copy URL",
    });
  }

  return false;
}

export function useClipboard(text: string, timeout: number = 1800) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopied(false), timeout);
    }
  }, [text, timeout]);

  return { copied, copy };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
