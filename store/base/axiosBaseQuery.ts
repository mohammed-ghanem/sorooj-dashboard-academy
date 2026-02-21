// store/base/axiosBaseQuery.ts
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig, AxiosError } from "axios";
import Cookies from "js-cookie";
import api, { sanctumApi } from "@/services/api";

// CSRF token

let csrfPromise: Promise<string | null> | null = null;

const ensureCSRFToken = async () => {
  if (Cookies.get("XSRF-TOKEN")) {
    return Cookies.get("XSRF-TOKEN")!;
  }

  if (!csrfPromise) {
    csrfPromise = sanctumApi.get("/sanctum/csrf-cookie").then(() => {
      return Cookies.get("XSRF-TOKEN") || null;
    });
  }

  return csrfPromise;
};


export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
      withCsrf?: boolean;
      auth?: boolean;
    },
    unknown,
    unknown
  > =>
    async ({
      url,
      method = "get",
      data,
      params,
      headers = {},
      withCsrf = false,
      auth = false
    }) => {
      try {
        const lang = Cookies.get("lang") || "ar";
        headers["Accept-Language"] = lang;


        // if the request need CSRF token
        if (withCsrf && ["post", "put", "patch", "delete"].includes((method || "get").toLowerCase())) {
          const csrfToken = await ensureCSRFToken();
          if (csrfToken) {
            headers["X-XSRF-TOKEN"] = csrfToken;
          }
        }

        // add Authorization token
        if (auth) {
          const token = Cookies.get("access_token");
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
        }

        // add reset_token if there is no access_token
        if (!headers["Authorization"] && Cookies.get("reset_token")) {
          const resetToken = Cookies.get("reset_token");
          headers["Authorization"] = `Bearer ${resetToken}`;
        }

        // console.log("🎯 Final headers:", headers);

        const result = await api({
          url,
          method,
          data,
          params,
          headers,
        });

        // console.log("✅ Response success:", result.status, result.data);
        return { data: result.data };
      } catch (axiosError) {
        const err = axiosError as AxiosError;

        // try another one if the error is 419 (CSRF token mismatch)
        if (err.response?.status === 419) {
          Cookies.remove("XSRF-TOKEN");
        }

        return {
          error: {
            status: err.response?.status,
            data: err.response?.data || err.message,
          },
        };
      }
    };