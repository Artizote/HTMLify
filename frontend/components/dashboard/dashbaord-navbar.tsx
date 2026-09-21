import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type DasshboardNavbarProps =
  | {
      title: string;
      children?: React.ReactNode;
    }
  | {
      title?: string;
      children: React.ReactNode;
    };

export function DasshboardNavbar({
  title,
  children,
  className,
  ...props
}: DasshboardNavbarProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background",
        className,
      )}
      {...props}
    >
      <div className="flex w-full items-center gap-1 h-full pl-4 lg:gap-2 lg:pl-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-full opacity-60"
        />
        {children ? (
          children
        ) : (
          <>
            <h1 className="text-base font-medium">{title}</h1>
            <div className="ml-auto flex items-center h-full gap-2">
              <Link
                href="https://github.com/Artizote/HTMLify"
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground h-full 
                flex items-center px-4 w-full justify-center 
                border-l border-l-foreground/10
                hover:bg-foreground/5 text-sm"
              >
                GitHub
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
