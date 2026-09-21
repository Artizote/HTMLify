import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { FileTable } from "@/components/dashboard/file-table";
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

  const { data, error } = await getFolderByPath(
    path,
    true,
    currentPage,
    pageSize,
  );
  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6 w-full">
        <DashboardBreadcrumb path={path} />
        <p className="text-destructive">{error}</p>
      </div>
    );
  }
  const items = data?.items ?? [];
  const totalItems = data?.items_count ?? 0;

  return (
    <>
      <DasshboardNavbar className="w-full">
        <div className="flex items-center h-full justify-between w-full">
          <DashboardBreadcrumb path={path} />
          <Link
            href="/dashboard/file/new"
            className="border-x border-x-border h-full flex 
						hover:bg-foreground/5
            items-center px-4 text-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
        </div>
      </DasshboardNavbar>
      <div className="flex flex-col gap-4 p-6 w-full">
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
    </>
  );
};

export default DashboardPage;
