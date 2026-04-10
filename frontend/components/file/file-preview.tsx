import { Music } from "lucide-react";
import Image from "next/image";

import { FileType } from "@/lib/modules/file/file.schema";
import { getLanguageByPath } from "@/lib/modules/playgournd/editor.utils";

import CodeEditor from "../playgroud/code-editor";

interface FilePreviewProps {
  fileType: FileType;
  path: string;
  code?: string;
  onChange?: (code: string) => void;
  mediaUrl?: string | null;
}

export function FilePreview({
  fileType,
  path,
  code,
  onChange,
  mediaUrl,
}: FilePreviewProps) {
  if (fileType === "img") {
    return (
      <div className="relative w-full h-[60vh] min-h-[300px] flex items-center justify-center bg-muted/20 rounded-xl border border-border/50 overflow-hidden my-4">
        <Image
          className="w-full h-full object-contain p-2"
          width={1000}
          height={1000}
          src={mediaUrl || path}
          alt={path}
        />
      </div>
    );
  }
  if (fileType === "video") {
    return (
      <div className="relative w-full h-[60vh] min-h-[300px] flex items-center justify-center bg-black/95 rounded-xl border border-border/50 overflow-hidden my-4 shadow-sm">
        <video
          src={mediaUrl || path}
          controls
          className="w-full h-full object-contain focus:outline-none"
        />
      </div>
    );
  }
  if (fileType === "audio") {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-muted/50 to-muted/10 rounded-xl border border-border/50 my-4 shadow-sm">
        <div className="p-4 bg-background rounded-full shadow-sm border border-border/50">
          <Music className="w-8 h-8 text-primary/70" />
        </div>
        <audio
          src={mediaUrl || path}
          controls
          className="w-full max-w-md focus:outline-none"
        />
      </div>
    );
  }
  return (
    <CodeEditor
      code={code || ""}
      onChange={onChange || (() => {})}
      path={path}
      language={getLanguageByPath(path)}
    />
  );
}
