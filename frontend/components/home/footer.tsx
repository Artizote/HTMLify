import Link from "next/link";

import { Logo } from "@/components/logo";
import { env } from "@/lib/env";
import { StatsInsightLine } from "components/home/stats-insight-line"


const columns = [
  {
    title: "Services",
    links: [
      { name: "File Hosting", href: "/dashboard/files" },
      { name: "Code Pen",     href: "/dashboard/pens" },
      { name: "Temp Files",   href: "/tmp" },
      { name: "Temp Folders", href: "/tmp/f" },
      { name: "Short Links",  href: "/r" },
    ],
  },
  {
    title: "Explore",
    links: [
      { name: "Frames",   href: "/frames" },
      { name: "Search",   href: "/search" },
      { name: "API Docs", href: "/api" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { name: "Host a TmpFile",     href: "/tmp" },
      { name: "Create a ShortLink", href: "/r" },
      { name: "Community showcase", href: "/frames" },
      { name: "Create a File",      href: "/dashboard/file/new" },
      { name: "Create a Pen",          href: "/dashboard/pens/edit" },
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
              Make your webpages and code snippets live to the internet.
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
            <StatsInsightLine />
          </span>
        </div>
      </div>
    </footer>
  );
}
