"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteFile } from "@/lib/modules/file/file.api";

interface AlertDialogProps {
  id: number;
  path: string;
}

export function DeleteAlertDialog({ id, path }: AlertDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    try {
      await deleteFile(id);
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to delete file");
    }
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start pl-2 ">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete file</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete this file?
            <br />
            <p className="bg-muted-foreground/5 p-2 mt-2 rounded-lg">{path}</p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
