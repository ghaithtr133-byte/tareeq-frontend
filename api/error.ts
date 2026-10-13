import axios from "axios";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiError";
    this.status = status;
  }
}

export function withApiNamespace(baseUrl?: string) {
  return baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/v1` : undefined;
}

/** Keeps cancellation distinct while normalizing HTTP and network failures. */
export function normalizeApiError(error: unknown) {
  if (axios.isCancel(error) || error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error) && error.response) {
    return new ApiError(error.response.status, `API request failed with status ${error.response.status}.`, {
      cause: error,
    });
  }

  const detail = error instanceof Error && error.message ? ` ${error.message}` : "";
  return new ApiError(0, `Network request failed.${detail}`, { cause: error });
}
