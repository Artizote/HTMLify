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
            if (notify) showToast("Copied to clipboard");
        } catch (err) {
            if (notify) showToast("Failed to copy automaticly, please copy manualy:\n\n" + text);
        }
        document.body.removeChild(textarea);
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            if (notify) showToast("Copied to clipboard");
        })
        .catch(err => {
            if (notify) showToast("Failed to copy automaticly, please copy manualy:\n\n" + text);
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

/*
 * load Script
 */
function loadScript(url) {
    return new Promise((resolve, reject) => {
        // resolve if already loaded
        if (document.querySelector(`script[src="${url}"]`)) {
            resolve();
            return;
        }

        const s = document.createElement("script");
        s.src = url;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${url}`));

        document.head.appendChild(s);
    });
}

/*
 * load CSS
 */
function loadCSS(url) {
    return new Promise((resolve, reject) => {
        // resolve if already loaded
        if (document.querySelector(`link[href="${url}"]`)) {
            resolve();
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;

        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));

        document.head.appendChild(link);
    });
}

/*
 * encode text to base64
 */
function text_to_base64(text) {
    let encoder = new TextEncoder();
    let bytes = encoder.encode(text);

    let binary = "";
    for (let b of bytes) binary += String.fromCharCode(b);

    return btoa(binary);
}
