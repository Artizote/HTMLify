import { FileIcon } from "lucide-react";
import { BundledLanguage } from "shiki";

import {
  CodeBlockActions,
  CodeBlockContainer,
  CodeBlockContent,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ai-elements/code-block";
import { MediaViewer } from "@/components/media-viewer";
import { CodePlayground } from "@/components/playgroud/code-playground";
import { Button } from "@/components/ui/button";
import { APIError } from "@/lib/errors";
import { getFileContentByPath } from "@/lib/modules/file/file.actions";
import { getLanguageByPath } from "@/lib/modules/playgournd/editor.utils";

type FileType = "img" | "video" | "audio" | "other";

const getFileContentType = (
  filename: string,
  contentTypeHeader?: string | null,
): FileType => {
  if (contentTypeHeader) {
    if (contentTypeHeader.startsWith("image/")) return "img";
    if (contentTypeHeader.startsWith("video/")) return "video";
    if (contentTypeHeader.startsWith("audio/")) return "audio";
  }

  const ext = filename.split(".").pop()?.toLowerCase();

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const videoExts = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
  const audioExts = ["mp3", "wav", "aac", "flac"];

  if (ext && imageExts.includes(ext)) return "img";
  if (ext && videoExts.includes(ext)) return "video";
  if (ext && audioExts.includes(ext)) return "audio";

  return "other";
};

const StaticServe = async ({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) => {
  const { path } = await params;
  let joinedPath = path.join("/");
  joinedPath = joinedPath.startsWith("/") ? joinedPath : `/${joinedPath}`;
  const language = getLanguageByPath(joinedPath);
  const filename = joinedPath;

  let contentType: string | null = null;
  let code = "";
  let mediaUrl: string | null = null;
  let fileType: FileType = "other";

  try {
    const response = await getFileContentByPath(joinedPath);
    contentType = response.headers.get("content-type");
    fileType = getFileContentType(filename, contentType);
    if (fileType === "img" || fileType === "video" || fileType === "audio") {
      mediaUrl = response.url;
    } else {
      code = await response.text();
    }
  } catch (err) {
    const message =
      err instanceof APIError
        ? err.message
        : "Failed to load file content or file not found.";
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center text-destructive">
        {message}
      </div>
    );
  }

  if (mediaUrl && (fileType === "img" || fileType === "video" || fileType === "audio")) {
    return (
      <div className="flex flex-col items-center max-h-[70vh]">
        <MediaViewer
          src={mediaUrl}
          type={fileType}
          filename={filename}
          contentType={contentType}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[70vh]">
      <CodeBlockContainer language={language}>
        <CodeBlockHeader>
          <CodeBlockTitle className="w-full">
            <FileIcon size={14} />
            <CodeBlockFilename>{filename}</CodeBlockFilename>
          </CodeBlockTitle>
          <CodePlayground code={code} language={language}>
            <Button size="sm" className="h-8 text-xs">
              Run
            </Button>
          </CodePlayground>
          <CodeBlockActions></CodeBlockActions>
        </CodeBlockHeader>

        <div className="overflow-auto max-h-[70vh] min-h-0">
          <CodeBlockContent
            code={code}
            showLineNumbers
            language={language as BundledLanguage}
          />
        </div>
      </CodeBlockContainer>
    </div>
  );
};

export default StaticServe;
