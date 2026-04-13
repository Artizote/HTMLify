import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { Extension } from "@codemirror/state";

import type { SupportedLanguage } from "@/lib/modules/playgournd/editor.types";

const plainText: Extension = [];

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
  plain: plainText,
};

export function getLanguageExtension(language: string): Extension {
  return (
    languageExtensionMap[language.toLowerCase() as SupportedLanguage] ??
    javascript()
  );
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
      return "plain";
  }
}
const LANGUAGE_GROUPS = [
  {
    label: "Web",
    languages: [
      { value: "html", label: "HTML" },
      { value: "css", label: "CSS" },
      { value: "javascript", label: "JavaScript" },
      { value: "typescript", label: "TypeScript" },
      { value: "jsx", label: "JSX" },
      { value: "tsx", label: "TSX" },
    ],
  },
  {
    label: "Backend",
    languages: [{ value: "python", label: "Python" }],
  },
  {
    label: "Config & Markup",
    languages: [
      { value: "json", label: "JSON" },
      { value: "xml", label: "XML" },
      { value: "markdown", label: "Markdown" },
    ],
  },
  {
    label: "Other",
    languages: [{ value: "text", label: "Plain Text" }],
  },
] as const;

export { LANGUAGE_GROUPS };
