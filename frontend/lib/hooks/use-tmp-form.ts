"use client";

import { useCallback } from "react";

import { createTmpFile } from "@/lib/modules/tmp/tmp.api";
import { useTmpFormStore } from "@/lib/stores/tmp-form.store";

const EXPIRY_OPTIONS = [
  { label: "1 Minute", value: "60" },
  { label: "5 Minutes", value: "300" },
  { label: "10 Minutes", value: "600" },
  { label: "1 Hour", value: "3600" },
  { label: "1 Day", value: "86400" },
  { label: "1 Week", value: "604800" },
  { label: "Custom...", value: "custom" },
];

export const useTmpForm = () => {
  const {
    file,
    name,
    expiry,
    customExpiry,
    customUnit,
    error,
    result,
    isPending,
    setFile,
    setName,
    setExpiry,
    setCustomExpiry,
    setCustomUnit,
    setError,
    setResult,
    setIsPending,
    reset,
  } = useTmpFormStore();

  const isCustom = expiry === "custom";

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    let finalExpiry = parseInt(expiry, 10);
    if (isCustom) {
      const value = parseInt(customExpiry, 10);
      if (isNaN(value) || value <= 0) {
        setError("Please enter a valid expiry time");
        return;
      }
      finalExpiry = value * parseInt(customUnit, 10);
    }

    setIsPending(true);
    const { data, error: apiError } = await createTmpFile({
      file,
      name: name || undefined,
      expiry: finalExpiry,
    });
    if (apiError || !data) {
      setError(apiError || "Failed to upload temporary file");
      setIsPending(false);
      return;
    }
    setResult(data);
    setFile(null);
    setName("");
    setError("");
    setIsPending(false);
  }, [
    file,
    name,
    expiry,
    customExpiry,
    customUnit,
    isCustom,
    setFile,
    setName,
    setError,
    setResult,
    setIsPending,
  ]);

  return {
    // State
    file,
    name,
    expiry,
    customExpiry,
    customUnit,
    error,
    result,
    isPending,
    isCustom,
    expiryOptions: EXPIRY_OPTIONS,
    // Actions
    setFile,
    setName,
    setExpiry,
    setCustomExpiry,
    setCustomUnit,
    setError,
    handleSubmit,
    reset,
  };
};
