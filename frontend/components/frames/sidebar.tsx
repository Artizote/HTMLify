"use client";
import {
  ChevronDown,
  ChevronUp,
  Code,
  Copy,
  ExternalLink,
  Eye,
  Home,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FramesFeedResponse } from "@/lib/modules/frames/frames.types";
import { createShortLink } from "@/lib/modules/shortlink/shortlink.api";

interface FramesSidebarProps {
  children: React.ReactNode;
  handleSwitch: (next: boolean) => void;
  isFetching?: boolean;
  frmae: FramesFeedResponse;
  handleReload: () => void;
  codePreview: boolean;
  handleCodePreview: (path: string) => void;
}

const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  toast.success("Link copied to clipboard", {
    position: "top-right",
  });
};

export const FramesSidebar = ({
  children,
  frmae,
  handleSwitch,
  handleReload,
  handleCodePreview,
  isFetching,
  codePreview,
}: FramesSidebarProps) => {
  const handleRedirect = () => {
    window.open(frmae.url, "_blank");
  };
  const router = useRouter();

  const handleCopy = async () => {
    const short = await createShortLink(frmae.url);
    if (!short) {
      await copyToClipboard(frmae.url);
      return;
    }
    await copyToClipboard(short.url);
  };

  const navItems = [
    {
      icon: codePreview ? Eye : Code,
      onClick: () => handleCodePreview(frmae.path),
      title: "Code",
    },
    { icon: ExternalLink, onClick: handleRedirect, title: "Open in new tab" },
    {
      icon: ChevronUp,
      onClick: () => handleSwitch(false),
      title: "Back",
    },
    {
      icon: ChevronDown,
      onClick: () => handleSwitch(true),
      title: "Next",
    },
    { icon: Copy, onClick: handleCopy, title: "Copy" },
    { icon: RefreshCw, onClick: handleReload, title: "Reload" },
    { icon: Home, onClick: () => router.push("/"), title: "Home" },
  ];

  return (
    <div
      className="flex h-screen w-full flex-col 
    md:flex-row overflow-hidden bg-background"
    >
      <div className="flex-1 min-w-0 min-h-0 relative overflow-hidden">
        {children}
      </div>

      <div
        className="
        w-full h-16 border-t
        md:w-16 md:h-auto md:border-t-0 md:border-l
        flex flex-row md:flex-col
        justify-center items-center
        px-3 md:px-0 md:py-6
        gap-2
        border-border/50 bg-muted/10
        shrink-0
      "
      >
        <div
          className="
          flex flex-row md:flex-col
          items-center
          gap-1
          p-1.5
          rounded-2xl
          border bg-background shadow-sm
          w-full md:w-auto
          justify-around md:justify-center
        "
        >
          {navItems.map((item, index, array) => (
            <div key={item.title} className="contents">
              <Button
                variant="ghost"
                size="icon"
                onClick={item.onClick}
                disabled={isFetching}
                className="h-9 w-9 md:h-10 md:w-10 rounded-xl 
                hover:bg-muted transition-all duration-200 shrink-0"
                title={item.title}
              >
                <item.icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              </Button>

              {index < array.length - 1 && (
                <Separator
                  orientation="vertical"
                  className="h-5 opacity-50 md:hidden"
                />
              )}
              {index < array.length - 1 && (
                <Separator
                  orientation={"vertical"}
                  className="w-6 opacity-50 hidden "
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
