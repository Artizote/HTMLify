import Link from "next/link";

import { Logo } from "@/components/logo";
import { env } from "@/lib/env";

const columns = [
  {
    title: "Product",
    links: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Temp File", href: "/tmp" },
      { name: "Shortlinks", href: "/r" },
    ],
  },
  {
    title: "Platform",
    links: [
      { name: "Frames", href: "/frames" },
      { name: "API", href: "/api" },
      { name: "Upload", href: "/dashboard/file/upload" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "New File", href: "/dashboard/file/new" },
      { name: "Search", href: "/search" },
      { name: "Sign In", href: "/signin" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 lg:px-12 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <Logo />
              <span className="text-lg font-bold tracking-tight text-foreground">
                {env.NEXT_PUBLIC_SITE_NAME}
              </span>
            </Link>
            <p className="mt-4 max-w-xs font-mono text-sm leading-relaxed text-muted-foreground">
              Deploy and host your web projects in seconds. One platform for
              every stack - no config, no lock-in.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <span className="font-mono text-xs tracking-widest text-muted-foreground/60 uppercase">
                # {col.title}
              </span>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {env.NEXT_PUBLIC_SITE_NAME}
          </span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Deployed on the global edge
          </span>
        </div>
      </div>
    </footer>
  );
}
