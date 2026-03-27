/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";

interface SettingValue {
  ar: string;
  en?: string;
  message?: string;
}

export const deleteAccountApi = createApi({
  reducerPath: "deleteAccountApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["DeleteAccount"],
  endpoints: (builder) => ({
    getDeleteAccount: builder.query<SettingValue, void>({
      query: () => ({
        url: "/settings",
        method: "get",
        params: { key: "delete-account" },
      }),
      

      transformResponse: (response: any) => {
        return response?.data?.[0]?.value ?? { ar: "", en: "" };
      },

      keepUnusedDataFor: 300, // 3 minutes
    }),

    updateDeleteAccount: builder.mutation<
      SettingValue,
      SettingValue
    >({
      query: (value) => ({
        url: "/settings",
        method: "post",
        params: { key: "delete-account" },
        data: { value },
        auth: true,
        withCsrf: true,
      }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["DeleteAccount"],
    }),
  }),
});

export const {
  useGetDeleteAccountQuery,
  useUpdateDeleteAccountMutation,
} = deleteAccountApi;