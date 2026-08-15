import { API_BASE_URL } from "@/constants/config";
import { ApiError } from "@/types/api.types";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(
      typeof payload === "string" ? payload : (payload?.message ?? "Request failed"),
      response.status,
      payload,
    );
  }

  return payload as T;
}

/**
 * expo/fetch (which SDK 57 wires up as the global `fetch` in some setups)
 * throws "Unsupported FormDataPart implementation" for React Native's
 * classic `{uri, name, type}` file-upload shape - it only accepts spec
 * Blob/File. XMLHttpRequest still goes through RN's original networking
 * bridge, which handles that shape correctly, so file uploads go through
 * XHR instead of the shared `request()` helper above.
 */
function postFormData<T>(path: string, formData: FormData): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}${path}`);

    xhr.onload = () => {
      let payload: unknown;

      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
      } catch {
        payload = xhr.responseText;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload as T);
        return;
      }

      const message =
        typeof payload === "string"
          ? payload
          : ((payload as { message?: string } | undefined)?.message ?? "Request failed");
      reject(new ApiError(message, xhr.status, payload));
    };

    xhr.onerror = () => {
      reject(new ApiError("Network request failed", 0, null));
    };

    xhr.send(formData);
  });
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  postFormData: <T>(path: string, formData: FormData) => postFormData<T>(path, formData),
};
