type LanguageGroup =
  "Web" | "Backend" | "Config & Markup" | "DevOps" | "Shell" | "Other";

const extToLanguage: Record<
  string,
  { id: string; group: LanguageGroup; label: string }
> = {
  go: { id: "go", group: "Backend", label: "Go" },
  js: { id: "javascript", group: "Web", label: "JavaScript" },
  jsx: { id: "jsx", group: "Web", label: "JSX" },
  mjs: { id: "javascript", group: "Web", label: "JavaScript" },
  cjs: { id: "javascript", group: "Web", label: "JavaScript" },
  ts: { id: "typescript", group: "Web", label: "TypeScript" },
  tsx: { id: "tsx", group: "Web", label: "TSX" },
  mts: { id: "typescript", group: "Web", label: "TypeScript" },
  cts: { id: "typescript", group: "Web", label: "TypeScript" },
  py: { id: "python", group: "Backend", label: "Python" },
  pyw: { id: "python", group: "Backend", label: "Python" },
  html: { id: "html", group: "Web", label: "HTML" },
  htm: { id: "html", group: "Web", label: "HTML" },
  xml: { id: "xml", group: "Config & Markup", label: "XML" },
  svg: { id: "xml", group: "Config & Markup", label: "XML" },
  css: { id: "css", group: "Web", label: "CSS" },
  json: { id: "json", group: "Config & Markup", label: "JSON" },
  md: { id: "markdown", group: "Config & Markup", label: "Markdown" },
  markdown: { id: "markdown", group: "Config & Markup", label: "Markdown" },
  mdown: { id: "markdown", group: "Config & Markup", label: "Markdown" },
  yaml: { id: "yaml", group: "DevOps", label: "YAML" },
  yml: { id: "yaml", group: "DevOps", label: "YAML" },
  sh: { id: "shell", group: "Shell", label: "Shell" },
  bash: { id: "shell", group: "Shell", label: "Shell" },
  zsh: { id: "shell", group: "Shell", label: "Shell" },
  sql: { id: "sql", group: "Backend", label: "SQL" },
  rust: { id: "rust", group: "Backend", label: "Rust" },
  rs: { id: "rust", group: "Backend", label: "Rust" },
  java: { id: "java", group: "Backend", label: "Java" },
  cpp: { id: "cpp", group: "Backend", label: "C++" },
  c: { id: "c", group: "Backend", label: "C" },
  csharp: { id: "csharp", group: "Backend", label: "C#" },
  cs: { id: "csharp", group: "Backend", label: "C#" },
  php: { id: "php", group: "Backend", label: "PHP" },
  swift: { id: "swift", group: "Backend", label: "Swift" },
  kt: { id: "kotlin", group: "Backend", label: "Kotlin" },
  kts: { id: "kotlin", group: "Backend", label: "Kotlin" },
  dart: { id: "dart", group: "Backend", label: "Dart" },
  perl: { id: "perl", group: "Backend", label: "Perl" },
  pl: { id: "perl", group: "Backend", label: "Perl" },
  scala: { id: "scala", group: "Backend", label: "Scala" },
  rb: { id: "ruby", group: "Backend", label: "Ruby" },
  ruby: { id: "ruby", group: "Backend", label: "Ruby" },
  r: { id: "r", group: "Other", label: "R" },
  lua: { id: "lua", group: "Other", label: "Lua" },
  dockerfile: { id: "dockerfile", group: "DevOps", label: "Dockerfile" },
  graphql: { id: "graphql", group: "Config & Markup", label: "GraphQL" },
  gql: { id: "graphql", group: "Config & Markup", label: "GraphQL" },
  toml: { id: "toml", group: "DevOps", label: "TOML" },
  ini: { id: "ini", group: "DevOps", label: "INI" },
  cfg: { id: "ini", group: "DevOps", label: "INI" },
  conf: { id: "ini", group: "DevOps", label: "INI" },
  powershell: { id: "powershell", group: "DevOps", label: "PowerShell" },
  ps1: { id: "powershell", group: "DevOps", label: "PowerShell" },
};

export function getLanguageByPath(path: string): string {
  const ext = path.toLowerCase().split(".").pop();
  return (ext && extToLanguage[ext]?.id) ?? "plain";
}

const byGroup = new Map<string, { value: string; label: string }[]>();
for (const { id, group, label } of Object.values(extToLanguage)) {
  if (!byGroup.has(group)) byGroup.set(group, []);
  const langs = byGroup.get(group)!;
  if (!langs.some((e) => e.value === id)) langs.push({ value: id, label });
}
const LANGUAGE_GROUPS = [...byGroup.entries()].map(([label, languages]) => ({
  label,
  languages,
}));

export { LANGUAGE_GROUPS };
