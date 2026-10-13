"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type DasshboardNavbarProps =
  | {
      title: string;
      children?: React.ReactNode;
      actions?: React.ReactNode;
    }
  | {
      title?: string;
      children: React.ReactNode;
      actions?: React.ReactNode;
    };

// Routse which are the "create" destination don't need "New" button
const CREATE_PAGES = ["/dashboard/pens/edit", "/dashboard/file/new"];

function getCreateHref(pathname: string): string | null {
  if (CREATE_PAGES.includes(pathname)) return null;
  if (pathname.startsWith("/dashboard/pens")) return "/dashboard/pens/edit";
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/files") ||
    pathname.startsWith("/dashboard/file")
  ) {
    return "/dashboard/file/new";
  }
  return null;
}

export function DasshboardNavbar({
  title,
  children,
  actions,
  className,
  ...props
}: DasshboardNavbarProps & React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();
  const createHref = getCreateHref(pathname);

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
        <div className="flex h-full min-w-0 flex-1 items-center gap-2">
          {children ? (
            children
          ) : (
            <h1 className="truncate text-base font-medium">{title}</h1>
          )}
        </div>
        {actions ??
          (createHref ? (
            <Link
              href={createHref}
              className="border-x border-x-border h-full flex items-center px-4 text-sm gap-2 hover:bg-foreground/5"
            >
              <Plus className="h-4 w-4" />
              New
            </Link>
          ) : null)}
      </div>
    </header>
  );
}
