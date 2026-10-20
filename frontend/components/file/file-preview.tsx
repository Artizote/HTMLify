import { FileMediaPreview } from "@/components/file/file-media-preview";
import { FileType } from "@/lib/modules/file/file.types";
import { getLanguageByPath } from "@/lib/modules/playgournd/editor.utils";

import CodeEditor from "../playgroud/code-editor";

const getCacheBustedUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
};

interface FilePreviewProps {
  fileType: FileType;
  path: string;
  code?: string;
  onChange?: (code: string) => void;
  mediaUrl?: string | null;
  plain?: boolean;
}

export function FilePreview({
  fileType,
  path,
  code,
  onChange,
  mediaUrl,
  plain = false,
}: FilePreviewProps) {
  const finalUrl = getCacheBustedUrl(mediaUrl || path);

  switch (fileType) {
    case "binary":
      return (
        <div
          className={
            plain
              ? "flex flex-col items-center justify-center gap-6 px-8 py-12"
              : "flex flex-col items-center justify-center gap-6 rounded-xl border border-border/50 bg-muted/10 p-8 shadow-sm"
          }
        >
          <p className="text-muted-foreground">can&apos;t preview this file</p>
        </div>
      );
    case "img":
    case "video":
    case "audio":
      return (
        <FileMediaPreview
          fileType={fileType}
          url={finalUrl}
          name={path}
          plain={plain}
        />
      );
    default:
      return (
        <CodeEditor
          language={getLanguageByPath(path)}
          code={code || ""}
          onChange={onChange || (() => {})}
          path={path}
        />
      );
  }
}
