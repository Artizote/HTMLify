import {
  Clock,
  Folder,
  GitBranch,
  PenTool,
  PlusSquare,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { FileIcon } from "@/components/dashboard/file-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/env";
import { getFolderByPath } from "@/lib/modules/file/file.api";
import { isFolderItem } from "@/lib/modules/file/file.types";
import { getPens } from "@/lib/modules/pen/pen.api";
import { getMe } from "@/lib/modules/user/user.actions";

const quickActions = [
  { title: "New File", href: "/dashboard/file/new", icon: PlusSquare },
  { title: "Upload Files", href: "/dashboard/file/upload", icon: Upload },
  { title: "Git Clone", href: "/dashboard/file/git-clone", icon: GitBranch },
  { title: "New Pen", href: "/dashboard/pens/edit", icon: PenTool },
  { title: "Temp File", href: `${env.NEXT_PUBLIC_SITE_URL}/tmp`, icon: Clock },
];

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

const DashboardOverviewPage = async () => {
  const user = await getMe();
  if (!user) redirect("/");

  const [{ data: folder }, { data: pens }] = await Promise.all([
    getFolderByPath(`/${user.username}`, true, 1, 6, "-modified"),
    getPens(),
  ]);

  const recent = folder?.items ?? [];
  const fileCount = folder?.items_count ?? 0;
  const penCount = pens?.length ?? 0;

  return (
    <>
      <DasshboardNavbar title="Dashboard" />
      <div className="flex w-full max-w-7xl mx-auto flex-col gap-8 p-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back, {user.name || user.username}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here is an overview of your workspace.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-sm font-medium">{action.title}</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <Link
            href="/dashboard/files"
            className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <div className="text-2xl font-semibold">{fileCount}</div>
            <div className="text-sm text-muted-foreground">Files &amp; folders</div>
          </Link>
          <Link
            href="/dashboard/pens"
            className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <div className="text-2xl font-semibold">{penCount}</div>
            <div className="text-sm text-muted-foreground">Pens</div>
          </Link>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent files</CardTitle>
            <Link
              href="/dashboard/files"
              className="text-sm text-muted-foreground hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You have not created any files yet.
              </p>
            ) : (
              <ul className="divide-y">
                {recent.map((item) => {
                  const isFolder = isFolderItem(item);
                  const name = isFolder
                    ? item.name ||
                      item.path.split("/").filter(Boolean).pop() ||
                      "Folder"
                    : item.title ||
                      item.path.split("/").filter(Boolean).pop() ||
                      "Untitled";

                  const row = (
                    <div className="flex items-center gap-3 py-2.5">
                      {isFolder ? (
                        <Folder
                          fill="currentColor"
                          className="h-4 w-4 shrink-0 text-blue-400"
                        />
                      ) : (
                        <FileIcon path={item.path} />
                      )}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          {name}
                        </span>
                        <span className="truncate font-mono text-[11px] text-muted-foreground">
                          {item.path}
                        </span>
                      </div>
                      {!isFolder && (
                        <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(item.modified)}
                        </span>
                      )}
                    </div>
                  );

                  return (
                    <li key={item.path}>
                      {isFolder ? (
                        <Link
                          href={`/dashboard/files?path=${item.path}`}
                          className="block rounded-sm transition-colors hover:bg-accent/40"
                        >
                          {row}
                        </Link>
                      ) : (
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-sm transition-colors hover:bg-accent/40"
                        >
                          {row}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardOverviewPage;
