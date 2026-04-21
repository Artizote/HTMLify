import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { FileTable } from "@/components/dashboard/file-table";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { getFolderByPath } from "@/lib/modules/file/file.api";
import { getMe } from "@/lib/modules/user/user.actions";

interface DashboardPageProps {
  searchParams: Promise<{ path: string; page?: string; page_size?: string }>;
}

function max(a: number, b: number) {
  return a > b ? a : b;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  //eslint-disable-next-line
  let { page, page_size, path } = await searchParams;

  const user = await getMe();
  // User shouldn't be null beecause middlware checking but still we are checkig if by any chance middleware failes
  // but not redirect to signin page because it will cause infinite loop
  if (!user) redirect("/");
  path = path || `/${user.username}`;

  const currentPage = page ? max(parseInt(page), 1) : 1;
  const pageSize = page_size
    ? max(parseInt(page_size), 1)
    : env.NEXT_PUBLIC_PAGE_SIZE;

  const data = await getFolderByPath(path, true, currentPage, pageSize);
  const items = data?.items ?? [];
  const totalItems = data?.items_count ?? 0;

  return (
    <div className="flex flex-col gap-4 p-6 w-full">
      <div className="flex items-center justify-between">
        <DashboardBreadcrumb path={path} />
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      <FileTable
        items={items}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
      />

      <p className="text-xs text-muted-foreground">
        Showing {items.length} of {totalItems}{" "}
        {totalItems === 1 ? "item" : "items"}
      </p>
    </div>
  );
};

export default DashboardPage;
