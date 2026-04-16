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
import { getFileContentByPath } from "@/lib/modules/file/file.api";
import { getFileContentType } from "@/lib/modules/file/file.utils";
import { getLanguageByPath } from "@/lib/modules/playgournd/editor.utils";

type FileData =
  | {
      isMedia: true;
      url: string;
      fileType: "img" | "video" | "audio";
      contentType: string | null;
    }
  | { isMedia: false; code: string };

const StaticServe = async ({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) => {
  const { path } = await params;
  const filename = `/${path.join("/")}`.replace(/^\/\//, "/");
  const language = getLanguageByPath(filename);

  let fileData: FileData;
  let error: string | null = null;

  try {
    const response = await getFileContentByPath(filename);
    const contentType = response.headers.get("content-type");
    const fileType = getFileContentType(filename, contentType);
    const isMedia =
      fileType === "img" || fileType === "video" || fileType === "audio";

    fileData = isMedia
      ? { isMedia: true, url: response.url, fileType, contentType }
      : { isMedia: false, code: await response.text() };
  } catch (err) {
    error =
      err instanceof APIError
        ? err.message
        : "Failed to load file content or file not found.";
  }

  if (error) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center text-destructive">
        {error}
      </div>
    );
  }

  if (fileData!.isMedia) {
    const { url, fileType, contentType } = fileData!;
    return (
      <div className="flex flex-col items-center max-h-[70vh]">
        <MediaViewer
          src={url}
          type={fileType}
          filename={filename}
          contentType={contentType}
        />
      </div>
    );
  }

  const { code } = fileData! as { isMedia: false; code: string };
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
          <CodeBlockActions />
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
