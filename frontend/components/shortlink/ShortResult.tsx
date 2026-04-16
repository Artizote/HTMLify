import { Check, Copy, Download, ExternalLink, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/lib/env";
import { ShortLink } from "@/lib/modules/shortlink/shortlink.types";
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

interface LinkResultProps {
  url: string;
  sourceUrl: string;
}

const LinkResult = ({ url, sourceUrl }: LinkResultProps) => {
  const { copied, copy } = useClipboard(url);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ url });
    } else {
      copy();
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
          Original link
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/10 px-4 py-2 border-dashed">
          <ExternalLink size={12} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
            {sourceUrl}
          </span>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
          Short link
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-sm font-mono text-foreground flex-1 truncate select-all">
            {url}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
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
          onClick={() => window.open(url, "_blank")}
          active={false}
        />
      </div>
    </div>
  );
};

interface QRCodeProps {
  url: string;
  fgColor: string;
  bgColor: string;
}

const QRCode = ({ url, fgColor, bgColor }: QRCodeProps) => {
  const params = new URLSearchParams({
    data: url,
    fg: fgColor,
    bg: bgColor,
  });

  const qrSrc = `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/qr-code?${params.toString()}`;

  const handleDownload = (): void => {
    const link = document.createElement("a");
    link.href = qrSrc;
    link.download = "qr-code.png";
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground self-start md:self-center">
        QR Code
      </p>
      <div className="relative rounded-2xl border border-border shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w-36 h-36 block" src={qrSrc} alt="QR Code" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 pointer-events-none" />
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Download size={12} />
        Download
      </button>
    </div>
  );
};

interface ShortResultProps extends React.HTMLAttributes<HTMLDivElement> {
  shortLink: ShortLink;
}

export const ShortResult = ({
  shortLink,
  className,
  ...props
}: ShortResultProps) => {
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const debouncedFgColor = useDebounce(fgColor, 500);
  const debouncedBgColor = useDebounce(bgColor, 500);

  return (
    <div
      {...props}
      className={cn(
        "w-full rounded-2xl border border-border bg-background p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:gap-6 md:items-start">
        <LinkResult url={shortLink.url} sourceUrl={shortLink.href} />
        <div className="hidden md:block w-px self-stretch bg-border" />
        <div className="block md:hidden h-px w-full bg-border" />
        <QRCode
          url={shortLink.url}
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
