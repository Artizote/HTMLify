/* Temp Folder */


const file_upload_field = document.getElementById("file-upload-field");
const files_container = document.getElementById("files-container");
const progress_bar = document.getElementById("progress-bar");
var folder_name = ""
var folder_code = ""
var folder_auth_code = ""

function load_folder(code="") {
    if (!code) {
        console.log("folder code is not provided");
        let url = window.location.href;
        if (url.endsWith("/")) {
            url = url.slice(0, -1);
        }
        folder_code = lastPart = url.substring(url.lastIndexOf("/") + 1);
    } else {
        console.log("folder code is provided");
        folder_code = code;
    }
    
    fetch("/api/tmp-folder?code=" + folder_code)
    .then(r => r.json())
    .then(data => {
        if (Object.keys(data).length == 0) {
            if (code)
                alert("No Temp Folder found with this code");
            return;
        }
        folder_name = data.name;
        folder_auth_code = data["auth-code"] ? data["auth-code"] : "";
        document.getElementById("folder-section").innerHTML = `
            <h3>${folder_name} <code onclick="copyToClipboard('${folder_code}');">[${folder_code}]</code></h3>
            <input id="url-field" value="${data.url}" onclick="copyToClipboard('${data.url}')" readonly>
            <img id="qr-code-img" src="/api/qr?url=${data.url}">
            `;
        if (folder_auth_code != "")
            document.getElementById("upload-section").style.display = "block";
        render_folder_files();
    });
}

function create_temp_folder(name="") {
    if (name == "")
        name = prompt("Give a name for folder");
    let form_data = new FormData();
    form_data.append("name", name);
    fetch("/api/tmp-folder", {
        "method": "POST",
        body: form_data
    })
    .then(response => response.json())
    .then(data => {
        folder_name = name;
        folder_code = data["code"];
        folder_auth_code = data["auth-code"];
        document.getElementById("folder-section").innerHTML = `
            <h3>${folder_name} <code onclick="copyToClipboard('${folder_code}');">[${folder_code}]</code></h3>
            <input id="url-field" value="${data.url}" onclick="copyToClipboard('${data.url}')" readonly>
            <img id="qr-code-img" src="/api/qr?url=${data.url}">
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
    fetch("/api/tmp-folder?code=" + folder_code)
    .then(response => response.json())
    .then(data => {
        if (data.error) return;
        console.log("data:", data);
        files_container.innerHTML = "";
        for (let i=0; i<data.files.length; i++) {
            let f = data.files[i];

            files_container.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:6px; border:1px solid #ddd; border-radius:6px; margin-bottom:6px;">
                    <span><b>${f.name}</b> <small>[${f.code}]</small></span>
                    <a class="download-file-link" href="/tmp/${f.code}" download>Download</a>
                    ${folder_auth_code ? `<button class="remove-file-button" onclick="remove_file_from_folder('${f.code}')">Remove</button>` : `` }
                </div>
            `;
        }
    });
}

function add_file_in_temp_folder(file) {
    if (folder_auth_code === "") {
        alert("You are not allowed to do modification in this temp folder");
        return;
    }

    // creating temp file
    let form_data = new FormData();
    form_data.append("file", file);
    form_data.append("name", file.name);

    let request = new XMLHttpRequest();
    request.open("POST", "/api/tmp");

    request.upload.addEventListener("progress", function(e) {
        if (e.lengthComputable) {
            let progress_percent = (e.loaded / e.total) * 100;
            progress_bar.setAttribute("value", progress_percent);
            document.getElementById("current-upload-name").innerText = file.name;
            document.getElementById("current-upload-percent").innerText = progress_percent.toFixed(0);
        }
    });

    // adding file to temp folder after upload
    request.onload = function () {
        fetch("/api/tmp-file", {
            method: "POST",
            body: form_data
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.message);
                return;
            }

            let file_code = data.code;
            console.log("file data:", data);
            console.log("file_code:", file_code);

            let folder_form = new FormData();
            folder_form.append("code", folder_code);
            folder_form.append("auth-code", folder_auth_code);
            folder_form.append("file-code", file_code);

            fetch("/api/tmp-folder-add", {
                method: "POST",
                body: folder_form
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.message);
                    return;
                }
                render_folder_files();
            });
        });
    };

    request.send(form_data);
}


function remove_file_from_folder(code) {
    if (folder_auth_code == "") {
        alert("You are not allowed to to modification in this temp folder");
        return;
    }
    var form_data = new FormData();
    form_data.append("code", folder_code);
    form_data.append("auth-code", folder_auth_code);
    form_data.append("file-code", code);
    fetch("/api/tmp-folder-remove", {
        "method": "POST",
        body: form_data,
    })
    .then(()=>{render_folder_files()});
}

function upload_files() {
    document.getElementById("progress-container").style.display = "block";
    for (let i=0; i<file_upload_field.files.length; i++) {
        add_file_in_temp_folder(file_upload_field.files[i]);
    }
}
