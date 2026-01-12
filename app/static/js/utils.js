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
 * Show Modern Toast Notification
 */
function showToast(message, type = "info", duration = 3500) {
    let container = document.getElementById("toast-container");

    // Create container if it doesn't exist
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    // Icon mapping
    const icons = {
        success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    // Auto remove
    setTimeout(() => {
        toast.classList.add("hide");
        toast.addEventListener("transitionend", () => {
            toast.remove();
        });
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

