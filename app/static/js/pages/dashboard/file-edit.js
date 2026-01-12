/* File Edit JS */

const path_field = document.getElementById("path");
const title_field = document.getElementById("title");
const password_field = document.getElementById("password");
const mode_selector = document.getElementById("mode");
const visibility_selector = document.getElementById("visibility");
const as_guest_check = document.getElementById("as-guest");
const as_guest_warning = document.getElementById("as-guest-warning");
const ext_field_container = document.getElementById("ext-field-container");
const ext_field = document.getElementById("ext");
const theme_selector = document.getElementById("theme-selector");
const font_size_selector = document.getElementById("font-size-selector");
const editor_container = document.getElementById("editor-container");

const hex_regex = /^[0-9A-Fa-f \n]*$/;
const binary_regex = /^[01 \n]*$/;

var file_id = window.file_id;
var file_type = window.file_type;
var file_path = window.file_path;
var editing_mode = "text";
var content_loaded = false;
var content = "";
var editor;

// Convertors

function base64_to_binary(base64) {
    if (!base64) return "";
    try {
        base64 = base64.replace(/\s+/g, "");
        let bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        let groups = [...bytes].map(b => b.toString(2).padStart(8, "0"));
        let formatted = "";
        for (let i = 0; i < groups.length; i++) {
            formatted += groups[i];
            if ((i + 1) % 6 === 0) formatted += "\n";
            else formatted += " ";
        }
        return formatted.trim();
    } catch (e) {
        return "";
    }
}

function binary_to_base64(binaryStr) {
    let clean = binaryStr.replace(/\s+/g, "");
    while (clean.length % 8 !== 0) clean += "0";
    let bytes = [];
    for (let i = 0; i < clean.length; i += 8) {
        bytes.push(parseInt(clean.slice(i, i + 8), 2));
    }
    return btoa(String.fromCharCode(...bytes));
}

function base64_to_hex(base64) {
    if (!base64) return "";
    try {
        base64 = base64.replace(/\s+/g, "");
        let bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        let hexGroups = [];
        for (let i = 0; i < bytes.length; i += 2) {
            let h1 = bytes[i].toString(16).padStart(2, "0");
            let h2 = (i + 1 < bytes.length) ? bytes[i + 1].toString(16).padStart(2, "0") : "";
            hexGroups.push(h1 + h2);
        }
        let formatted = "";
        for (let i = 0; i < hexGroups.length; i++) {
            formatted += hexGroups[i];
            if ((i + 1) % 6 === 0) formatted += "\n";
            else formatted += " ";
        }
        return formatted.trim();
    } catch (e) {
        return "";
    }
}

function hex_to_base64(hexStr) {
    let clean = hexStr.replace(/\s+/g, "");
    while (clean.length % 2 !== 0) clean += "0";
    let bytes = [];
    for (let i = 0; i < clean.length; i += 2) {
        bytes.push(parseInt(clean.slice(i, i + 2), 16));
    }
    return btoa(String.fromCharCode(...bytes));
}

function base64_to_text(base64) {
    if (!base64) return "";
    try {
        base64 = base64.replace(/\s+/g, "");
        let binary = atob(base64);
        let bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    } catch (e) {
        console.error("Base64 to text failed", e);
        return "";
    }
}

function text_to_base64(text) {
    try {
        let encoder = new TextEncoder();
        let bytes = encoder.encode(text);
        let binary = "";
        for (let b of bytes) binary += String.fromCharCode(b);
        return btoa(binary);
    } catch (e) {
        return "";
    }
}

function dump_content() {
    if (!content_loaded || !editor) return;
    if (editing_mode === "text") content = text_to_base64(editor.getValue());
    else if (editing_mode === "hex") content = hex_to_base64(editor.getValue());
    else if (editing_mode === "binary") content = binary_to_base64(editor.getValue());
}

function load_content() {
    if (!editor) return;
    if (editing_mode === "text") editor.setValue(base64_to_text(content));
    else if (editing_mode === "hex") editor.setValue(base64_to_hex(content));
    else if (editing_mode === "binary") editor.setValue(base64_to_binary(content));
    content_loaded = true;
}

async function fetch_content() {
    if (file_id === 0 && !path_field.value) return;
    try {
        let res = await privateApi.file.get(file_id, path_field.value, true);
        if (res.success) {
            content = res.file.content || "";
            // If file_id was 0 but we found a file by path, update file_id
            if (file_id === 0) file_id = res.file.id;
        }
    } catch (e) {
        console.error("Fetch content failed", e);
    }
}

function switch_to_text_editor() {
    if (file_id !== 0 && file_type === "binary") {
        editor_container.style.display = "none";
        return;
    }
    editor_container.style.display = "block";
    dump_content();
    editing_mode = "text";
    load_content();
}

function switch_to_hex_editor() {
    editor_container.style.display = "block";
    dump_content();
    editing_mode = "hex";
    load_content();
}

function switch_to_binary_editor() {
    editor_container.style.display = "block";
    dump_content();
    editing_mode = "binary";
    load_content();
}

function update_editor_mode() {
    if (!editor || editing_mode !== "text") return;
    let info = CodeMirror.findModeByFileName(path_field.value);
    if (!info) return;
    load_codemirror_mode(info.mode).then(() => {
        editor.setOption("mode", info.mode);
    });
}

function update_editor_theme() {
    if (!editor) return;
    let theme = theme_selector.value;
    load_codemirror_theme(theme).then(() => {
        editor.setOption("theme", theme);
        localStorage.setItem("file-editor-theme", theme);
    });
}

function update_editor_font_size() {
    if (!editor) return;
    let fontSize = font_size_selector.value;
    editor.getWrapperElement().style.fontSize = fontSize + "px";
    editor.refresh();
    localStorage.setItem("file-editor-font-size", fontSize);
}

function toggle_editor_linenos() {
    if (!editor) return;
    let current = editor.getOption("lineNumbers");
    editor.setOption("lineNumbers", !current);
    localStorage.setItem("file-editor-line-numbers", !current);
}

function toggle_editor_indent_with_tabs() {
    if (!editor) return;
    let current = editor.getOption("indentWithTabs");
    editor.setOption("indentWithTabs", !current);
    localStorage.setItem("file-editor-indent-with-tabs", !current);
}

async function init_editor() {
    let theme = localStorage.getItem("file-editor-theme") || "default";
    let fontSize = localStorage.getItem("file-editor-font-size") || "14";
    let lineNumbers = localStorage.getItem("file-editor-line-numbers") !== "false";
    let indentWithTabs = localStorage.getItem("file-editor-indent-with-tabs") === "true";

    if (theme !== "default") await load_codemirror_theme(theme);

    // Populate theme selector
    if (theme_selector) {
        CODE_MIRROR_THEMES.forEach(t => {
            let opt = document.createElement("option");
            opt.value = t; opt.innerText = t;
            if (t === theme) opt.selected = true;
            theme_selector.appendChild(opt);
        });
    }

    // Populate font size selector
    if (font_size_selector) {
        [12, 14, 16, 18, 20, 24].forEach(s => {
            let opt = document.createElement("option");
            opt.value = s; opt.innerText = s + "px";
            if (s.toString() === fontSize) opt.selected = true;
            font_size_selector.appendChild(opt);
        });
    }

    editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        lineNumbers: lineNumbers,
        indentWithTabs: indentWithTabs,
        theme: theme,
        tabSize: 4,
        indentUnit: 4,
        mode: "text"
    });

    editor.getWrapperElement().style.fontSize = fontSize + "px";
    editor.refresh();
}

async function save() {
    dump_content();
    let data = {
        path: path_field.value,
        title: title_field.value,
        password: password_field.value,
        mode: mode_selector.value,
        visibility: visibility_selector.value,
        content: content,
        overwrite: false
    };

    if (as_guest_check && as_guest_check.checked) {
        data.path = "file." + ext_field.value;
        data["as_guest"] = true;
    }

    if (file_id === 0) {
        let res = await privateApi.file.create(data);
        if (res.success) {
            showToast("File created successfully", "success");
            file_id = res.file.id;
            file_path = res.file.path;
            if (!res.file.user) window.location.replace(res.file.url);
        } else if (res.error.code === 3002) {
            if (confirm("File already exists. Overwrite?")) {
                data.overwrite = true;
                let res2 = await privateApi.file.create(data);
                if (res2.success) {
                    showToast("File overwritten", "success");
                    file_id = res2.file.id;
                    file_path = res2.file.path;
                } else showToast("Error: " + res2.error.message, "error");
            }
        } else showToast("Error: " + res.error.message, "error");
    } else {
        if (data.path === file_path) delete data.path;
        let res = await privateApi.file.update(file_id, data);
        if (res.success) {
            showToast("File updated successfully", "success");
            file_path = res.file.path;
        } else if (res.error.code === 3002) {
            if (confirm("Another file exists at this path. Overwrite?")) {
                data.overwrite = true;
                let res2 = await privateApi.file.update(file_id, data);
                if (res2.success) {
                    showToast("File updated", "success");
                    file_path = res2.file.path;
                } else showToast("Error: " + res2.error.message, "error");
            }
        } else showToast("Error: " + res.error.message, "error");
    }
}

async function view() {
    if (file_id === 0) {
        showToast("Save file first", "warn");
        return;
    }
    let res = await privateApi.file.get(file_id);
    if (res.success) window.open(res.file.url, "_blank");
}

// Global listeners
if (as_guest_check) {
    as_guest_check.addEventListener("change", () => {
        const display = as_guest_check.checked ? "block" : "none";
        if (ext_field_container) ext_field_container.style.display = display;
        if (as_guest_warning) as_guest_warning.style.display = display;
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await fetch_content();
    await init_editor();
    if (file_id === 0 || file_type !== "binary") {
        switch_to_text_editor();
        update_editor_mode();
    } else {
        switch_to_hex_editor();
    }
});
