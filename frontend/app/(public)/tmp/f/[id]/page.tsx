"use client";

import { Folder, FolderDown } from "lucide-react";
import { use, useCallback, useEffect, useRef, useState } from "react";

import { ListFiles } from "@/components/tmp/folder/file-list";
import { EmptyState, FileMetadata } from "@/components/tmp/folder/file-preview";
import { Button } from "@/components/ui/button";
import { CopyableUrl } from "@/components/ui/copyable-url";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { getTmpFolder } from "@/lib/tmp-folder/tmp-folder.api";
import { TmpFolderMeta } from "@/lib/tmp-folder/tmp-folder.types";
import { pathToPublicUrl } from "@/lib/utils";
import { downloadFiles } from "@/lib/utils/actions";

const REFRESH_INTERVAL_MS = 30_000;

const TmpFolderPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const isMobile = useIsMobile();
  const [folder, setFolder] = useState<TmpFolderMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(
    async (silent = false) => {
      if (inFlight.current) return;
      inFlight.current = true;

      if (!silent) {
        setLoading(true);
        setError(null);
      }

      const { data, error } = await getTmpFolder(id);

      inFlight.current = false;

      if (silent) {
        if (data) {
          setFolder(data);
          setError(null);
        }
        return;
      }

      setFolder(data);
      setError(error);
      setLoading(false);
    },
    [id],
  );

  useEffect(() => {
    void load();

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(true);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!folder) return;
    if (selectedId && folder.files.some((f) => f.id === selectedId)) return;

    setSelectedId(folder.files.length === 1 ? folder.files[0].id : null);
  }, [folder, selectedId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4 font-mono text-muted-foreground">
        loading...
      </div>
    );
  }

  if (error || !folder) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center font-mono">
        <p className="text-sm text-destructive">could not load this folder</p>
        <p className="text-xs text-muted-foreground">
          {error || "failed to fetch folder"}
        </p>
        <Button size="sm" variant="outline" onClick={() => void load()}>
          retry
        </Button>
      </div>
    );
  }

  if (folder.files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 font-mono text-muted-foreground">
        this folder is empty
      </div>
    );
  }

  const files = folder.files;
  const selected = files.find((f) => f.id === selectedId) ?? null;

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-2">
        <Folder className="size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p
            className="truncate font-mono text-sm text-foreground"
            title={folder.name}
          >
            {folder.name}
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {folder.id}
            <span className="mx-1.5 text-border">/</span>
            {files.length} {files.length === 1 ? "file" : "files"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            downloadFiles(
              files.map((file) => ({ url: file.url, filename: file.name })),
            )
          }
          className="shrink-0 gap-1.5 text-muted-foreground"
        >
          <FolderDown className="h-4 w-4" />
          <span className="hidden sm:inline">Download all</span>
        </Button>
        <CopyableUrl
          url={pathToPublicUrl(`/tmp/f/${folder.id}`)}
          showShare
          showOpen
          className="ml-auto w-full sm:w-96"
        />
      </div>

      <div className="min-h-0 flex-1">
        <ResizablePanelGroup
          key={isMobile ? "vertical" : "horizontal"}
          orientation={isMobile ? "vertical" : "horizontal"}
          className="h-full w-full"
        >
          <ResizablePanel
            defaultSize={isMobile ? 65 : 70}
            minSize={isMobile ? "45%" : "50%"}
          >
            {selected ? <FileMetadata file={selected} /> : <EmptyState />}
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={isMobile ? 35 : 30}
            minSize={isMobile ? "30%" : "20%"}
          >
            <ListFiles
              files={files}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default TmpFolderPage;
