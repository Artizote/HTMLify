"use client";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createShortLink } from "@/lib/modules/shortlink/shortlink.api";

interface FramesSidebarProps {
  children: React.ReactNode;
  handleNext: () => void;
  handleBack: () => void;
  isFetching?: boolean;
  currentURL: string;
  handleReload: () => void;
}

const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  toast.success("Link copied to clipboard");
};

export const FramesSidebar = ({
  children,
  handleNext,
  handleBack,
  currentURL,
  handleReload,
  isFetching,
}: FramesSidebarProps) => {
  const handleRedirect = () => {
    window.open(currentURL, "_blank");
  };

  const handleCopy = async () => {
    const short = await createShortLink(currentURL);
    if (!short) {
      await copyToClipboard(currentURL);
      return;
    }
    await copyToClipboard(short.url);
  };
  const navItems = [
    { icon: ExternalLink, onClick: handleRedirect, title: "Open in new tab" },
    { icon: ChevronUp, onClick: handleBack, title: "Back" },
    { icon: ChevronDown, onClick: handleNext, title: "Next" },
    { icon: Copy, onClick: handleCopy, title: "Copy" },
    { icon: RefreshCw, onClick: handleReload, title: "Reload" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="flex-1 min-w-0 relative">{children}</div>
      <div className="w-16 border-l flex flex-col justify-center items-center py-6 gap-6 border-border/50 bg-muted/10">
        <div className="flex flex-col items-center  gap-2 p-1.5 rounded-2xl border bg-background shadow-sm">
          {navItems.map((item, index, array) => (
            <div key={item.title} className="contents">
              <Button
                variant="ghost"
                size="icon"
                onClick={item.onClick}
                disabled={isFetching}
                className="h-10 w-10 rounded-xl hover:bg-muted transition-all duration-200"
                title={item.title}
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </Button>
              {index < array.length - 1 && (
                <Separator className="w-6 opacity-50" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
