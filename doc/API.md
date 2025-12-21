# HTMLify API Documentation

HTMLify provides a RESTful API for programmatically hosting and managing web projects, code snippets, and temporary files.

**Base URL:** `https://api.htmlify.me/`

**API Key:** Obtain your key at [https://my.htmlify.me/api-key](https://my.htmlify.me/api-key)

---

## Authentication

Authenticate your requests by including your API key as a Bearer token in the `Authorization` header.

**Headers:**

```http
Authorization: Bearer <YOUR_API_KEY>
Content-Type: application/json

```

---

## File API

Endpoints for managing persistent files.

### 1. Create a File

Creates a new hosted file. Content must be Base64 encoded.

* **Endpoint:** `POST /file`
* **Payload (JSON):**
* `path` (string): **Required.** The full path for the file (e.g., `/username/project/index.html`).
* `content` (string): **Required.** Base64 encoded file content.
* `title` (string): Optional. The display title for the file.
* `visibility` (string): Optional. Set to `p` (public) or `o` (private).
* `mode` (string): Optional. Display mode, such as `s` (source), `p` (plain), or `r` (render).



### 2. Update a File

Modifies an existing file's content or metadata.

* **Endpoint:** `PATCH /file`
* **Query Parameters:**
* `id` (int): The unique ID of the file to update.


* **Payload (JSON):**
* `content` (string): Optional. New Base64 encoded content.
* `title` (string): Optional. New display title.
* `path` (string): Optional. New file path.
* `overwrite` (bool): Optional. If `true`, overwrites existing files at the new path.



### 3. Retrieve File Details

Gets metadata and optionally the content of a specific file.

* **Endpoint:** `GET /file`
* **Query Parameters:**
* `id` (int) OR `path` (string): Identifier for the file.
* `show-content` (bool): Optional. Set to `true` to include the file content in the response.



### 4. Delete a File

Permanently deletes a file.

* **Endpoint:** `DELETE /file`
* **Query Parameters:**
* `id` (int): The unique ID of the file to delete.



---

## Temporary File API

Endpoints for ephemeral files that expire over time.

### 1. Create Temporary File

* **Endpoint:** `POST /tmpfile`
* **Payload (JSON):**
* `content` (string): **Required.** Base64 encoded content.
* `name` (string): Optional. Name for the temporary file.
* `expiry` (int): Optional. Unix timestamp for when the file should expire.



### 2. Get Temporary File

* **Endpoint:** `GET /tmpfile`
* **Query Parameters:**
* `code` (string): The unique code of the temporary file.



---

## Other Utility Endpoints

* **Search:** `GET /search?q=<query>` – Search for public projects and snippets.
* **Embed:** `GET /embed?id=<id>` – Returns a rendered template for embedding a file.
* **ShortLink:** `GET /shortlink` – Generates or retrieves a shortened URL using `id`, `short`, or `url` parameters.
* **QR Code:** `GET /qr?text=<text>` – Generates a QR code image for the provided text or URL.

---

## Status Codes

The API uses internal status codes in responses to detail specific errors:

| Code | Meaning |
| --- | --- |
| **0** | OK / Success |
| **1** | Missing Parameters |
| **2** | Invalid Parameters |
| **3** | Unauthorised Operation |
| **4** | Invalid Request Method |
| **5** | API Rate Limit Exceeded |
| **6** | Requested Content Not Found |