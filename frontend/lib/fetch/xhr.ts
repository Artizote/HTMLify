import { executeClientRefresh } from "@/lib/fetch/api";

type UploadResult = { status: number; responseText: string } | null;

type ProgressCallback = (percent: number) => void;

/**
 * Sends a single request with XMLHttpRequest, reporting upload progress.
 */
function sendOnce(
  method: string,
  url: string,
  body: XMLHttpRequestBodyInit | null,
  onProgress?: ProgressCallback,
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.withCredentials = true;

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () =>
      resolve({ status: xhr.status, responseText: xhr.responseText });
    xhr.onerror = () => resolve(null);

    xhr.send(body);
  });
}

/**
 * Uploads a body and, if the session has expired (401), refreshes the session cookie once and replays the request.
 * This keeps long uploads from failing when the access token expires mid-flight.
 */
async function uploadWithProgress(
  method: string,
  url: string,
  body: XMLHttpRequestBodyInit | null,
  onProgress?: ProgressCallback,
): Promise<UploadResult> {
  let result = await sendOnce(method, url, body, onProgress);

  if (result && result.status === 401 && (await executeClientRefresh())) {
    result = await sendOnce(method, url, body, onProgress);
  }

  return result;
}

export { uploadWithProgress };
export type { UploadResult };
