// store/base/axiosBaseQuery.ts
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig, AxiosError } from "axios";
import Cookies from "js-cookie";
import api, { sanctumApi } from "@/services/api";
import { reportUploadProgress } from "@/lib/uploadProgressBus";
import {
  handleSessionExpired,
  isUnauthenticatedError,
} from "@/lib/handleSessionExpired";

let csrfPromise: Promise<string | null> | null = null;

const ensureCSRFToken = async () => {
  if (Cookies.get("XSRF-TOKEN")) {
    return Cookies.get("XSRF-TOKEN")!;
  }

  if (!csrfPromise) {
    csrfPromise = sanctumApi
      .get("/sanctum/csrf-cookie")
      .then(() => Cookies.get("XSRF-TOKEN") || null)
      .catch(() => null)
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

function normalizeAxiosErrorData(err: AxiosError): unknown {
  const responseData = err.response?.data;

  if (responseData != null && responseData !== "") {
    if (typeof responseData === "string") {
      try {
        return JSON.parse(responseData) as unknown;
      } catch {
        return { message: responseData };
      }
    }
    return responseData;
  }

  return {
    message: err.message,
    code: err.code,
    network: true,
  };
}

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
    auth = false,
  }) => {
    try {
      const lang = Cookies.get("lang") || "ar";
      headers["Accept-Language"] = lang;

      if (
        withCsrf &&
        ["post", "put", "patch", "delete"].includes(
          (method || "get").toLowerCase(),
        )
      ) {
        const csrfToken = await ensureCSRFToken();
        if (csrfToken) {
          headers["X-XSRF-TOKEN"] = csrfToken;
        }
      }

      if (auth) {
        const token = Cookies.get("access_token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      if (!headers["Authorization"] && Cookies.get("reset_token")) {
        const resetToken = Cookies.get("reset_token");
        headers["Authorization"] = `Bearer ${resetToken}`;
      }

      const result = await api({
        url,
        method,
        data,
        params,
        headers,
        onUploadProgress:
          typeof FormData !== "undefined" && data instanceof FormData
            ? (event) => {
                if (!event.total) return;
                reportUploadProgress((event.loaded / event.total) * 100);
              }
            : undefined,
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      const errorData = normalizeAxiosErrorData(err);

      if (err.response?.status === 419) {
        Cookies.remove("XSRF-TOKEN");
      }

      if (isUnauthenticatedError(err.response?.status, errorData)) {
        handleSessionExpired({ requestUrl: url });
      }

      return {
        error: {
          status: err.response?.status,
          data: errorData,
        },
      };
    }
  };
