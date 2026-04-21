"use client";
import { MergeView } from "@codemirror/merge";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup, EditorView } from "codemirror";
import { useEffect, useRef, useState } from "react";

import type { CodeEditorProps } from "@/lib/modules/playgournd/editor.types";
import {
  getLanguageByPath,
  getLanguageExtension,
  LANGUAGE_GROUPS,
} from "@/lib/modules/playgournd/editor.utils";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const editorTheme = EditorView.theme({
  "&": { height: "100%" },
  ".cm-scroller": { overflow: "auto" },
});

export default function CodeEditor({
  code,
  language,
  onChange,
  diff,
  originalCode,
  path,
}: CodeEditorProps & {
  diff?: boolean;
  originalCode?: string;
  path?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const mergeViewRef = useRef<MergeView | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(
    language || getLanguageByPath(path || "") || "plain",
  );

  // Re-create editor when language or diff mode changes
  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      basicSetup,
      getLanguageExtension(currentLanguage),
      oneDark,
      editorTheme,
    ];

    if (diff) {
      const mergeView = new MergeView({
        parent: containerRef.current,
        a: {
          doc: originalCode ?? "",
          extensions,
        },
        b: {
          doc: code,
          extensions: [
            ...extensions,
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                onChange(update.state.doc.toString());
              }
            }),
          ],
        },
        revertControls: "b-to-a",
        highlightChanges: true,
        gutter: true,
      });
      mergeViewRef.current = mergeView;

      return () => {
        mergeView.destroy();
        mergeViewRef.current = null;
      };
    } else {
      const view = new EditorView({
        parent: containerRef.current,
        state: EditorState.create({
          doc: code,
          extensions: [
            ...extensions,
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                onChange(update.state.doc.toString());
              }
            }),
          ],
        }),
      });
      viewRef.current = view;

      return () => {
        view.destroy();
        viewRef.current = null;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, diff]);

  // Sync code changes to the normal editor
  useEffect(() => {
    if (diff) return;
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== code) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: code },
      });
    }
  }, [code, diff]);

  // Sync code changes to the right panel of diff view
  useEffect(() => {
    if (!diff) return;
    const mergeView = mergeViewRef.current;
    if (!mergeView) return;
    const current = mergeView.b.state.doc.toString();
    if (current !== code) {
      mergeView.b.dispatch({
        changes: { from: 0, to: current.length, insert: code },
      });
    }
  }, [code, diff]);

  return (
    <div className="h-[70vh] my-4 rounded-xl border border-border/60 overflow-hidden shadow-sm flex flex-col min-w-0">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/60 border-b border-border/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5 mr-2 shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-400/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <span className="w-3 h-3 rounded-full bg-green-400/70" />
          </div>

          {/* Path breadcrumbs */}
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

        {/* Language badge */}
        <LangugesMenu onChange={setCurrentLanguage} />
      </div>

      <div className="flex-1 overflow-hidden">
        <div ref={containerRef} className="w-full h-full min-h-[65vh]" />
      </div>
    </div>
  );
}

const LangugesMenu = ({
  onChange,
}: {
  onChange: (language: string) => void;
}) => {
  return (
    <Select onValueChange={(value) => onChange(value)}>
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
