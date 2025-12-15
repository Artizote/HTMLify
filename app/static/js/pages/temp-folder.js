/* Temp Folder */


const file_upload_field = document.getElementById("file-upload-field");
const files_container = document.getElementById("files-container");
const progress_bar = document.getElementById("progress-bar");
var folder_name = ""
var folder_code = ""
var folder_auth_code = ""
var upload_queue = [];
var uploading = false;

function load_folder(code="") {
    if (!code) {
        let url = window.location.href;
        if (url.endsWith("/")) {
            url = url.slice(0, -1);
        }
        folder_code = lastPart = url.substring(url.lastIndexOf("/") + 1);
    } else {
        folder_code = code;
    }

    publicApi.tmpfolder.get(folder_code)
        .then(data => {
            if (!data.success) {
                if (code) showToast("No Temp Folder found with this code");
                return;
            }
            let tmpfolder = data.tmpfolder;
            folder_name = tmpfolder.name;
            folder_auth_code = tmpfolder["auth_code"] ? tmpfolder["auth_code"] : "";
            document.getElementById("folder-section").innerHTML = `
            <h3>${folder_name} <code onclick="copyToClipboard('${folder_code}');">[${folder_code}]</code></h3>
            <input id="url-field" value="${tmpfolder.url}" onclick="copyToClipboard('${tmpfolder.url}')" readonly>
            <img id="qr-code-img" src="${publicApi.qr.get_url(tmpfolder.url)}">
            `;
            if (folder_auth_code != "")
                document.getElementById("upload-section").style.display = "block";
            render_folder_files();
        });
}

function create_temp_folder(name="") {
    if (name == "")
        name = prompt("Give a name for folder");
    publicApi.tmpfolder.create(name)
        .then(data => {
            if (!data.success) {
                showToast("[ERROR]: " + data.error.message, "error");
            }
            let tmpfolder = data.tmpfolder
            folder_name = tmpfolder.name;
            folder_code = tmpfolder.code;
            folder_auth_code = tmpfolder["auth_code"];
            document.getElementById("folder-section").innerHTML = `
                <h3>${folder_name} <code onclick="copyToClipboard('${folder_code}');">[${folder_code}]</code></h3>
                <input id="url-field" value="${tmpfolder.url}" onclick="copyToClipboard('${tmpfolder.url}')" readonly>
                <img id="qr-code-img" src="${publicApi.qr.get_url(tmpfolder.url)}">
                `;
            document.getElementById("upload-section").style.display = "block";
        });
}

function open_temp_folder() {
    let code = prompt("Enter folder code");
    folder_code = code;
    load_folder(code);
}

function render_folder_files() {
    if (!folder_code) {
        files_container.innerHTML = "<em>No files uploaded yet</em>";
        return;
    }
    publicApi.tmpfolder.get(folder_code)
        .then(data => {
            if (!data.success) return;
            let tmpfolder = data.tmpfolder;
            files_container.innerHTML = "";
            for (let i=0; i<tmpfolder.files.length; i++) {
                let f = tmpfolder.files[i];
                files_container.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:6px; border:1px solid #ddd; border-radius:6px; margin-bottom:6px;">
                <span><code>[${f.code}]</code> <b>${f.name}</b></span>
                <a class="download-file-link" href="/tmp/${f.code}" download>Download</a>
                ${folder_auth_code ? `<button class="remove-file-button" onclick="remove_file_from_folder('${f.code}')">Remove</button>` : `` }
                </div>
                `;
            }
        });
}

function process_upload_queue() {
    if (uploading) return;
    if (upload_queue.length == 0) return;
    if (folder_auth_code == "") {
        showToast("You are not allowed to do modification in this temp folder", "error");
        upload_queue = [];
        uploading = false;
        return;
    }
    let file = upload_queue.shift();
    uploading = true;
    add_file_in_temp_folder(file)
        .catch(() => {})
        .finally(() => {
            uploading = false;
            process_upload_queue();
        });
}

function add_file_in_temp_folder(file) {
    return new Promise((resolve, reject) => {
        const form_data = new FormData();
        form_data.append("file", file);
        form_data.append("name", file.name);

        const request = new XMLHttpRequest();
        request.open("POST", publicApi._base + "/tmp");

        request.upload.addEventListener("progress", (e) => {
            if (!e.lengthComputable) return;

            const percent = Math.round((e.loaded / e.total) * 100);
            progress_bar.value = percent;
            document.getElementById("current-upload-name").innerText = file.name;
            document.getElementById("current-upload-percent").innerText = percent;
        });

        request.onload = () => {
            if (request.status !== 200) {
                showToast("Upload failed", "error");
                reject();
                return;
            }

            // After upload add in temp folder
            fetch(publicApi._base + "/tmpfile", {
                method: "POST",
                body: form_data
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.success) {
                        showToast(data.message, "error");
                        reject();
                        return;
                    }

                    const file_code = data.tmpfile.code;

                    return publicApi.tmpfolder.add(
                        folder_code,
                        file_code,
                        folder_auth_code
                    );
                })
                .then(data => {
                    if (!data.success) {
                        showToast(data.message, "error");
                        reject();
                        return;
                    }

                    showToast("File uploaded", "success");
                    render_folder_files();
                    resolve();
                })
                .catch(() => {
                    showToast("Upload error", "error");
                    reject();
                });
        };

        request.onerror = () => {
            showToast("Network error", "error");
            reject();
        };

        request.send(form_data);
    });
}

function remove_file_from_folder(code) {
    if (folder_auth_code == "") {
        showToast("You are not allowed to to modification in this temp folder", "error");
        return;
    }
    publicApi.tmpfolder.remove(folder_code, code, folder_auth_code).
        then(data => {
            if (!data.success) {
                showToast("[ERROR]: "+ data.error.message, "error");
                return;
            }
            render_folder_files();
        });
}

function upload_files() {
    document.getElementById("progress-container").style.display = "block";
    for (let i=0; i<file_upload_field.files.length; i++) {
        upload_queue.push(file_upload_field.files[i]);
    }
    process_upload_queue();
}
