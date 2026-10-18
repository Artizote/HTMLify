"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTmpFolderStore } from "@/lib/hooks/use-tmp-folder";

function AddFolderForm() {
  const { createFolder, focusName } = useTmpFolderStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (focusName && inputRef.current) {
      inputRef.current.focus();
      useTmpFolderStore.setState({ focusName: false });
    }
  }, [focusName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const folderName = name.trim();
    if (!folderName) {
      setError("Folder name is required");
      return;
    }

    setIsPending(true);
    setError("");

    const result = await createFolder(folderName);
    setIsPending(false);

    if (!result.success) {
      setError(result.error ?? "Failed to create folder");
      return;
    }

    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-2">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Folder name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 w-fit rounded-md">
          {error}
        </p>
      )}
    </form>
  );
}

export { AddFolderForm };