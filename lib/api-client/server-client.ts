import "server-only";

import axios from "axios";

import { ApiError, normalizeApiError, withApiNamespace } from "./error";

const serverApiBaseUrl = withApiNamespace(process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL);

function requireServerApiBaseUrl() {
  if (!serverApiBaseUrl) {
    throw new ApiError(
      0,
      "API_BASE_URL is not configured. Configure it, or temporarily use the NEXT_PUBLIC_API_BASE_URL fallback.",
    );
  }

  return serverApiBaseUrl;
}

/** Server-only transport. It deliberately does not forward browser cookies or headers. */
export const serverApiClient = axios.create({
  baseURL: serverApiBaseUrl,
  withCredentials: false,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

serverApiClient.interceptors.request.use((config) => {
  config.baseURL = requireServerApiBaseUrl();
  return config;
});

serverApiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);
