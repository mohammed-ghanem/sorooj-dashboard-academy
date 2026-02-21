// services/api.ts
import axios from "axios";
// import Cookies from "js-cookie";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ;

// Main API instance
const api = axios.create({
  baseURL: `${BASE}/dashboard-api/v1`,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    // "Accept": "application/json",
    // "Content-Type": "application/json",
    "api-key": API_KEY,
    "Api-Version": "v1",
  },
});

// Sanctum API instance for CSRF (مثل الكود القديم)
export const sanctumApi = axios.create({
  baseURL: BASE, // بدون /dashboard-api/v1
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    // "Accept": "application/json",
    // "Content-Type": "application/json",
  },
});

// Helper function to get CSRF token
const getCSRFTokenFromDocument = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

// Request interceptor for main api
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    // Language
    const lang =
      typeof document !== "undefined"
        ? document.cookie.match(/lang=(ar|en)/)?.[1] ?? "ar"
        : "ar";
    config.headers["Accept-Language"] = lang;

    // API key
    if (API_KEY) {
      config.headers["api-key"] = API_KEY;
    }

    // Add CSRF for mutating methods
    const method = (config.method || "").toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      const csrf = getCSRFTokenFromDocument();
      if (csrf) {
        config.headers["X-XSRF-TOKEN"] = csrf;
      }
    }

      // إذا لم يكن FormData → اجعله JSON
      if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;