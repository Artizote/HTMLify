"use client";

import { useState } from "react";

import { FileDropzone } from "@/components/file/file-dropzone";
import { TmpResult } from "@/components/tmp/tmp-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTmpFile } from "@/lib/modules/tmp/tmp.quries";
import { TmpFile } from "@/lib/modules/tmp/tmp.types";

const EXPIRY_OPTIONS = [
  { label: "1 Minute", value: "60" },
  { label: "5 Minutes", value: "300" },
  { label: "10 Minutes", value: "600" },
  { label: "1 Hour", value: "3600" },
  { label: "1 Day", value: "86400" },
  { label: "1 Week", value: "604800" },
  { label: "Custom...", value: "custom" },
];

export const TmpForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("3600"); // 1 hour default
  const [customExpiry, setCustomExpiry] = useState("60");
  const [customUnit, setCustomUnit] = useState("1"); // multiplier
  const [error, setError] = useState("");
  const [result, setResult] = useState<TmpFile | null>(null);

  const { mutate, isPending } = useTmpFile();

  const isCustom = expiry === "custom";

  const handleSubmit = () => {
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

    mutate(
      {
        file,
        name: name || undefined,
        expiry: finalExpiry,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          setFile(null);
          setName("");
          setError("");
        },
        onError: (err) => {
          setError(err.message);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2 block">
            Select File
          </Label>
          <FileDropzone
            value={file}
            onChange={(val) => setFile(val as File)}
            maxFiles={1}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tmp-name" className="text-xs text-muted-foreground">
              Custom Name (Optional)
            </Label>
            <Input
              id="tmp-name"
              placeholder="e.g. my-awesome-file"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="tmp-expiry"
                className="text-xs text-muted-foreground"
              >
                Expiry Time
              </Label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger id="tmp-expiry">
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isCustom && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Custom Duration
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
                <div className="w-1/3 space-y-2">
                  <Label className="text-xs text-muted-foreground">Unit</Label>
                  <Select value={customUnit} onValueChange={setCustomUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Seconds</SelectItem>
                      <SelectItem value="60">Minutes</SelectItem>
                      <SelectItem value="3600">Hours</SelectItem>
                      <SelectItem value="86400">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full md:w-auto"
          disabled={isPending || !file}
        >
          {isPending ? "Generating..." : "Generate Link"}
        </Button>
      </div>

      {error && (
        <p className="text-destructive text-sm bg-destructive/10 p-2 w-fit rounded-md">
          {error}
        </p>
      )}

      {result && <TmpResult result={result} className="mt-8" />}
    </div>
  );
};
