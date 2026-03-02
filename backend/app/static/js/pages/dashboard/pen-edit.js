
const title_field = document.getElementById("title-input");
const body_editor_toggle_button = document.getElementById("body-editor-toggle-button");
const css_editor_toggle_button = document.getElementById("css-editor-toggle-button");
const js_editor_toggle_button = document.getElementById("js-editor-toggle-button");
const output_toggle_button = document.getElementById("output-toggle-button");
const head_textarea = document.getElementById("head-editor");
const body_textarea = document.getElementById("body-editor");
const css_textarea = document.getElementById("css-editor");
const js_textarea = document.getElementById("js-editor");
const head_editor = CodeMirror.fromTextArea(head_textarea, { mode: "htmlmixed", indentUnit: 4 });
const body_editor = CodeMirror.fromTextArea(body_textarea, { mode: "htmlmixed", indentUnit: 4 });
const css_editor = CodeMirror.fromTextArea(css_textarea, { mode: "css", indentUnit: 4 });
const js_editor = CodeMirror.fromTextArea(js_textarea, { mode: "javascript", indentUnit: 4 });
const run_button = document.getElementById("run-button");
const output_container = document.getElementById("output-container");
const output_iframe = document.getElementById("output-iframe");
const settings_container = document.getElementById("settings-container");
const theme_selector = document.getElementById("theme-selector");
const linenos_toggle_button = document.getElementById("linenos-toggle-button");


var pen_id = window.pen_id; 
var show_body_editor = true;
var show_css_editor = true;
var show_js_editor = true;
var show_output = true;
var show_settings = false;
var show_linenos = true;
var last_update = 0;
var last_stroke = 0;
var content_changed = false;


function toggle_body_editor() {
    if (show_body_editor) { 
        body_editor.getWrapperElement().style.display = "none";
        body_editor.getWrapperElement().parentNode.style.display = "none";
        body_editor_toggle_button.classList.remove("btn-primary");
        show_body_editor = false;
    } else {
        body_editor.getWrapperElement().style.display = "";
        body_editor.getWrapperElement().parentNode.style.display = "";
        body_editor_toggle_button.classList.add("btn-primary");
        show_body_editor = true;
    }
}

function toggle_css_editor() {
    if (show_css_editor) { 
        css_editor.getWrapperElement().style.display = "none";
        css_editor.getWrapperElement().parentNode.style.display = "none";
        css_editor_toggle_button.classList.remove("btn-primary");
        show_css_editor = false;
    } else {
        css_editor.getWrapperElement().style.display = "";
        css_editor.getWrapperElement().parentNode.style.display = "";
        css_editor_toggle_button.classList.add("btn-primary");
        show_css_editor = true;
    }
}

function toggle_js_editor() {
    if (show_js_editor) { 
        js_editor.getWrapperElement().style.display = "none";
        js_editor.getWrapperElement().parentNode.style.display = "none";
        js_editor_toggle_button.classList.remove("btn-primary");
        show_js_editor = false;
    } else {
        js_editor.getWrapperElement().style.display = "";
        js_editor.getWrapperElement().parentNode.style.display = "";
        js_editor_toggle_button.classList.add("btn-primary");
        show_js_editor = true;
    }
}

function toggle_output() {
    if (show_output) {
        output_container.style.display = "none";
        output_toggle_button.classList.remove("btn-primary");
        show_output = false;
    } else {
        output_container.style.display = "";
        output_toggle_button.classList.add("btn-primary");
        show_output = true;
    }
}

function toggle_settings() {
    if (show_settings) {
        settings_container.style.display = "none";
        show_settings = false;
    } else {
        settings_container.style.display = "";
        head_editor.refresh();
        show_settings = true;
    }
}

function toggle_editor_linenos() {
    let linenos = !show_linenos;
    if (linenos) {
        linenos_toggle_button.classList.add("btn-primary");
    } else {
        linenos_toggle_button.classList.remove("btn-primary");
    }
    head_editor.setOption("lineNumbers", linenos);
    body_editor.setOption("lineNumbers", linenos);
    css_editor.setOption("lineNumbers", linenos);
    js_editor.setOption("lineNumbers", linenos);
    localStorage.setItem("pen-editor-linenos", linenos);
    show_linenos = linenos;
}

function update_editor_theme(theme=undefined) {
    if (theme === undefined)
        theme = theme_selector.value;
    load_codemirror_theme(theme)
        .then(() => {
        head_editor.setOption("theme", theme);
        body_editor.setOption("theme", theme);
        css_editor.setOption("theme", theme);
        js_editor.setOption("theme", theme);
        localStorage.setItem("pen-editor-theme", theme);
    });
}

function update_content_changed() {
    last_stroke = Date.now();
    content_changed = true;
}

function auto_update_output() {
    if (
        Date.now() > last_update + 5000 &&
        Date.now() > last_stroke + 1000 &&
        content_changed
    ) {
        update_output();
    }
}

function update_output() {
    run_button.innerText = "Updating...";
    let html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Untited Pen</title>
        ${ head_editor.getValue() }
        <style>
            ${ css_editor.getValue() }
        </style>
    </head>
    <body>
        ${ body_editor.getValue() }
        <script>
            ${ js_editor.getValue() }
        </script>
    </body>
</html>`;
    let data = {
        name: "pen.html",
        content: text_to_base64(html)
    }
    publicApi.tmpfile.create(data)
        .then(res => {
            if (res.success) {
                output_iframe.src = res.tmpfile.url;
                last_update = Date.now();
                content_changed = false;
                run_button.innerText = "Run";
            }
        });
}

function save() {
    let data = {
        id: pen_id,
        title: title_field.value,
        head_content: text_to_base64(head_editor.getValue()),
        body_content: text_to_base64(body_editor.getValue()),
        css_content: text_to_base64(css_editor.getValue()),
        js_content: text_to_base64(js_editor.getValue()),
    };
    if (pen_id === "") {
        privateApi.pen.create(data)
            .then(res => {
                if (res.success) {
                    showToast("Pen saved", "success");
                    pen_id = res.pen.id;
                } else {
                    showToast("[Error]: " + res.error.message, "error");
                }
            });
    } else {
        privateApi.pen.update(data)
            .then(res => {
                if (res.success) {
                    showToast("Pen saved", "success");
                } else {
                    showToast("[Error]: " + res.error.message, "error");
                }
            });
    }
}

async function view() {
    let res = await privateApi.pen.get(pen_id);
    if (res.success) {
        window.open(res.pen.url, "_blank");
    } else {
        showToast("Pen is not saved yet", "warn");
    }
}

// Event Triggers

head_editor.on("change", update_content_changed);
body_editor.on("change", update_content_changed);
css_editor.on("change", update_content_changed);
// no js editor onchange trigger for UX
head_editor.on("focus", update_content_changed);
body_editor.on("focus", update_content_changed);
css_editor.on("focus", update_content_changed);
js_editor.on("focus", update_content_changed);

setInterval(auto_update_output, 1000);

window.addEventListener("load", async () => {
    // editor linenos
    let linenos = localStorage.getItem("pen-editor-linenos") == "true"; 
    if (linenos === show_linenos) toggle_editor_linenos();
    toggle_editor_linenos();

    // editor theme
    let theme = localStorage.getItem("pen-editor-theme");
    if (theme) {
        await load_codemirror_theme(theme);
        update_editor_theme(theme);
    }
    for (let theme_name of CODE_MIRROR_THEMES) {
        let option = document.createElement("option");
        option.innerText = theme_name;
        option.value = theme_name;
        if (theme == theme_name)
            option.selected = true;
        theme_selector.appendChild(option);
    }


    if (window.innerWidth < 768) {
        toggle_css_editor();
        toggle_js_editor();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth < 768) {
        toggle_css_editor();
        toggle_js_editor();
    }
});
