"use client";

import { File, Search, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import useDebounce from "@/hooks/use-debounce";
import { searchFiles } from "@/lib/modules/search/search.api";
import { SearchResult } from "@/lib/modules/search/search.schema";
import { encodeUrlPath } from "@/lib/utils";

const SEARCH_ALL_VALUE = "__search_all__";

function itemHref(item: SearchResult) {
  return encodeUrlPath(item.path);
}

function displayPath(item: SearchResult) {
  return item.path?.replace(/^\/+/, "") || `${item.item_type} #${item.item_id}`;
}

function NavbarSearch() {
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<{ query: string; results: SearchResult[] }>(
    { query: "", results: [] },
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(SEARCH_ALL_VALUE);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const debouncedQuery = useDebounce(searchQuery, 500);
  const query = debouncedQuery.trim();
  const typedQuery = searchQuery.trim();

  useEffect(() => {
    if (!query) return;

    let active = true;

    (async () => {
      const { data, error } = await searchFiles({
        query,
        page: 1,
        page_size: 5,
      });
      // Ignore responses for a query the user already moved past.
      if (!active) return;
      setHits({ query, results: error || !data ? [] : data.results });
    })();

    return () => {
      active = false;
    };
  }, [query]);

  const result = query && hits.query === query ? hits.results : [];
  const loading = typedQuery.length > 0 && hits.query !== typedQuery;

  const reset = () => {
    setSearchQuery("");
    setHits({ query: "", results: [] });
    setSelected(SEARCH_ALL_VALUE);
  };

  const goTo = (href: string) => {
    setOpen(false);
    reset();
    router.push(href);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const handleQueryChange = (value: string) => {
    setSearchQuery(value);
    setSelected(SEARCH_ALL_VALUE);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-between gap-1 sm:gap-2 rounded-md bg-muted/30 px-3 py-1.5 hover:bg-muted/50 transition-colors group border border-transparent"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="w-20 md:w-32 hidden md:block text-left bg-transparent text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Type here...
          </span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        shouldFilter={false}
        value={selected}
        onValueChange={setSelected}
      >
        <CommandInput
          value={searchQuery}
          onValueChange={handleQueryChange}
          placeholder="Search files and pens..."
        />
        <CommandList>
          {typedQuery && (
            <CommandGroup>
              <CommandItem
                value={SEARCH_ALL_VALUE}
                onSelect={() =>
                  goTo(`/search?q=${encodeURIComponent(typedQuery)}`)
                }
              >
                <Search className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  Search all results for “{typedQuery}”
                </span>
                <span className="ml-auto shrink-0 rounded border px-1 font-mono text-[10px] text-muted-foreground">
                  Enter
                </span>
              </CommandItem>
            </CommandGroup>
          )}

          {loading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {!loading && result.length > 0 && (
            <CommandGroup heading="Results">
              {result.map((item) => (
                <CommandItem
                  key={`${item.item_type}:${item.item_id}`}
                  value={`${item.item_type}:${item.item_id}`}
                  onSelect={() => goTo(itemHref(item))}
                >
                  {item.item_type === "pen" ? (
                    <SquarePen className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <File className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate font-mono text-xs">
                    {displayPath(item)}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">
                    {item.item_type}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!loading && typedQuery && result.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          )}

          {!typedQuery && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Type to search files and pens.
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export { NavbarSearch };
