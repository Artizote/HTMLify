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
    languages: [
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "cpp", label: "C++" },
      { value: "c", label: "C" },
      { value: "csharp", label: "C#" },
      { value: "go", label: "Go" },
      { value: "rust", label: "Rust" },
      { value: "ruby", label: "Ruby" },
      { value: "php", label: "PHP" },
      { value: "swift", label: "Swift" },
      { value: "kotlin", label: "Kotlin" },
      { value: "scala", label: "Scala" },
      { value: "r", label: "R" },
    ],
  },
  {
    label: "Shell & Config",
    languages: [
      { value: "shell", label: "Shell / Bash" },
      { value: "powershell", label: "PowerShell" },
      { value: "yaml", label: "YAML" },
      { value: "toml", label: "TOML" },
      { value: "json", label: "JSON" },
      { value: "xml", label: "XML" },
      { value: "dockerfile", label: "Dockerfile" },
    ],
  },
  {
    label: "Database",
    languages: [
      { value: "sql", label: "SQL" },
      { value: "postgresql", label: "PostgreSQL" },
      { value: "mysql", label: "MySQL" },
    ],
  },
  {
    label: "Other",
    languages: [
      { value: "markdown", label: "Markdown" },
      { value: "latex", label: "LaTeX" },
      { value: "graphql", label: "GraphQL" },
      { value: "plain", label: "Plain Text" },
    ],
  },
] as const;

export { LANGUAGE_GROUPS };
