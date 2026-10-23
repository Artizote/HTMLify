import { ExternalLink, File, SquarePen } from "lucide-react";
import Link from "next/link";

import { AppPagination } from "@/components/app-pagination";
import { FileIcon } from "@/components/dashboard/file-icon";
import { SearchInput } from "@/components/search/search-input";
import { searchFiles } from "@/lib/modules/search/search.api";
import { SearchResult } from "@/lib/modules/search/search.schema";
import { encodeUrlPath, pathToPublicUrl } from "@/lib/utils";

const PAGE_SIZE = 32;
interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

function sourceHref(item: SearchResult) {
  return `/src${encodeUrlPath(item.path)}`;
}

function ActionLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="shrink-0 rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      {children}
    </Link>
  );
}

function displayTitle(item: SearchResult) {
  const path = item.path || "";
  const title = (item.title || "").trim();
  if (title && title !== path) return title;
  const name = path.split("/").filter(Boolean).pop();
  return name || `${item.item_type} #${item.item_id}`;
}

function ResultRow({ item }: { item: SearchResult }) {
  const publicUrl = pathToPublicUrl(encodeUrlPath(item.path));

  return (
    <div className="flex items-center gap-3 border-b border-border/40 p-3 hover:bg-foreground/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
        {item.item_type === "pen" ? (
          <SquarePen className="h-4 w-4 text-muted-foreground" />
        ) : (
          <FileIcon path={item.path} />
        )}
      </div>
      <Link
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group min-w-0 flex-1"
        title="Open file"
      >
        <p className="flex items-center gap-1 truncate text-sm font-medium group-hover:text-primary">
          <span className="truncate">{displayTitle(item)}</span>
          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </p>
        <p className="truncate font-mono text-[11px] text-muted-foreground">
          {item.path}
        </p>
      </Link>
      <div className="flex shrink-0 items-center gap-1.5">
        <ActionLink href={publicUrl} external>
          View
        </ActionLink>
        {sourceHref(item) && (
          <ActionLink href={sourceHref(item)}>Src</ActionLink>
        )}
      </div>
    </div>
  );
}

async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? "").trim();
  const page = Math.max(1, Number(pageParam) || 1);

  const { data, error } = query
    ? await searchFiles({ query, page, page_size: PAGE_SIZE })
    : { data: null, error: null };

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 pb-16 pt-8">
      <h1 className="mb-4 text-xl font-semibold">Search</h1>

      <SearchInput defaultValue={query} />

      {!query && (
        <p className="mt-8 text-sm text-muted-foreground">
          Type something to search your files and pens.
        </p>
      )}

      {query && error && (
        <p className="mt-8 text-sm text-destructive">{error}</p>
      )}

      {query && !error && data && (
        <div className="mt-6">
          <p className="mb-2 text-xs text-muted-foreground">
            {data.total_results} result{data.total_results === 1 ? "" : "s"} for
            “{query}” in {data.time_took.toFixed(3)}s
          </p>

          {data.results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <File className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No results found for “{query}”.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/60">
              {data.results.map((item) => (
                <ResultRow
                  key={`${item.item_type}:${item.item_id}`}
                  item={item}
                />
              ))}
            </div>
          )}

          <div className="mt-6">
            <AppPagination
              pageCount={data.total_pages}
              currentPage={data.page}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
