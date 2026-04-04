export type SupportedLanguage =
  | "javascript"
  | "js"
  | "jsx"
  | "typescript"
  | "ts"
  | "tsx"
  | "python"
  | "py"
  | "html"
  | "xml"
  | "css"
  | "json"
  | "markdown"
  | "md";

export interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
}
