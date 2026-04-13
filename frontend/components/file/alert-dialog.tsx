import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AlertDialogProps {
  onConfirm: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function NoExtentionAlertDialog({
  onConfirm,
  open,
  setOpen,
}: AlertDialogProps) {
  const handleContinue = () => {
    onConfirm();
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/90">
              <TriangleAlert className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>No file extension</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                You are saving a file without any extension. The file may not
                open correctly without one.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleContinue}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
