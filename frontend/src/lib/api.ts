import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ==============================
// 🔐 TOKEN REFRESH MANAGEMENT
// ==============================
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// ==============================
// ❌ REQUEST CANCELLATION
// ==============================
const pendingRequests = new Map<string, AbortController>();

const getRequestKey = (config: InternalAxiosRequestConfig) => {
  return `${config.method}:${config.url}:${JSON.stringify(
    config.params || {},
  )}:${JSON.stringify(config.data || {})}`;
};

const cancelPendingRequest = (key: string) => {
  if (pendingRequests.has(key)) {
    pendingRequests.get(key)?.abort();
    pendingRequests.delete(key);
  }
};

// ==============================
// 🌐 AXIOS INSTANCE
// ==============================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// 📤 REQUEST INTERCEPTOR
// ==============================
api.interceptors.request.use(
  (config) => {
    const key = getRequestKey(config);

    // Cancel duplicate GET requests (optional flag)
    if (config.method === "get" && !config.headers?.["x-no-cancel"]) {
      cancelPendingRequest(key);
    }

    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(key, controller);

    // Attach token (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ==============================
// 📥 RESPONSE INTERCEPTOR
// ==============================
api.interceptors.response.use(
  (response) => {
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

    // ✅ Handle cancellation properly
    if ((error as any)?.name === "CanceledError") {
      return Promise.reject(error);
    }

    // ==============================
    // 🔁 HANDLE 401 TOKEN REFRESH
    // ==============================
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      // If already refreshing → queue requests
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.get(`${API_BASE_URL}/auth/refresh`, {
          withCredentials: true,
        });

        const newToken = data?.data?.accessToken;

        if (newToken) {
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", newToken);
          }

          onRefreshed(newToken);

          // Retry original request
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          originalRequest.headers["x-no-cancel"] = true; // prevent self-cancel

          return api(originalRequest);
        }
      } catch (refreshError) {
        // 🔴 Refresh failed → logout
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ==============================
// 🧹 UTILITIES
// ==============================

// Cancel all requests (e.g., on route change)
export const cancelAllRequests = () => {
  pendingRequests.forEach((controller) => controller.abort());
  pendingRequests.clear();
};

// Manual cancellation support
export const createAbortController = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
};

export default api;
