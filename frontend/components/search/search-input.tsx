"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debounce";

const DEBOUNCE_MS = 350;

interface SearchInputProps {
  defaultValue?: string;
}

export function SearchInput({ defaultValue = "" }: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const debounced = useDebounce(value, DEBOUNCE_MS);
  const currentQuery = useRef(defaultValue.trim());
  const router = useRouter();

  useEffect(() => {
    const q = debounced.trim();
    if (q === currentQuery.current) return;
    currentQuery.current = q;
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", {
      scroll: false,
    });
  }, [debounced, router]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    if (q === currentQuery.current) return;
    currentQuery.current = q;
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", {
      scroll: false,
    });
  };

  return (
    <form
      onSubmit={submit}
      autoComplete="off"
      className="flex w-full items-center gap-2"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          placeholder="Search files and pens..."
          className="h-11 pl-9"
          autoFocus
        />
      </div>
      <Button type="submit" className="h-11">
        Search
      </Button>
    </form>
  );
}
