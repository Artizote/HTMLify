import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { PensTable } from "@/components/pens/pens-table";
import { env } from "@/lib/env";
import { getPens } from "@/lib/modules/pen/pen.api";

export default async function PensPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;
  const pageSize = env.NEXT_PUBLIC_PAGE_SIZE;

  const { data, error } = await getPens();
  if (error || !data) {
    return <div>Failed to get pens</div>;
  }

  const totalItems = data.length;
  const pageCount = Math.ceil(totalItems / pageSize);
  const pageIndex = currentPage - 1;

  const paginatedPens = data.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  );

  return (
    <>
      <DasshboardNavbar title="Pens" />
      <div className="container mx-auto px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Your Pens</h2>
          <p className="text-muted-foreground">
            Manage your HTML CSS JS pens.
          </p>
        </div>
        <PensTable
          pens={paginatedPens}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
        <p className="text-xs text-muted-foreground">
          Showing {paginatedPens.length} of {totalItems}{" "}
          {totalItems === 1 ? "pen" : "pens"}
        </p>
      </div>
    </>
  );
}
