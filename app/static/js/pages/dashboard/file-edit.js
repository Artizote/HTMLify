/* File Edit JS */

const path_field = document.getElementById("path");
const title_field = document.getElementById("title");
const password_field_container = document.getElementById("password-field-container");
const password_field = document.getElementById("password");
const password_toggle_button = document.getElementById("password-toggle-button");
const mode_selector = document.getElementById("mode");
const visibility_selector = document.getElementById("visibility");
const as_guest_check = document.getElementById("as-guest");
const as_guest_warning = document.getElementById("as-guest-warning");
const ext_field_container = document.getElementById("ext-field-container");
const ext_field = document.getElementById("ext");
const line_number_toggle_button = document.getElementById("line-number-toggle-button");
const indent_unit_selector = document.getElementById("indent-unit-selector");
const indent_with_tabs_toggle_button = document.getElementById("indent-with-tabs-toggle-button");
const tab_size_selector = document.getElementById("tab-size-selector");
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
var content;
var editor;

function password_field_toggle() { // hide/unhide whole pasword input container
    if (password_field_container.style.display == "none") {
        password_field_container.style.display = "flex";
    } else {
        password_field_container.style.display = "none";
    }
}

function toggle_password() {
    if (password_field.type == "text") {
        password_field.type = "password";
        password_toggle_button.innerText = "Show";
    } else {
        password_field.type = "text";
        password_toggle_button.innerText = "Hide";
    }
}

// Convertors

function base64_to_binary(base64) {
    base64 = base64.replace(/\s+/g, "");
    let bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    let groups = [...bytes].map(b =>
        b.toString(2).padStart(8, "0")
    );

    let formatted = "";
    for (let i = 0; i < groups.length; i++) {
        formatted += groups[i];
        if ((i + 1) % 6 === 0) formatted += "\n";
            else formatted += " ";
    }

    return formatted.trim();
}

function binary_to_base64(binaryStr) {
    let clean = binaryStr.replace(/\s+/g, "");

    while (clean.length % 8 !== 0) {
        clean = clean + "0";
    }

    // grouping
    let bytes = [];
    for (let i = 0; i < clean.length; i += 8) {
        bytes.push(parseInt(clean.slice(i, i + 8), 2));
    }

    return btoa(String.fromCharCode(...bytes));
}

function base64_to_hex(base64) {
    base64 = base64.replace(/\s+/g, "");
    let bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    let hexGroups = [];
    for (let i = 0; i < bytes.length; i += 2) {
        let h1 = bytes[i].toString(16).padStart(2, "0");
        let h2 = (i + 1 < bytes.length)
            ? bytes[i + 1].toString(16).padStart(2, "0")
            : "";
        hexGroups.push(h1 + h2);
    }

    // grouping
    let formatted = "";
    for (let i = 0; i < hexGroups.length; i++) {
        formatted += hexGroups[i];
        if ((i + 1) % 6 === 0) formatted += "\n";
        else formatted += " ";
    }

    return formatted.trim();
}

function hex_to_base64(hexStr) {
    let clean = hexStr.replace(/\s+/g, "");

    while (clean.length % 2 !== 0) {
        clean = clean + "0";
    }

    let bytes = [];
    for (let i = 0; i < clean.length; i += 2) {
        bytes.push(parseInt(clean.slice(i, i + 2), 16));
    }

    return btoa(String.fromCharCode(...bytes));
}

function base64_to_text(base64) {
    base64 = base64.replace(/\s+/g, "");

    let binary = atob(base64);

    let bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new TextDecoder().decode(bytes);
}

function text_to_base64(text) {
    let encoder = new TextEncoder();
    let bytes = encoder.encode(text);

    let binary = "";
    for (let b of bytes) binary += String.fromCharCode(b);

    return btoa(binary);
}

function dump_content() {
    if (!content_loaded) {
        return;
    }
    if (editing_mode === "text") {
        content = text_to_base64(editor.getValue());
    }
    if (editing_mode === "hex") {
        content = hex_to_base64(editor.getValue());
    }
    if (editing_mode === "binary") {
        content = binary_to_base64(editor.getValue());
    }
}

function load_content() {
    if (editing_mode === "text") {
        editor.setValue(base64_to_text(content));
        content_loaded = true;
    }
    if (editing_mode === "hex") {
        editor.setValue(base64_to_hex(content));
        content_loaded = true;
    }
    if (editing_mode === "binary") {
        editor.setValue(base64_to_binary(content));
        content_loaded = true;
    }
}

async function fetch_content() {
    let res = await privateApi.file.get(0, path_field.value, true)
    if (res.success) {
        content = res.file.content;
    }
}

function switch_to_text_editor() {
    if (file_type !== "text") {
        editor_container.style.display = "none";
        return;
    }
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
    if (editing_mode != "text") {
        editor.setOption("mode", "text");
        return;
    }
    let info = CodeMirror.findModeByFileName(path_field.value);
    if (!info) return;
    load_codemirror_mode(info.mode)
        .then(() => {
        editor.setOption("mode", info.mode);
    });
}

function update_editor_theme() {
    let theme = theme_selector.value;
    load_codemirror_theme(theme)
        .then(() => {
        editor.setOption("theme", theme);
        localStorage.setItem("file-editor-theme", theme);
    });
}

function toggle_editor_linenos() {
    if (editor.getOption("lineNumbers")) {
        editor.setOption("lineNumbers", false);
        localStorage.setItem("file-editor-line-numbers", false);
        line_number_toggle_button.innerText = "No Line Numbers";
    } else {
        editor.setOption("lineNumbers", true);
        localStorage.setItem("file-editor-line-numbers", true);
        line_number_toggle_button.innerText = "Line Numbers";
    }
}

function toggle_editor_indent_with_tabs() {
    if (editor.getOption("indentWithTabs")) {
        editor.setOption("indentWithTabs", false);
        localStorage.setItem("file-editor-indent-with-tabs", false);
        indent_with_tabs_toggle_button.innerText = "Spaces";
    } else {
        editor.setOption("indentWithTabs", true);
        localStorage.setItem("file-editor-indent-with-tabs", true);
        indent_with_tabs_toggle_button.innerText = "Tabs";
    }
}

function update_editor_tab_size() {
    let tab_size = parseInt(tab_size_selector.value);
    editor.setOption("tabSize", tab_size);
    localStorage.setItem("file-editor-tab-size", tab_size);
}

function update_editor_indent_unit() {
    let indent_unit = parseInt(indent_unit_selector.value);
    editor.setOption("indentUnit", indent_unit);
    localStorage.setItem("file-editor-indent-unit", indent_unit);
}

function update_editor_font_size() {
    let font_size = parseInt(font_size_selector.value);
    editor.getWrapperElement().style.fontSize = font_size + "px";
    editor.refresh();
    localStorage.setItem("file-editor-font-size", font_size);
}

async function init_editor() {
    let config = {};

    let theme = localStorage.getItem("file-editor-theme");
    if (theme) {
        await load_codemirror_theme(theme);
        config.theme = theme;
    }
    for (let theme_name of CODE_MIRROR_THEMES) {
        let option = document.createElement("option");
        option.innerText = theme_name;
        option.value = theme_name;
        if (theme == theme_name)
            option.selected = true;
        theme_selector.appendChild(option);
    }

    let lineNumbers = localStorage.getItem("file-editor-line-numbers") == "true";
    if (lineNumbers) {
        line_number_toggle_button.innerText = "Line Numbers";
    } else {
        line_number_toggle_button.innerText = "No Line Numbers";
    }
    config.lineNumbers = lineNumbers;

    let tabSize = parseInt(localStorage.getItem("file-editor-tab-size")) || 4;
    for (let i=1; i<10; i++) {
        let option = document.createElement("option");
        option.innerText = "Tab Size " + i;
        option.value = i;
        if (i == tabSize)
            option.selected = true;
        tab_size_selector.appendChild(option);
    }
    config.tabSize = tabSize;

    let indentUnit = parseInt(localStorage.getItem("file-editor-indent-unit")) || 4;
    for (let i=1; i<10; i++) {
        let option = document.createElement("option");
        option.innerText = "Indent " + i;
        option.value = i;
        if (i == indentUnit)
            option.selected = true;
        indent_unit_selector.appendChild(option);
    }
    config.indentUnit = indentUnit;

    let indentWithTabs = localStorage.getItem("file-editor-indent-with-tabs") == "true";
    if (indentWithTabs) {
        indent_with_tabs_toggle_button.innerText = "Tabs";
    } else {
        indent_with_tabs_toggle_button.innerText = "Spaces";
    }
    config.indentWithTabs = indentWithTabs;

    editor = CodeMirror.fromTextArea(document.getElementById("editor"), config);

    // post creation
    let fontSize = parseInt(localStorage.getItem("file-editor-font-size")) || 14;
    for (let i=2; i<26; i+=2) {
        let option = document.createElement("option");
        option.innerText = "Font size " + i;
        option.value = i;
        if (i == fontSize)
            option.selected = true;
        font_size_selector.appendChild(option);
    }
    fontSize = fontSize + "px";
    editor.getWrapperElement().style.fontSize = fontSize;
    editor.refresh();
    
}

async function save() {
    content_loaded = true;
    dump_content();

    let data = {
        path: path_field.value,
        title: title_field.value,
        password: password_field.value,
        mode: mode_selector.value,
        visibility: visibility_selector.value,
        content: content,
        overwrite: false
    }
    
    if (as_guest_check && as_guest_check.checked) {
        data.path = "file." + ext_field.value;
        data["as_guest"] = true;
    }

    let new_file = file_id == 0;

    if (new_file) {
        let res = await privateApi.file.create(data);
        if (!res.success) {
            if (res.error.code == 3002) {
                let overwrite = confirm("File on this filepath already exists, want to overwrite?");
                if (overwrite) {
                    data.overwrite = true;
                    privateApi.file.create(data)
                        .then(res => {
                            if (res.success) {
                                showToast("File Created", "success");
                                file_path = res.file.path;
                            } else {
                                showToast(`Error Creating file: [${res.error.message}]`, "error");
                            }
                        });
                }
            }
        } else {
            showToast("File created", "success");
            file_id = res.file.id;
            file_path = res.file.path;
            if (!res.file.user) {
                showToast("Redirecting to file..")
                window.location.replace(res.file.url);
            }
        }
    } else {
        if (data.path === file_path) {
            delete data.path;
        }
        let res = await privateApi.file.update(file_id, data);
        if (!res.success) {
            if (res.error.code == 3002) {
                let overwrite = confirm("File on this filepath already exists, want to overwrite?");
                if (overwrite) {
                    data.overwrite = true;
                    privateApi.file.update(file_id, data)
                        .then(res => {
                            if (res.success) {
                                showToast("File Updated", "success");
                                file_path = res.file.path;
                            } else {
                                showToast(`Error Updating file: [${res.error.message}]`, "error");
                            }
                        });
                }
            }
        } else {
            file_path = res.file.path;
            showToast("File updated", "success");
        }
    }
}

async function view() {
    let path = path_field.value;
    let file = await privateApi.file.get(0, path);
    if (file.success) {
        window.open(file.file.url, "_blank");
    } else {
        showToast("File not saved yet", "warn");
    }
}


// EventListeners

path_field.addEventListener("input", update_editor_mode);
if (ext_field)
    ext_field.addEventListener("input", update_editor_mode);

if (as_guest_check) {
    as_guest_check.addEventListener("change", () => {
        if (as_guest_check.checked) {
            ext_field_container.style.display = "flex";
            as_guest_warning.style.display = "inline";
        } else {
            ext_field_container.style.display = "none";
            as_guest_warning.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await fetch_content();
    await init_editor();
    if (file_type === "text") {
        switch_to_text_editor();
        update_editor_mode();
    }
});

