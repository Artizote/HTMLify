import { redirect } from "next/navigation";

import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { FileTable } from "@/components/dashboard/file-table";
import { FolderActions } from "@/components/dashboard/folder-actions";
import { env } from "@/lib/env";
import { getFolderByPath } from "@/lib/modules/file/file.api";
import { getMe } from "@/lib/modules/user/user.actions";

interface FilesPageProps {
  searchParams: Promise<{ path: string; page?: string; page_size?: string }>;
}

function max(a: number, b: number) {
  return a > b ? a : b;
}

const FilesPage = async ({ searchParams }: FilesPageProps) => {
  //eslint-disable-next-line
  let { page, page_size, path } = await searchParams;

  const user = await getMe();
  // User shouldn't be null because middleware is checking, but we still check
  // just in case. We don't redirect to signin to avoid an infinite loop.
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
      <DasshboardNavbar actions={<FolderActions path={path} />}>
        <DashboardBreadcrumb path={path} />
      </DasshboardNavbar>
      <div className="container mx-auto px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Your Files</h2>
          <p className="text-muted-foreground">
            Manage your files and folders.
          </p>
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
    </>
  );
};

export default FilesPage;
