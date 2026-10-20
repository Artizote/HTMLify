"use client";

import { Clock, Download } from "lucide-react";
import { useEffect, useState } from "react";
import type { BundledLanguage } from "shiki";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ai-elements/code-block";
import { FileIcon } from "@/components/dashboard/file-icon";
import { FileMediaPreview } from "@/components/file/file-media-preview";
import { Button } from "@/components/ui/button";
import { CopyableUrl } from "@/components/ui/copyable-url";
import { getFileContentType } from "@/lib/modules/file/file.utils";
import { getLanguageByPath } from "@/lib/modules/playgournd/editor.utils";
import {
  getTmpFileText,
  MAX_TEXT_PREVIEW_SIZE,
} from "@/lib/modules/tmp/tmp.api";
import { TmpFolderFile } from "@/lib/tmp-folder/tmp-folder.types";
import { formatDateTime } from "@/lib/utils";
import { downloadFile } from "@/lib/utils/actions";

import { isExpired } from "./utils";

export function FileMetadata({ file }: { file: TmpFolderFile }) {
  const fileType = getFileContentType(file.name);
  const isText = fileType === "other";
  const isBinary = fileType === "binary";
  const expired = isExpired(file.expiry);

  const [code, setCode] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    if (!isText) return;

    let active = true;
    setCode(null);
    setContentError(null);

    getTmpFileText(file.id).then(({ data, error }) => {
      if (!active) return;
      setCode(data);
      setContentError(error);
    });

    return () => {
      active = false;
    };
  }, [file.id, isText]);

  return (
    <div className="flex h-full flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <FileIcon path={file.name} />
          <div className="min-w-0">
            <p
              className="truncate font-mono text-sm text-foreground"
              title={file.name}
            >
              {file.name}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {file.id}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {expired ? (
            <span className="text-destructive">expired</span>
          ) : (
            formatDateTime(file.expiry)
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadFile(file.url, file.name)}
          className="shrink-0 gap-1.5 text-muted-foreground"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>

        <CopyableUrl
          url={file.url}
          showShare
          showOpen
          className="ml-auto w-full sm:w-96"
        />
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        {isText ? (
          <TextPreview
            filename={file.name}
            url={file.url}
            code={code}
            error={contentError}
          />
        ) : isBinary ? (
          <div className="flex h-full items-center justify-center px-6 text-center font-mono text-sm text-muted-foreground">
            no inline preview for this file type
          </div>
        ) : (
          <FileMediaPreview
            plain
            fileType={fileType}
            url={file.url}
            name={file.name}
          />
        )}
      </div>
    </div>
  );
}

function TextPreview({
  filename,
  url,
  code,
  error,
}: {
  filename: string;
  url: string;
  code: string | null;
  error: string | null;
}) {
  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center font-mono text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (code === null) {
    return (
      <div className="flex h-full items-center justify-center px-6 font-mono text-sm text-muted-foreground">
        loading...
      </div>
    );
  }

  if (code.length > MAX_TEXT_PREVIEW_SIZE) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-mono text-sm text-muted-foreground">
          file is too large to preview
        </p>
        <Button asChild size="sm" variant="outline">
          <a href={url} download={filename}>
            <Download className="size-4" />
            download file
          </a>
        </Button>
      </div>
    );
  }

  const language = getLanguageByPath(filename);

  return (
    <CodeBlock
      code={code}
      showLineNumbers
      language={language as BundledLanguage}
      className="flex h-full flex-col rounded-none border-0"
      contentClassName="min-h-0 flex-1"
    >
      <CodeBlockHeader>
        <CodeBlockTitle className="w-full min-w-0">
          <FileIcon path={filename} />
          <CodeBlockFilename className="truncate">{filename}</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  );
}

export function EmptyState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-8 text-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rotate-45 border border-primary/40 rounded-sm" />
        <div className="absolute inset-3 rounded-sm border border-dashed border-border" />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl text-primary">
          ↳
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-mono text-base text-foreground">select a file</p>
        <p className="font-mono text-sm text-muted-foreground">
          choose a file from the list to{" "}
          <span className="text-primary">preview</span> it here
        </p>
      </div>
    </div>
  );
}
