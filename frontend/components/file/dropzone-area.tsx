"use client";

import { Upload } from "lucide-react";
import { type Accept, type FileRejection, useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

interface DropzoneAreaProps {
  onDrop: (files: File[]) => void;
  accept?: Accept;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
}

export function DropzoneArea({
  onDrop,
  accept,
  maxSize,
  maxFiles,
  className,
}: DropzoneAreaProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted: File[], _rejected: FileRejection[]) => {
      onDrop(accepted);
    },
    accept,
    maxSize,
    maxFiles,
    multiple: maxFiles !== undefined && maxFiles > 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30",
        className,
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 text-center">
        <Upload className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? "Drop files here"
            : "Drag & drop files here, or click to select"}
        </p>
      </div>
    </div>
  );
}
