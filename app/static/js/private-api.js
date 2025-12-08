/* Private API */


const privateApi = {
    _accessToken: null,
    _base: `${window.location.protocol}//api.${window.location.host.substring(3)}/private`,

    token: {
        async refresh() {
            let response = await fetch("/token");
            let data = await response.json();
            if (!data.token) {
                window.location.href = "/logout"
            }
            privateApi.accessToken = data.token;
        }
    },

    async fetch(endpoint, options = {}) {
        let url = privateApi._base + endpoint;
        let response;

        if (!privateApi.accessToken) {
            await privateApi.token.refresh();
        }

        if (!options.headers) options.headers = {};
        options.headers["Authorization"] = "Bearer " + privateApi.accessToken;

        response = await fetch(url, { ...options });

        if (response.status == 401) {
            await privateApi.token.refresh();

            options.headers["Authorization"] = "Bearer " + privateApi.accessToken;
            response = await fetch(url, { ...options });
        }

        return response;
    },

    async fetchJson(endpoint, options = {}) {
        let response = await privateApi.fetch(endpoint, options);
        let json = await response.json();
        return json;
    },

    file: {
        async exists(filePath) {
            let json = await privateApi.fetchJson("/file?path="+filePath);
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
            return await privateApi.fetchJson(`/file?${params.toString()}`);
        },

        async create(fields) {
            return await privateApi.fetchJson("/file", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
        },

        async delete(fileId=0, filePath="") {
            let params = new URLSearchParams();
            if (fileId) {
                params.append("id", fileId);
            } else {
                params.append("path", filePath);
            }
            return await privateApi.fetchJson(`/file?${params.toString()}`, {
                method: "DELETE"
            });
        },

        async update(fileId, fields) {
            return await privateApi.fetchJson("/file?id=" + fileId, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
        },
    },

    git: {
        async clone(fields) {
            return await privateApi.fetchJson("/git-clone", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
        }
    },

    revision: {
        async get(revisionId) {
            return await privateApi.fetchJson("/revision?id=" + revisionId);
        },

        async forFile(fileId) {
            return await privateApi.fetchJson("/revisions?id=" + fileId);
        }
    }
}
