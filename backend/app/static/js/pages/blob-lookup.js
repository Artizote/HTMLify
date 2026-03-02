
const hashInputField = document.getElementById("hash-input");
const resultContainer = document.getElementById("result-container");

async function lookup() {
    let hexdec = "0123456789abcdef"
    let hash = hashInputField.value.toLowerCase();
    resultContainer.innerHTML = "";
    if (!hash.length) {
        showToast("Enter Blob hash to lookup", "error");
        return;
    }
    if (hash.length != 64) {
        showToast("Hash is Invalid", "error");
        return;
    }
    for (let i=0; i<64; i++) {
        if (!hexdec.includes(hash[i])) {
            showToast("Hash is Invalid", "error");
            return;
        }
    }
    let data = await publicApi.blob.get(hash, false);
    if (!data.success) {
        showToast("Blob with this hash does not exist", "info")
        return;
    }
    showToast("Blob found", "success");
    let blobInfo = data.blob;
    showBlobInfo(blobInfo);
}

function showBlobInfo(blobInfo) {
    resultContainer.innerHTML = "";
    let downloadButton = document.createElement("a");
    downloadButton.classList.add("btn");
    downloadButton.classList.add("btn-primary");
    downloadButton.setAttribute("download", blobInfo.hash);
    downloadButton.href = "/blob/" + blobInfo.hash;
    downloadButton.innerText = `Download Blob,  ${blobInfo.size} Bytes`;
    resultContainer.appendChild(downloadButton);
}

