async function upload() {
    let files = document.getElementById("file-upload-field").files;
    let dir = document.getElementById("upload-dir").value;
    let overwrite = document.getElementById("overwrite").checked;
    let logs = document.getElementById("logs");

    if (!dir.endsWith("/")) {
        dir = dir + "/";
    }

    for (let i=0; i<files.length; i++) {
        let file = files[i];
        let reader = new FileReader();

        reader.onload = async () => {
            let dataURL = reader.result;
            let content = dataURL.split(",")[1];

            let res = await privateApi.file.create({
                path: dir + file.name,
                title: file.name,
                content: content,
                overwrite: overwrite,
            });

            let log = document.createElement("p");

            if (res.success) {
                log.innerText = `${file.name}: Uploaded`;
                log.style.color = "green";
            } else {
                log.innerText = `${file.name}: Faild to Upload [${res.error.message}]`;
                log.style.color = "red";
            }

            if (logs.firstChild) {
                logs.insertBefore(log, logs.firstChild);
            } else {
                logs.appendChild(log);
            }
            logs.insertBefore(document.getElementById("hr"), log);
        }

        reader.onerror = () => {
            let log = document.createElement("p");
            log.innerText = `${file.name}: Error reading the file`
            if (logs.firstChild) {
                logs.insertBefore(log, logs.firstChild);
            } else {
                logs.appendChild(log);
            }
            logs.insertBefore(document.getElementById("hr"), log);
        };

        reader.readAsDataURL(file);
    }
}
