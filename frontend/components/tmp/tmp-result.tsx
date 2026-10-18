"use client";

import { Clock } from "lucide-react";

import { FileIcon } from "@/components/dashboard/file-icon";
import { QRCode } from "@/components/qr-code";
import { CopyableUrl } from "@/components/ui/copyable-url";
import { TmpFile } from "@/lib/modules/tmp/tmp.types";
import { cn } from "@/lib/utils";

import { Separator } from "../ui/separator";

interface TmpResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: TmpFile;
}

export const TmpResult = ({ result, className, ...props }: TmpResultProps) => {
  const expiryDate = new Date(result.expiry).toLocaleString();

  return (
    <div
      {...props}
      className={cn(
        "w-full rounded-xl border border-border/20 bg-card p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 lg:items-start">
        <div className="flex-1 flex flex-col gap-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-foreground/70 mb-2">
              File Name
            </p>
            <div className="flex items-center gap-2.5 rounded-lg">
              <FileIcon path={result.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm text-muted-foreground">
                  {result.name}
                </p>
                <p className="truncate select-all font-mono text-[11px] text-muted-foreground">
                  {result.id}
                </p>
              </div>
            </div>
          </div>

          <Separator className="py-0 my-0" />

          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-foreground/70 mb-2">
              Shareable URL
            </p>
            <CopyableUrl url={result.url} showShare showOpen />
          </div>

          <Separator className="py-0 my-0" />

          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-foreground/70 mb-2">
              Expires On
            </p>
            <div className="flex items-center gap-2.5 rounded-lg">
              <Clock size={14} className="text-primary" />
              <span className="font-mono text-sm text-muted-foreground">
                {expiryDate}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px self-stretch bg-border" />
        <div className="block lg:hidden h-px w-full bg-border" />

        <QRCode url={result.url} fgColor="#000000" bgColor="#ffffff" />
      </div>
    </div>
  );
};