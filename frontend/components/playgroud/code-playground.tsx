"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CodeTerminal } from "@/components/code-share/code-terminal";
import { useState } from "react";
import CodeEditor from "@/components/playgroud/code-editor";

interface CodeSidebarProps {
  code: string;
  language: string;
  children?: React.ReactNode;
  openEditor?: boolean;
}

function Header({
  isHTML,
  editorOpen,
  setIsEditorOpen,
}: {
  isHTML: boolean;
  editorOpen: boolean;
  setIsEditorOpen: (value: boolean) => void;
}) {
  return (
    <DrawerHeader className="px-0 pb-0">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant={!editorOpen ? "default" : "outline"}
            onClick={() => setIsEditorOpen(false)}
          >
            {isHTML ? "Preview" : "Terminal"}
          </Button>
          <Button
            variant={editorOpen ? "default" : "outline"}
            onClick={() => setIsEditorOpen(true)}
          >
            Edit
          </Button>
        </div>
        <DrawerClose asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Close
          </Button>
        </DrawerClose>
      </div>
      <DrawerDescription className="sr-only">
        View HTML preview
      </DrawerDescription>
    </DrawerHeader>
  );
}

export function CodePlayground({
  code,
  language,
  children,
  openEditor = false,
}: CodeSidebarProps) {
  const isHtml = language === "html" || language === "xml";
  console.log("isHtml", isHtml);
  const [isEditorOpen, setIsEditorOpen] = useState(openEditor);

  return (
    <Drawer>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent className="flex flex-col h-full mx-4 border border-primary">
        <Header
          isHTML={isHtml}
          editorOpen={isEditorOpen}
          setIsEditorOpen={setIsEditorOpen}
        />
        {!isEditorOpen ? (
          isHtml ? (
            <iframe
              srcDoc={code}
              className="w-full h-full  border-0 bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="HTML Preview"
            />
          ) : (
            <CodeTerminal />
          )
        ) : (
          <CodeEditor code={code} language={language} onChange={() => {}} />
        )}
      </DrawerContent>
    </Drawer>
  );
}
