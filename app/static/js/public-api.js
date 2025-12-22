/* Public API */


function getGetApiRoot() {
    if (location.host.startsWith("my.")) {
        return `${location.protocol}//api.${location.host.substring(3)}`;
    } else {
        return `${location.protocol}//api.${location.host}`;
    }
}


const publicApi = {
    _base: getGetApiRoot(),

    async fetch(endpoint, options = {}) {
        let url = publicApi._base + endpoint;
        let response;
        if (!options.headers) options.headers = {};
        response = await fetch(url, { ...options });
        return response;
    },

    async fetchJson(endpoint, options = {}) {
        let response = await publicApi.fetch(endpoint, options);
        let json = await response.json();
        return json;
    },

    blob: {
        async exists(hash) {
            let params = new URLSearchParams();
            params.append("hash", hash);
            params.append("show_content", false);
            let json = await publicApi.fetchJson(`/blob?${params.toString()}`);
            return json.success;
        },

        async get(hash, showContent=true) {
            let params = new URLSearchParams();
            params.append("hash", hash);
            params.append("show_content", showContent);
            return await publicApi.fetchJson(`/blob?${params.toString()}`);
        }
    },

    comment: {
        async get(id) {
            return await publicApi.fetchJson("/comment?id="+id);
        }
    },

    file: {
        async exists(filePath) {
            let json = await publicApi.fetchJson("/file?path="+filePath);
            return json.success;
        },

        async get(fileId=0, filePath="", showContent=false) {
            let params = new URLSearchParams();
            if (fileId) {
                params.append("id", fileId);
            } else {
                params.append("path", filePath);
            }
            params.append("show_content", showContent);
            return await publicApi.fetchJson(`/file?${params.toString()}`);
        }
    },

    shortlink: {
        async get(id) {
            return await publicApi.fetchJson("/shortlink?id=" + id)
        },

        async create(url) {
            return await publicApi.fetchJson("/shortlink?url=" + url);
        }
    },

    tmpfile: {
        async exists(code) {
            let res = await publicApi.fetchJson("/tmpfile?code=" + code);
            return res.success;
        },

        async get(code, showContent = false) {
            let param = new URLSearchParams();
            params.append("code", code);
            params.append("show_content", showContent);
            return await publicApi.fetchJson(`/tmpfile?code=${params.toString()}`);
        },

        async create(fields) {
            return await publicApi.fetchJson("/tmpfile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
        }
    },

    tmpfolder: {
        async get(code) {
            return await publicApi.fetchJson("/tmpfolder?code=" + code);
        },

        async create(name) {
            return await publicApi.fetchJson("/tmpfolder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({name: name})
            });
        },

        async add(code, fileCode, authCode) {
            return await publicApi.fetchJson("/tmpfolder", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: code,
                    file_code: fileCode,
                    auth_code: authCode
                })
            });
        },

        async remove(code, fileCode, authCode) {
            return await publicApi.fetchJson("/tmpfolder", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: code,
                    file_code: fileCode,
                    auth_code: authCode
                })
            });
        }
    },

    qr: {
        get_url(url) {
            return `${publicApi._base}/qr?url=`+url;
        }
    },
}
