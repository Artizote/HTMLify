/* File Edit JS */

const path_field = document.getElementById("path");
const title_field = document.getElementById("title");
const password_field = document.getElementById("password");
const password_toggle_button = document.getElementById("password-toggle-button");
const mode_selector = document.getElementById("mode");
const visibility_selector = document.getElementById("visibility");
const as_guest_check = document.getElementById("as-guest");
const ext_field = document.getElementById("ext");
const editor_container = document.getElementById("editor-container");
const editor = document.getElementById("editor");

const hex_regex = /^[0-9A-Fa-f \n]*$/;
const binary_regex = /^[01 \n]*$/;


var file_id = window.file_id;
var file_type = window.file_type;
var file_path = window.file_path;
var editor_mode = "text";
var content;
var content_loaded = false;


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
    if (editor_mode === "text") {
        content = text_to_base64(editor.value);
    }
    if (editor_mode === "hex") {
        content = hex_to_base64(editor.value);
    }
    if (editor_mode === "binary") {
        content = binary_to_base64(editor.value);
    }
}

function load_content() {
    if (editor_mode === "text") {
        editor.value = base64_to_text(content);
        content_loaded = true;
    }
    if (editor_mode === "hex") {
        editor.value = base64_to_hex(content);
        content_loaded = true;
    }
    if (editor_mode === "binary") {
        editor.value = base64_to_binary(content);
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
    console.log("switching mode to text");
    if (file_type !== "text") {
        editor_container.style.display = "none";
        return;
    }
    dump_content();
    editor.style.borderColor = "gray";
    editor_mode = "text";
    load_content();
}

function switch_to_hex_editor() {
    console.log("switching mode to hex");
    editor_container.style.display = "block";
    dump_content();
    editor.style.borderColor = "gray";
    editor_mode = "hex";
    load_content();
}

function switch_to_binary_editor() {
    console.log("switching mode to binary");
    editor_container.style.display = "block";
    dump_content();
    editor.style.borderColor = "gray";
    editor_mode = "binary";
    load_content();
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
    console.log("data:", data);
    
    if (as_guest_check && as_guest_check.chekced) {
        data.path = "file" + ext_field.value;
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
            showToast("File updated", "success");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetch_content().then(() => {
        if (file_type === "text") {
            switch_to_text_editor();
        }
    });
});

editor.addEventListener("input", () => {
    if (editor_mode === "text") {
        return;
    }
    if (editor_mode === "hex") {
        if (hex_regex.test(editor.value)) {
            editor.style.borderColor = "#4CAF50";
        } else {
            editor.style.borderColor = "red";
        }
    }
    if (editor_mode === "binary") {
        if (binary_regex.test(editor.value)) {
            editor.style.borderColor = "#4CAF50";
        } else {
            editor.style.borderColor = "red";
        }
    }
});
