import axios from "axios";

import { ApiError, normalizeApiError, withApiNamespace } from "./error";

const browserApiBaseUrl = withApiNamespace(process.env.NEXT_PUBLIC_API_BASE_URL);

function requireBrowserApiBaseUrl() {
  if (!browserApiBaseUrl) {
    throw new ApiError(0, "NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return browserApiBaseUrl;
}

/** Browser transport for the separate Hono API. Cookie sessions are managed by the backend. */
export const browserApiClient = axios.create({
  baseURL: browserApiBaseUrl,
  withCredentials: true,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

browserApiClient.interceptors.request.use((config) => {
  config.baseURL = requireBrowserApiBaseUrl();
  return config;
});

browserApiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);
