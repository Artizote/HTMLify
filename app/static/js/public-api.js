/* Public API */


const publicApi = {
    _base: `${window.location.protocol}//api.${window.location.host}`,

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
            let json = await publicApi.fetchJson("/blob?hash=" + hash + "&show-content=false");
            return json.success;
        },

        async get(hash) {
            return await publicApi.fetchJson("/blob?hash=" + hash);
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
            if (showContent) {
                params.append("show-content", "true");
            }
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

    tpmfile: {
        async get(code) {
            return await publicApi.fetchJson("/tmpfile?code=" + code);
        }

        // TODO: create function, after API change
    },

    tmpfolder: {
        async get(code) {
            return await publicApi.fetchJson("/tmpfolder?code=" + code);
        }

        // TODO: create, add, delete function, after API change
    },

    qr: {
        get_url(url) {
            return `${publicApi._base}/qr?url=`+url;
        }
    },
}
