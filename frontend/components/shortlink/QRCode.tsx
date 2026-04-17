import { Download } from "lucide-react";

import { env } from "@/lib/env";

export interface QRCodeProps {
  url: string;
  fgColor: string;
  bgColor: string;
}

export const QRCode = ({ url, fgColor, bgColor }: QRCodeProps) => {
  const params = new URLSearchParams({
    data: url,
    fg: fgColor,
    bg: bgColor,
  });

  const qrSrc = `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/qr-code?${params.toString()}`;

  const handleDownload = (): void => {
    const link = document.createElement("a");
    link.href = qrSrc;
    link.setAttribute("download", "qrcode.png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground self-start md:self-center">
        QR Code
      </p>
      <div className="relative rounded-2xl border border-border shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w-36 h-36 block" src={qrSrc} alt="QR Code" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/5 pointer-events-none" />
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
