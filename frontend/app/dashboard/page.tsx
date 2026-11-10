import {
  Clock,
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
import { getUserDashboardStats, getUserDashboardLatestModefiesItems } from "lib/utils/dashboard";
import { FileItem, isFolderItem } from "@/lib/modules/file/file.types";
import { getPens } from "@/lib/modules/pen/pen.api";
import { getMe } from "@/lib/modules/user/user.actions";
import { formatDateTime } from "@/lib/utils";

const quickActions = [
  { title: "New File", href: "/dashboard/file/new", icon: PlusSquare },
  { title: "Upload Files", href: "/dashboard/file/upload", icon: Upload },
  { title: "Git Clone", href: "/dashboard/file/git-clone", icon: GitBranch },
  { title: "New Pen", href: "/dashboard/pens/edit", icon: PenTool },
  { title: "Temp File", href: `${env.NEXT_PUBLIC_SITE_URL}/tmp`, icon: Clock },
];

const DashboardOverviewPage = async () => {
  const user = await getMe();
  if (!user) redirect("/");

  const stats = await getUserDashboardStats(user.username);
  const recent = await getUserDashboardLatestModefiesItems(user.username);

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
            <div className="text-2xl font-semibold">{stats.file.count}</div>
            <div className="text-sm text-muted-foreground">{stats.file.count == 1 ? "File" : "Files"}</div>
          </Link>
          <Link
            href="/dashboard/pens"
            className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <div className="text-2xl font-semibold">{stats.pen.count}</div>
            <div className="text-sm text-muted-foreground">{stats.pen.count == 1 ? "Pen" : "Pens"}</div>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent changes</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing here yet. Create a file or a pen to get started.
              </p>
            ) : (
              <ul className="divide-y">
                {recent.map((item) => (
                  <li key={`${item.type}:${item.path}`}>
                    <Link
                      href={
                        item.type === "pen"
                          ? `/dashboard/pens/edit?id=${item.id}`
                          : `/dashboard/file/edit/${item.id}`
                      }
                      className="flex items-center gap-3 rounded-sm px-3 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      {item.type === "pen" ? (
                        <PenTool className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <FileIcon path={item.path} />
                      )}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          {item.title}
                        </span>
                        <span className="truncate font-mono text-[11px] text-muted-foreground">
                          {item.path}
                        </span>
                      </div>
                      <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                        {formatDateTime(item.modified)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardOverviewPage;
