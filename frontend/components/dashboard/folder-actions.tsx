import { FilePlus2, FolderGit2, Upload } from "lucide-react";
import Link from "next/link";

const actions = [
  { title: "New", href: "/dashboard/file/new", icon: FilePlus2 },
  { title: "Upload", href: "/dashboard/file/upload", icon: Upload },
  { title: "Clone", href: "/dashboard/file/git-clone", icon: FolderGit2 },
];

/**
 * Navbar action links shown while browsing a folder. Each link carries the
 * current folder path so the destination form is pre-filled with it.
 */
export function FolderActions({ path }: { path: string }) {
  const query = path ? `?path=${encodeURIComponent(path)}` : "";

  return (
    <div className="flex h-full items-center border-r border-r-border">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={`${action.href}${query}`}
          className="flex h-full items-center gap-2 border-l border-l-border px-4 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        >
          <action.icon className="h-4 w-4" />
          {action.title}
        </Link>
      ))}
    </div>
  );
}
