"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export async function copyToClipboard(
  text: string,
  options?: { successMessage?: string; errorMessage?: string },
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    if (options?.successMessage) {
      toast.success(options.successMessage);
    }
    return true;
  } catch {
    if (options?.errorMessage) {
      toast.error(options.errorMessage);
    }
    return false;
  }
}

export function downloadFile(url: string, filename?: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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
