"use client";

import {
  Editor,
  type OnChange as OnMonacoChange,
  type OnMount,
} from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import type { CodeEditorProps } from "@/lib/modules/playgournd/editor.types";
import { LANGUAGE_GROUPS } from "@/lib/modules/playgournd/editor.utils";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface RawCodeEditorProps
  extends CodeEditorProps, Omit<React.HTMLProps<HTMLDivElement>, "onChange"> {
  diff?: boolean;
  originalCode?: string;
  path?: string;
  onLanguageDetected?: (language: string) => void;
}

export const RawCodeEditor = ({
  code,
  onChange,
  language,
  showSuggestion,
  fontSize,
  tabSize,
  insertSpaces,
  showLineNumbers,
  autoIndent,
  path,
  onLanguageDetected,
  ...props
}: RawCodeEditorProps) => {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "vs-dark";
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const detectedRef = useRef(false);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    const model = editor.getModel();
    if (model) {
      model.updateOptions({
        tabSize: tabSize || 2,
        insertSpaces: !!insertSpaces,
      });
      // Monaco auto-detects language from the path. If no language was explicitly
      // provided, read the detected language from the model.
      if (!language && !detectedRef.current) {
        detectedRef.current = true;
        onLanguageDetected?.(model.getLanguageId());
      }
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.updateOptions({
      autoIndent: autoIndent ? "full" : "none",
    });

    const model = editor.getModel();
    if (model) {
      editor.setModel(null);
      editor.setModel(model);

      model.updateOptions({
        tabSize: tabSize || 2,
        insertSpaces: !!insertSpaces,
      });
    }
    editor.focus();
  }, [autoIndent, tabSize, insertSpaces]);

  return (
    <Editor
      className={props.className}
      theme={theme}
      height="100%"
      value={code}
      path={path}
      onChange={onChange as OnMonacoChange}
      onMount={handleMount}
      options={{
        quickSuggestions: !!showSuggestion,
        suggestOnTriggerCharacters: !!showSuggestion,
        autoIndent: autoIndent ? "full" : "none",
        minimap: { enabled: false },
        "semanticHighlighting.enabled": true,
        fontSize: fontSize || 14,
        detectIndentation: false,

        scrollBeyondLastLine: false,
        wordWrap: "on",
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        formatOnPaste: true,
        lineNumbers:
          showLineNumbers === undefined ? "on" : showLineNumbers ? "on" : "off",
      }}
      language={language}
    />
  );
};

export interface EditorHeaderProps {
  path?: string;
  onLanguageChange: (language: string) => void;
  currentLanguage?: string;
}

export function EditorHeader({
  path,
  onLanguageChange,
  currentLanguage,
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-foreground/5 border-b border-border/50  shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono min-w-0">
          {path?.split("/").map((segment, i, arr) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <span className="text-border shrink-0">/</span>}
              <span
                className={
                  i === arr.length - 1
                    ? "text-foreground/80 font-medium truncate"
                    : "truncate"
                }
              >
                {segment}
              </span>
            </span>
          ))}
        </div>
      </div>

      <LangugesMenu
        onChange={onLanguageChange}
        defaultValue={currentLanguage}
      />
    </div>
  );
}

export default function CodeEditor({
  code,
  language,
  onChange,
  diff,
  originalCode,
  path,
  ...rest
}: CodeEditorProps & {
  diff?: boolean;
  originalCode?: string;
  path?: string;
}) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(language);

  return (
    <div className="h-[70vh] rounded-sm border border-border/60 overflow-hidden shadow-sm flex flex-col min-w-0">
      <EditorHeader
        path={path}
        onLanguageChange={setCurrentLanguage}
        currentLanguage={currentLanguage}
      />

      <RawCodeEditor
        {...rest}
        code={code}
        onChange={onChange}
        diff={diff}
        originalCode={originalCode}
        path={path}
        language={currentLanguage}
        onLanguageDetected={setCurrentLanguage}
      />
    </div>
  );
}

const LangugesMenu = ({
  onChange,
  defaultValue,
}: {
  onChange: (language: string) => void;
  defaultValue?: string;
}) => {
  return (
    <Select onValueChange={(value) => onChange(value)} value={defaultValue}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGE_GROUPS.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};
