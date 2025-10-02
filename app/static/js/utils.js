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
