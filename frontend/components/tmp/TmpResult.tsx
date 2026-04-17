"use client";

import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Share2,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { QRCode } from "@/components/shortlink/QRCode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TmpFile } from "@/lib/modules/tmp/tmp.types";
import { cn } from "@/lib/utils";

interface UseClipboardReturn {
  copied: boolean;
  copy: () => void;
}

const useClipboard = (
  text: string,
  timeout: number = 1800,
): UseClipboardReturn => {
  const [copied, setCopied] = useState<boolean>(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    });
  };
  return { copied, copy };
};

const useDebounce = <T,>(value: T, delay: number): T => {
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
};

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
    className="flex flex-col items-center gap-1.5 group"
    title={label}
  >
    <div
      className={`
        w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200
        ${
          active
            ? "bg-primary text-primary-foreground border-primary scale-95"
            : `bg-muted/50 text-muted-foreground border-border hover:bg-muted 
            hover:text-foreground hover:border-foreground/20 hover:scale-105`
        }
      `}
    >
      {active && SuccessIcon ? <SuccessIcon size={16} /> : <Icon size={16} />}
    </div>
    <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
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
    if (navigator.share) {
      navigator.share({ url: result.url });
    } else {
      copy();
    }
  };

  const expiryDate = new Date(result.expiry).toLocaleString();

  return (
    <div
      {...props}
      className={cn(
        "w-full rounded-2xl border border-border bg-background p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:gap-6 md:items-start">
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
              File Name
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/10 px-4 py-2 border-dashed">
              <FileText size={12} className="text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
                {result.name}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
              Temporary Link
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="text-sm font-mono text-foreground flex-1 truncate select-all">
                {result.url}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 bg-muted/20 px-3 rounded-lg border border-border w-fit">
            <Clock size={12} className="text-primary" />
            <span>Expires on: {expiryDate}</span>
          </div>

          <div className="flex items-center gap-5 mt-2">
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

        <div className="hidden md:block w-px self-stretch bg-border" />
        <div className="block md:hidden h-px w-full bg-border" />

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
