"use client";

import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";

import type { CodeEditorProps } from "@/lib/modules/playgournd/editor.types";
import { getLanguageExtension } from "@/lib/modules/playgournd/editor.utils";

const editorTheme = EditorView.theme({
  "&": { height: "100%" },
  ".cm-scroller": { overflow: "auto" },
});

export default function CodeEditor({
  code,
  language,
  onChange,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Re-create editor when language changes
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          getLanguageExtension(language),
          oneDark,
          editorTheme,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const current = view.state.doc.toString();
    if (current !== code) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: code },
      });
    }
  }, [code]);

  return <div ref={containerRef} className="w-full h-full min-h-[65vh]" />;
}
