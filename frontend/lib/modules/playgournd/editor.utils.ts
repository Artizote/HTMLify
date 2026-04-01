import { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";

import type { SupportedLanguage } from "@/lib/modules/playgournd/editor.types";

const languageExtensionMap: Record<SupportedLanguage, Extension> = {
  javascript: javascript({ jsx: true }),
  js: javascript({ jsx: true }),
  jsx: javascript({ jsx: true }),
  typescript: javascript({ typescript: true, jsx: true }),
  ts: javascript({ typescript: true, jsx: true }),
  tsx: javascript({ typescript: true, jsx: true }),
  python: python(),
  py: python(),
  html: html(),
  xml: html(),
  css: css(),
  json: json(),
  markdown: markdown(),
  md: markdown(),
};

export function getLanguageExtension(language: string): Extension {
  return languageExtensionMap[language.toLowerCase() as SupportedLanguage] ?? javascript();
}

export function getLanguageByPath(path: string): SupportedLanguage {
  const ext = path.toLowerCase().split(".").pop();

  switch (ext) {
    case "js":
      return "js";
    case "jsx":
      return "jsx";
    case "ts":
      return "ts";
    case "tsx":
      return "tsx";
    case "py":
      return "py";
    case "html":
      return "html";
    case "xml":
      return "xml";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "md";
    case "markdown":
      return "markdown";
    default:
      return "javascript";
  }
}
