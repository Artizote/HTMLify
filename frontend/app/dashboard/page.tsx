import { getFolderByPath } from "@/lib/modules/file/file.actions";
import { getMe } from "@/lib/modules/user/user.actions";
import { Button } from "@/components/ui/button";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { FileTable } from "@/components/dashboard/file-table";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) => {
  let { path } = await searchParams;
  const user = await getMe();

  if (!user) {
    redirect("/signin");
  }

  if (!path) {
    path = `/${user.username}`;
  }

  const data = await getFolderByPath(path, true);
  const items = data?.items ?? [];

  console.log("items", items);
  return (
    <div className="flex flex-col gap-4 p-6 w-full">
      <div className="flex items-center justify-between">
        <DashboardBreadcrumb path={path} />
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      <FileTable items={items} />

      <p className="text-xs text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>
    </div>
  );
};

export default DashboardPage;
