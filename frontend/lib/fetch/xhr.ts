import { useTokenStore } from "@/lib/stores/token.store";
import { executeClientRefresh } from "./api";

type LoadHandler =
  ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null;

function xhrClient(method: string, url: string): XMLHttpRequest {
  const xhr = new XMLHttpRequest();

  let body: Document | XMLHttpRequestBodyInit | null | undefined = null;
  let retried = false;
  let refreshing = false;
  let userOnLoad: LoadHandler = null;

  const open = () => {
    xhr.open(method, url);
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${useTokenStore.getState().accessToken}`,
    );
  };

  open();

  // Registered before the caller's `onload`, so it runs first and can swallow
  // the intermediate 401 while a token refresh + retry happens.
  xhr.addEventListener("load", async (event) => {
    if (xhr.status === 401 && !retried) {
      retried = true;
      refreshing = true;

      const refreshed = await executeClientRefresh();
      if (refreshed) {
        open();
        xhr.send(body);
        return;
      }

      // Refresh failed → surface the 401 to the caller.
      refreshing = false;
      userOnLoad?.call(xhr, event);
      return;
    }

    // Final response (success, non-401 error, or retried 401) → let it through.
    refreshing = false;
  });

  // Hide the intermediate 401 load from the caller's `onload` handler.
  Object.defineProperty(xhr, "onload", {
    configurable: true,
    get: () => (event: ProgressEvent) => {
      if (!refreshing) userOnLoad?.call(xhr, event);
    },
    set: (fn: LoadHandler) => {
      userOnLoad = fn;
    },
  });

  // Remember the body so the request can be replayed after a refresh.
  const nativeSend = xhr.send.bind(xhr);
  xhr.send = (requestBody) => {
    body = requestBody;
    nativeSend(requestBody);
  };

  return xhr;
}

export { xhrClient };
