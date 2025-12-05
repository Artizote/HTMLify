// Utils JS

/**
 * Copy text to clipboard
 */
function copyToClipboard(text, notify = true) {
    if (!navigator.clipboard) {
        // if clipboard API not available
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand("copy");
            if (notify) alert("Copied to clipboard");
        } catch (err) {
            if (notify) alert("Failed to copy automaticly, please copy manualy:\n\n" + text);
        }
        document.body.removeChild(textarea);
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            if (notify) alert("Copied to clipboard");
        })
        .catch(err => {
            if (notify) alert("Failed to copy automaticly, please copy manualy:\n\n" + text);
        });
}

/**
 * Show Toast Notification
 */
function showToast(message, type = "info", duration = 2500) {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

