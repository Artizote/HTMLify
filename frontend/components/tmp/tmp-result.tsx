"use client";

import { Check, Clock, Copy, ExternalLink, Share2 } from "lucide-react";
import { useState } from "react";

import { FileIcon } from "@/components/dashboard/file-icon";
import { QRCode } from "@/components/qr-code";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TmpFile } from "@/lib/modules/tmp/tmp.types";
import { cn } from "@/lib/utils";
import { shareContent, useClipboard, useDebounce } from "@/lib/utils/actions";

import { Separator } from "../ui/separator";

interface ActionButtonProps {
  icon: React.ElementType;
  successIcon?: React.ElementType;
  label: string;
  onClick: () => void;
  active: boolean;
}

const ActionButton = ({
  icon: Icon,
  successIcon: SuccessIcon,
  label,
  onClick,
  active,
}: ActionButtonProps) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm transition-all duration-200 hover:bg-muted hover:text-foreground hover:border-foreground/20 group"
    title={label}
  >
    {active && SuccessIcon ? (
      <SuccessIcon size={14} className="text-primary" />
    ) : (
      <Icon
        size={14}
        className="text-muted-foreground group-hover:text-foreground transition-colors"
      />
    )}
    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
      {active ? "Copied!" : label}
    </span>
  </button>
);

interface TmpResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: TmpFile;
}

export const TmpResult = ({ result, className, ...props }: TmpResultProps) => {
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const debouncedFgColor = useDebounce(fgColor, 500);
  const debouncedBgColor = useDebounce(bgColor, 500);

  const { copied, copy } = useClipboard(result.url);

  const handleShare = () => {
    shareContent({ url: result.url, fallbackCopy: true });
  };

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
              <span className="text-sm text-muted-foreground truncate flex-1 font-mono">
                {result.name}
              </span>
            </div>
          </div>

          <Separator className="py-0 my-0" />

          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-foreground/70 mb-2">
              Temporary Link
            </p>
            <div className="flex items-center gap-2.5 rounded-lg ">
              <span className="text-sm font-mono text-muted-foreground flex-1 truncate select-all">
                {result.url}
              </span>
            </div>
          </div>

          <Separator className="py-0 my-0" />

          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-foreground/70 mb-2">
              Expires On
            </p>
            <div className="flex items-center gap-2.5 rounded-lg">
              <Clock size={14} className="text-primary" />
              <span className="text-sm text-muted-foreground font-mono">
                {expiryDate}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ActionButton
              icon={Copy}
              successIcon={Check}
              label="Copy"
              onClick={copy}
              active={copied}
            />
            <ActionButton
              successIcon={Check}
              icon={Share2}
              label="Share"
              onClick={handleShare}
              active={false}
            />
            <ActionButton
              successIcon={Check}
              icon={ExternalLink}
              label="Open"
              onClick={() => window.open(result.url, "_blank")}
              active={false}
            />
          </div>
        </div>

        <div className="hidden lg:block w-px self-stretch bg-border" />
        <div className="block lg:hidden h-px w-full bg-border" />

        <QRCode
          url={result.url}
          fgColor={debouncedFgColor}
          bgColor={debouncedBgColor}
        />
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
          Customize QR Code
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fg-color" className="text-xs text-muted-foreground">
              Foreground Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="fg-color"
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-10 h-10 p-1 cursor-pointer shrink-0"
              />
              <Input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="font-mono text-xs"
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bg-color" className="text-xs text-muted-foreground">
              Background Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 p-1 cursor-pointer shrink-0"
              />
              <Input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="font-mono text-xs"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
