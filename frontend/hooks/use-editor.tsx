"use client";

import React, { createContext, useContext, useState } from "react";

import useDebounce from "@/hooks/use-debounce";
import { PenResponse } from "@/lib/modules/pen/pen.schema";
import {
  EditorContextType,
  UserChoosenSettings,
} from "@/lib/modules/playgournd/editor.types";

const localSettingsKey = "userSettings";

const defaultSettings: UserChoosenSettings = {
  enableHtmlSuggestion: true,
  enableCssSuggestion: true,
  enableJsSuggestion: true,
  htmlFontSize: 14,
  htmlTabSize: 2,
  htmlInsertSpaces: true,
  htmlShowLineNumbers: true,
  htmlAutoIndent: true,

  cssFontSize: 14,
  cssTabSize: 2,
  cssInsertSpaces: true,
  cssShowLineNumbers: true,
  cssAutoIndent: true,

  jsFontSize: 14,
  jsTabSize: 2,
  jsInsertSpaces: true,
  jsShowLineNumbers: true,
  jsAutoIndent: true,
};
const EditorContext = createContext<EditorContextType | null>(null);

function getLocalChoosenSettings() {
  if (typeof window === "undefined") {
    return defaultSettings;
  }
  const settings = localStorage.getItem(localSettingsKey);
  if (settings) {
    try {
      return JSON.parse(settings) as UserChoosenSettings;
    } catch {}
  }
  return defaultSettings;
}

export const EditorProvider = ({
  penData,
  children,
}: {
  penData: PenResponse | null;
  children: React.ReactNode;
}) => {
  const [title, setTitle] = useState(penData?.title || "pen");
  const [html, setHtml] = useState(penData?.body_content || "");
  const [css, setCss] = useState(penData?.css_content || "");
  const [js, setJs] = useState(penData?.js_content || "");
  const [headContent, setHeadContent] = useState(penData?.head_content || "");
  const [htmlLang, setHtmlLang] = useState("en");
  const [bodyClasses, setBodyClasses] = useState("");
  const [pen, setPen] = useState<PenResponse | null>(penData);

  const [settings, setSettings] = useState<UserChoosenSettings>(() =>
    getLocalChoosenSettings(),
  );

  const updateSetting = <K extends keyof UserChoosenSettings>(
    key: K,
    value: UserChoosenSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const setEnableHtmlSuggestion = (v: boolean) =>
    updateSetting("enableHtmlSuggestion", v);
  const setEnableCssSuggestion = (v: boolean) =>
    updateSetting("enableCssSuggestion", v);
  const setEnableJsSuggestion = (v: boolean) =>
    updateSetting("enableJsSuggestion", v);

  const setHtmlFontSize = (v: number) => updateSetting("htmlFontSize", v);
  const setHtmlTabSize = (v: number) => updateSetting("htmlTabSize", v);
  const setHtmlInsertSpaces = (v: boolean) =>
    updateSetting("htmlInsertSpaces", v);
  const setHtmlShowLineNumbers = (v: boolean) => {
    updateSetting("htmlShowLineNumbers", v);
  };
  const setHtmlAutoIndent = (v: boolean) => {
    updateSetting("htmlAutoIndent", v);
  };

  const setCssFontSize = (v: number) => updateSetting("cssFontSize", v);
  const setCssTabSize = (v: number) => updateSetting("cssTabSize", v);
  const setCssInsertSpaces = (v: boolean) =>
    updateSetting("cssInsertSpaces", v);
  const setCssShowLineNumbers = (v: boolean) => {
    updateSetting("cssShowLineNumbers", v);
  };
  const setCssAutoIndent = (v: boolean) => {
    updateSetting("cssAutoIndent", v);
  };

  const setJsFontSize = (v: number) => updateSetting("jsFontSize", v);
  const setJsTabSize = (v: number) => updateSetting("jsTabSize", v);
  const setJsInsertSpaces = (v: boolean) => updateSetting("jsInsertSpaces", v);
  const setJsShowLineNumbers = (v: boolean) => {
    updateSetting("jsShowLineNumbers", v);
  };
  const setJsAutoIndent = (v: boolean) => {
    updateSetting("jsAutoIndent", v);
  };

  const debouncedSettings = useDebounce(settings, 1000);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(localSettingsKey, JSON.stringify(debouncedSettings));
    }
  }, [debouncedSettings]);

  const {
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
  } = settings;

  const debouncedHtml = useDebounce(html, 500);
  const debouncedCss = useDebounce(css, 500);
  const debouncedJs = useDebounce(js, 800);
  const debouncedHead = useDebounce(headContent, 500);
  const debouncedBodyClasses = useDebounce(bodyClasses, 500);

  return (
    <EditorContext.Provider
      value={{
        pen,
        setPen,
        title,
        setTitle,
        html,
        setHtml,
        css,
        setCss,
        js,
        setJs,
        headContent,
        setHeadContent,
        bodyClasses,
        setBodyClasses,
        htmlLang,
        setHtmlLang,

        getLocalChoosenSettings,
        localSettingsKey,

        enableHtmlSuggestion,
        setEnableHtmlSuggestion,
        enableCssSuggestion,
        setEnableCssSuggestion,
        enableJsSuggestion,
        setEnableJsSuggestion,

        htmlFontSize,
        setHtmlFontSize,
        htmlTabSize,
        setHtmlTabSize,
        htmlInsertSpaces,
        setHtmlInsertSpaces,
        htmlShowLineNumbers,
        setHtmlShowLineNumbers,
        htmlAutoIndent,
        setHtmlAutoIndent,

        cssFontSize,
        setCssFontSize,
        cssTabSize,
        setCssTabSize,
        cssInsertSpaces,
        setCssInsertSpaces,
        cssShowLineNumbers,
        setCssShowLineNumbers,
        cssAutoIndent,
        setCssAutoIndent,

        jsFontSize,
        setJsFontSize,
        jsTabSize,
        setJsTabSize,
        jsInsertSpaces,
        setJsInsertSpaces,
        jsShowLineNumbers,
        setJsShowLineNumbers,
        jsAutoIndent,
        setJsAutoIndent,

        debouncedHtml,
        debouncedCss,
        debouncedJs,
        debouncedHead,
        debouncedBodyClasses,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within EditorProvider");
  return context;
};
