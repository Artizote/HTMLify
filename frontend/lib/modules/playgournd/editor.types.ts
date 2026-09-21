import { PenResponse } from "@/lib/modules/pen/pen.schema";

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
  | "md"
  | "plain"
  | "go";

export interface CodeEditorProps {
  code: string;
  language: string;
  showSuggestion?: boolean;
  fontSize?: number;
  tabSize?: number;
  insertSpaces?: boolean;
  showLineNumbers?: boolean;
  autoIndent?: boolean;
  onChange: (code: string) => void;
}

export interface UserChoosenSettings {
  enableHtmlSuggestion: boolean;
  enableCssSuggestion: boolean;
  enableJsSuggestion: boolean;
  htmlFontSize: number;
  htmlTabSize: number;
  htmlInsertSpaces: boolean;
  htmlShowLineNumbers: boolean;
  htmlAutoIndent: boolean;
  cssFontSize: number;
  cssTabSize: number;
  cssInsertSpaces: boolean;
  cssShowLineNumbers: boolean;
  cssAutoIndent: boolean;
  jsFontSize: number;
  jsTabSize: number;
  jsInsertSpaces: boolean;
  jsShowLineNumbers: boolean;
  jsAutoIndent: boolean;
}

export interface EditorContextType {
  pen: PenResponse | null;
  setPen: (v: PenResponse) => void;
  html: string;
  setHtml: (v: string) => void;
  css: string;
  setCss: (v: string) => void;
  js: string;
  setJs: (v: string) => void;
  headContent: string;
  setHeadContent: (v: string) => void;
  bodyClasses: string;
  setBodyClasses: (v: string) => void;
  htmlLang: string;
  setHtmlLang: (v: string) => void;

  enableHtmlSuggestion: boolean;
  setEnableHtmlSuggestion: (v: boolean) => void;
  enableCssSuggestion: boolean;
  setEnableCssSuggestion: (v: boolean) => void;
  enableJsSuggestion: boolean;
  setEnableJsSuggestion: (v: boolean) => void;

  getLocalChoosenSettings: () => UserChoosenSettings;
  localSettingsKey: string;

  htmlFontSize: number;
  setHtmlFontSize: (v: number) => void;
  htmlTabSize: number;
  setHtmlTabSize: (v: number) => void;
  htmlInsertSpaces: boolean;
  setHtmlInsertSpaces: (v: boolean) => void;
  htmlShowLineNumbers: boolean;
  setHtmlShowLineNumbers: (v: boolean) => void;
  htmlAutoIndent: boolean;
  setHtmlAutoIndent: (v: boolean) => void;

  cssFontSize: number;
  setCssFontSize: (v: number) => void;
  cssTabSize: number;
  setCssTabSize: (v: number) => void;
  cssInsertSpaces: boolean;
  setCssInsertSpaces: (v: boolean) => void;
  cssShowLineNumbers: boolean;
  setCssShowLineNumbers: (v: boolean) => void;
  cssAutoIndent: boolean;
  setCssAutoIndent: (v: boolean) => void;

  jsFontSize: number;
  setJsFontSize: (v: number) => void;
  jsTabSize: number;
  setJsTabSize: (v: number) => void;
  jsInsertSpaces: boolean;
  setJsInsertSpaces: (v: boolean) => void;
  jsShowLineNumbers: boolean;
  setJsShowLineNumbers: (v: boolean) => void;
  jsAutoIndent: boolean;
  setJsAutoIndent: (v: boolean) => void;

  debouncedHtml: string;
  debouncedCss: string;
  debouncedJs: string;
  debouncedHead: string;
  debouncedBodyClasses: string;
}
