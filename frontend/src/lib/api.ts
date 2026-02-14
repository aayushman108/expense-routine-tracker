import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Store active abort controllers
const pendingRequests = new Map<string, AbortController>();

/**
 * Generate a unique key for each request (method + url)
 */
const getRequestKey = (config: InternalAxiosRequestConfig): string => {
  return `${config.method}:${config.url}`;
};

/**
 * Cancel previous pending request with same key
 */
const cancelPendingRequest = (key: string) => {
  if (pendingRequests.has(key)) {
    const controller = pendingRequests.get(key)!;
    controller.abort();
    pendingRequests.delete(key);
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ──
api.interceptors.request.use(
  (config) => {
    // Attach abort controller
    const key = getRequestKey(config);

    // For GET requests, cancel duplicates
    if (config.method === "get") {
      cancelPendingRequest(key);
    }

    const controller = new AbortController();
    config.signal = config.signal || controller.signal;
    pendingRequests.set(key, controller);

    // Attach access token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ──
api.interceptors.response.use(
  (response) => {
    // Remove from pending
    const key = getRequestKey(response.config);
    pendingRequests.delete(key);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (originalRequest) {
      const key = getRequestKey(originalRequest);
      pendingRequests.delete(key);
    }

    // If request was cancelled, don't retry
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // 401 — try to refresh token
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.get(`${API_BASE_URL}/auth/refresh`, {
          withCredentials: true,
        });

        const newToken = data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed — clear and redirect to login
        localStorage.removeItem("accessToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Cancel all pending requests (useful on route change / unmount)
 */
export const cancelAllRequests = () => {
  pendingRequests.forEach((controller) => controller.abort());
  pendingRequests.clear();
};

/**
 * Create a standalone abort controller for manual cancellation
 */
export const createAbortController = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
};

export default api;
