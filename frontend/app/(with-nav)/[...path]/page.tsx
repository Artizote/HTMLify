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
import { CodePlayground } from "@/components/playgroud/code-playground";
import { Button } from "@/components/ui/button";
import { getFileContentByPath } from "@/lib/modules/file/file.actions";
import { getLanguageByPath } from "@/lib/modules/playgournd/editor.utils";

const getFileContentType = (
  filename: string,
  contentTypeHeader?: string | null,
): "img" | "video" | "audio" | "other" => {
  if (contentTypeHeader) {
    if (contentTypeHeader.startsWith("image/")) return "img";
    if (contentTypeHeader.startsWith("video/")) return "video";
    if (contentTypeHeader.startsWith("audio/")) return "audio";
  }

  const ext = filename.split(".").pop()?.toLowerCase();

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const videoExts = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
  const audioExts = ["mp3", "wav", "ogg", "aac", "flac"];

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

  const response = await getFileContentByPath(joinedPath);

  if (!response) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center text-destructive">
        Failed to load file content or file not found.
      </div>
    );
  }

  const contentType = response.headers.get("content-type");
  const code = await response.text();

  const fileType = getFileContentType(filename, contentType);
  if (fileType === "img") {
    return <img src={response.url} alt="" />;
  }
  return (
    <div className="flex flex-col max-h-[70vh]">
      {contentType}
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
