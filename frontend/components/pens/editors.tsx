"use client";

import { Eye, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ElementType, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { CSS, HTML, JavaScript } from "@/components/icons";
import { EditorSettingsDrawer } from "@/components/pens/editor-settings";
import { RawCodeEditor } from "@/components/playgroud/code-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { EditorProvider, useEditor } from "@/hooks/use-editor";
import { useIsMobile } from "@/hooks/use-mobile";
import { createPen, updatePen } from "@/lib/modules/pen/pen.api";
import { PenResponse } from "@/lib/modules/pen/pen.schema";
import { formatHtmlContent } from "@/lib/modules/pen/pen.utils";
import { pathToPublicUrl } from "@/lib/utils";

const languages: Record<Language, { label: string; Icon: ElementType }> = {
  html: { label: "HTML", Icon: HTML },
  css: { label: "CSS", Icon: CSS },
  javascript: { label: "JavaScript", Icon: JavaScript },
};

type Language = "html" | "css" | "javascript";

const EditorWithHeader = ({
  language,
  hideHeader = false,
}: {
  language: Language;
  hideHeader?: boolean;
}) => {
  const { Icon, label } = languages[language];
  const {
    html,
    setHtml,
    css,
    setCss,
    js,
    setJs,
    enableHtmlSuggestion,
    enableCssSuggestion,
    enableJsSuggestion,
    htmlFontSize,
    htmlTabSize,
    htmlInsertSpaces,
    htmlShowLineNumbers,
    htmlAutoIndent,

    cssFontSize,
    cssTabSize,
    cssInsertSpaces,
    cssShowLineNumbers,
    cssAutoIndent,

    jsFontSize,
    jsTabSize,
    jsInsertSpaces,
    jsShowLineNumbers,
    jsAutoIndent,
  } = useEditor();

  const codeMap = { html, css, javascript: js };
  const setterMap = { html: setHtml, css: setCss, javascript: setJs };

  const settingsMap = {
    html: {
      showSuggestion: enableHtmlSuggestion,
      fontSize: htmlFontSize,
      tabSize: htmlTabSize,
      insertSpaces: htmlInsertSpaces,
      showLineNumbers: htmlShowLineNumbers,
      autoIndent: htmlAutoIndent,
    },
    css: {
      showSuggestion: enableCssSuggestion,
      fontSize: cssFontSize,
      tabSize: cssTabSize,
      insertSpaces: cssInsertSpaces,
      showLineNumbers: cssShowLineNumbers,
      autoIndent: cssAutoIndent,
    },
    javascript: {
      showSuggestion: enableJsSuggestion,
      fontSize: jsFontSize,
      tabSize: jsTabSize,
      insertSpaces: jsInsertSpaces,
      showLineNumbers: jsShowLineNumbers,
      autoIndent: jsAutoIndent,
    },
  };

  const currentSettings = settingsMap[language];

  return (
    <div className="h-full flex flex-col">
      {!hideHeader && (
        <header className="flex items-center justify-between border-b border-border bg-background/80 px-3 py-1 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">{label}</span>
          </div>
          <EditorSettingsDrawer activeLanguage={language} />
        </header>
      )}
      <div className="flex-1 overflow-hidden">
        <RawCodeEditor
          showSuggestion={currentSettings.showSuggestion}
          fontSize={currentSettings.fontSize}
          tabSize={currentSettings.tabSize}
          insertSpaces={currentSettings.insertSpaces}
          className="h-full"
          language={language}
          onChange={setterMap[language]}
          code={codeMap[language]}
          showLineNumbers={currentSettings.showLineNumbers}
          autoIndent={currentSettings.autoIndent}
        />
      </div>
    </div>
  );
};

const EditorTags = ({
  active,
  onTabChange,
}: {
  active: Language;
  onTabChange: (lang: Language) => void;
}) => {
  return (
    <div
      className="flex items-center justify-between border-b 
    border-border bg-background/50 backdrop-blur-md px-2 py-1.5"
    >
      <div className="flex items-center gap-1 flex-1">
        {Object.entries(languages).map(([lang, { label, Icon }]) => (
          <button
            key={lang}
            onClick={() => onTabChange(lang as Language)}
            className={`flex flex-1 cursor-pointer items-center justify-center
               gap-2 rounded-md px-3 py-1.5 transition-all duration-200 ${
                 lang === active
                   ? "bg-secondary text-foreground shadow-sm ring-1 ring-border/50"
                   : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
               }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {label}
            </span>
          </button>
        ))}
      </div>
      <div className="pl-2 ml-2 border-l border-border/50">
        <EditorSettingsDrawer activeLanguage={active} />
      </div>
    </div>
  );
};

const DesktopEditors = () => (
  <ResizablePanelGroup orientation="horizontal">
    <ResizablePanel defaultSize={50} minSize={60}>
      <EditorWithHeader language="html" />
    </ResizablePanel>
    <ResizableHandle withHandle className="bg-border/50" />
    <ResizablePanel defaultSize={50}>
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize={50} minSize={50}>
          <EditorWithHeader language="css" />
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-border/50" />
        <ResizablePanel defaultSize={50} minSize={50}>
          <EditorWithHeader language="javascript" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
);

const MobileEditors = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: Language;
  setActiveTab: (lang: Language) => void;
}) => {
  const renderEditor = (lang: Language) => {
    switch (lang) {
      case "html":
        return <EditorWithHeader language="html" hideHeader />;
      case "css":
        return <EditorWithHeader language="css" hideHeader />;
      case "javascript":
        return <EditorWithHeader language="javascript" hideHeader />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <EditorTags active={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 min-h-0 relative">{renderEditor(activeTab)}</div>
    </div>
  );
};

const PenEditorContent = () => {
  const {
    html,
    css,
    js,
    headContent,
    debouncedHtml,
    debouncedCss,
    debouncedJs,
    debouncedHead,
    debouncedBodyClasses,
    htmlLang,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<Language>("html");
  const isMobile = useIsMobile();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    iframeRef.current.srcdoc = formatHtmlContent(html, headContent, css, js);
  }, [html, headContent, css, js]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <ResizablePanelGroup
        orientation="vertical"
        className="rounded-lg border border-border"
      >
        <ResizablePanel defaultSize={70} className="flex flex-col min-h-0">
          {isMobile ? (
            <MobileEditors activeTab={activeTab} setActiveTab={setActiveTab} />
          ) : (
            <DesktopEditors />
          )}
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border/50" />

        <ResizablePanel defaultSize={30} maxSize={"60%"} minSize={50}>
          <iframe
            srcDoc={`
                <html lang="${htmlLang}">
                  <head>
                    ${debouncedHead}
                    <style>${debouncedCss}</style>
                  </head>
                  <body class="${debouncedBodyClasses}">
                    ${debouncedHtml}
                    <script>${debouncedJs}</script>
                  </body>
                </html>
              `}
            className="w-full h-full bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

const TitleInput = ({
  title,
  setTitle,
}: {
  title: string;
  setTitle: (title: string) => void;
}) => (
  <Input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Enter Pen Title"
    className="min-w-32 md:w-96"
  />
);

const PenForm = ({ onNew }: { onNew: () => void }) => {
  const { setPen, pen, html, css, js, headContent } = useEditor();
  const [title, setTitle] = useState(pen?.title || "");
  const router = useRouter();

  const handleUpdate = async (id: string) => {
    if (!id) {
      toast.error("Something went wrong! No pen id found");
      return;
    }
    const { data, error } = await updatePen({
      id: id,
      title,
      head_content: headContent,
      body_content: html,
      css_content: css,
      js_content: js,
    });
    if (error || !data) {
      toast.error(error || "Failed to update pen");
      return;
    }
    toast.success("Pen updated successfully");
  };

  const handleSubmit = async () => {
    const { data, error } = await createPen(title);
    if (error || !data) {
      toast.error(error || "Failed to create pen");
      return;
    }
    setPen(data);
    await handleUpdate(data.id);
    toast.success("Pen created successfully");
  };

  if (pen?.id) {
    return (
      <div className="pb-1 w-full flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          Pen ID:
          <span className="font-medium text-muted-foreground">{pen.id}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TitleInput title={title} setTitle={setTitle} />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdate(pen.id)}
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Update
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onNew();
              router.push("/dashboard/pens/edit");
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={pathToPublicUrl(`/pen/${pen.id}`)} target="_blank">
              <Eye className="w-3.5 h-3.5" />
              View
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-1 w-full flex items-center justify-end gap-2">
      <TitleInput title={title} setTitle={setTitle} />
      <Button onClick={handleSubmit} size="sm">
        Save
      </Button>
    </div>
  );
};

export const PenEditor = ({ data }: { data: PenResponse | null }) => {
  const [resetKey, setResetKey] = useState(0);

  return (
    <EditorProvider key={`${data?.id ?? "new"}-${resetKey}`} penData={data}>
      <DasshboardNavbar>
        <PenForm onNew={() => setResetKey((prev) => prev + 1)} />
      </DasshboardNavbar>
      <PenEditorContent />
    </EditorProvider>
  );
};
