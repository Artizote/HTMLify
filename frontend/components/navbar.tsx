"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Logo } from "@/components/logo";
import { NavbarSearch } from "@/components/nav-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { env } from "@/lib/env";

const NAV_LINKS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Temp Share", href: "/tmp" },
  { name: "Shortlinks", href: "/r" },
  { name: "Frames", href: "/frames" },
  { name: "API", href: "/api" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 h-14 px-8 bg-background border-b border-border text-foreground">
      <div className="container h-full mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <span className="text-lg font-bold tracking-tight text-foreground">
            {env.NEXT_PUBLIC_SITE_NAME}
          </span>
        </Link>

        <div className="hidden lg:flex divide-x divide-border/60 border-x border-border/60 items-center h-full">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`text-sm font-medium h-full min-w-22 flex items-center justify-center px-6 transition-colors hover:bg-foreground/5 hover:text-foreground ${
                link.href === pathname
                  ? "bg-foreground/5"
                  : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <NavbarSearch />
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 flex flex-col gap-1 p-2"
              >
                {NAV_LINKS.map((link, index) => (
                  <DropdownMenuItem key={index} asChild>
                    <Link
                      href={link.href}
                      className={
                        index === 0
                          ? "font-medium"
                          : "font-medium text-muted-foreground hover:text-foreground"
                      }
                    >
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
