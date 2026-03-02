

// Modes

const CODEMIRROR_MODE_DEPS = {
    // HTML related

    htmlmixed: ["xml", "javascript", "css"],
    htmlembedded: ["htmlmixed"],
    jsx: ["javascript", "xml"],
    vue: ["htmlmixed", "javascript", "css", "xml"],
    php: ["xml", "javascript", "css", "htmlmixed"],

    // Templates Engines

    handlebars: ["xml", "javascript", "css"],
    mustache: ["xml", "javascript", "css"],
    twig: ["xml", "javascript", "css"],
    django: ["xml", "javascript", "css"],
    jinja2: ["xml", "javascript", "css"],
    soy: ["xml"],
    freemarker: ["xml"],
    velocity: ["xml"],

    // Mrakdows

    markdown: ["xml"],
    gfm: ["markdown", "xml", "javascript", "css"],
    rst: ["python"],
    textile: ["markdown"],

    // XML related

    svg: ["xml"],
    webidl: ["xml"],
    xquery: ["xml"],
    html: ["xml"],

    // JS related

    json: ["javascript"],
    jsonld: ["javascript"],
    typescript: ["javascript"],
    livescript: ["javascript"],

    // CSS related

    scss: ["css"],
    sass: ["css"],
    stylus: ["css"],

    // SQL reltaed

    mssql: ["sql"],
    mysql: ["sql"],
    maria: ["sql"],
    plsql: ["sql"],

    // C related
    c: ["clike"],
    cpp: ["clike"],
    csharp: ["clike"],
    java: ["clike"],
    kotlin: ["clike"],
    scala: ["clike"],
    objectivec: ["clike"],
    dart: ["clike"],

    // Others

    nginx: ["shell"],
    dockerfile: ["shell"],
    "yaml-frontmatter": ["yaml", "markdown"],
    cypher: ["python"],
    haml: ["ruby"],
    slim: ["ruby"],
    php_laravel_blade: ["xml", "javascript", "css", "htmlmixed"],
    "haskell-literate": ["haskell"],
    solr: ["xml"],
    sparql: ["turtle"],
    mbox: ["markdown"],
    docker: ["shell"],
    cython: ["python"],
    yamlFrontmatter: ["yaml", "markdown"],
};

const CODEMIRROR_MODE_REQUIRE_ADDONS = {
    markdown: ["overlay.js"],
    gfm: ["overlay.js"],
    django: ["overlay.js"],
    jinja2: ["overlay.js"],
    handlebars: ["overlay.js"],
    twig: ["overlay.js"],
    mustache: ["overlay.js"],
}

async function load_codemirror_mode(mode) {
    if (!mode || mode === "null") return;
    const deps = CODEMIRROR_MODE_DEPS[mode] || [];
    for (const dep of deps) {
        await load_codemirror_mode(dep);
    }
    await loadScript(`/static/vendor/codemirror/mode/${mode}/${mode}.js`);
    const addons = CODEMIRROR_MODE_REQUIRE_ADDONS[mode] || [];
    for (const addon of addons) {
        await loadScript(`/static/vendor/codemirror/addon/mode/${addon}`);
    }
}


// Themes

const CODE_MIRROR_THEMES = [
    "3024-day",
    "3024-night",
    "abbott",
    "abcdef",
    "ambiance",
    "ambiance-mobile",
    "ayu-dark",
    "ayu-mirage",
    "base16-dark",
    "base16-light",
    "bespin",
    "blackboard",
    "cobalt",
    "colorforth",
    "darcula",
    "dracula",
    "duotone-dark",
    "duotone-light",
    "eclipse",
    "elegant",
    "erlang-dark",
    "gruvbox-dark",
    "hopscotch",
    "icecoder",
    "idea",
    "isotope",
    "juejin",
    "lesser-dark",
    "liquibyte",
    "lucario",
    "material",
    "material-darker",
    "material-ocean",
    "material-palenight",
    "mbo",
    "mdn-like",
    "midnight",
    "monokai",
    "moxer",
    "neat",
    "neo",
    "night",
    "nord",
    "oceanic-next",
    "panda-syntax",
    "paraiso-dark",
    "paraiso-light",
    "pastel-on-dark",
    "railscasts",
    "rubyblue",
    "seti",
    "shadowfox",
    "solarized",
    "ssms",
    "the-matrix",
    "tomorrow-night-bright",
    "tomorrow-night-eighties",
    "ttcn",
    "twilight",
    "vibrant-ink",
    "xq-dark",
    "xq-light",
    "yeti",
    "yonce",
    "zenburn",
]

async function load_codemirror_theme(theme) {
    if (!theme) return;
    await loadCSS(`/static/vendor/codemirror/theme/${theme}.css`);
}

