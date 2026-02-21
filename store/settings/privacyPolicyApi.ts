/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";

interface SettingValue {
  ar: string;
  en?: string;
  message?: string;
}

export const privacyPolicyApi = createApi({
  reducerPath: "privacyPolicyApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["PrivacyPolicy"],
  endpoints: (builder) => ({
    getPrivacyPolicy: builder.query<SettingValue, void>({
      query: () => ({
        url: "/settings",
        method: "post",
        params: { key: "privacy-policy" },
      }),
      transformResponse: (response: any) =>
        response.data.setting.value,
      providesTags: ["PrivacyPolicy"],
      keepUnusedDataFor: 300, // 5 دقائق
    }),

    updatePrivacyPolicy: builder.mutation<
      SettingValue,
      SettingValue
    >({
      query: (value) => ({
        url: "/settings",
        method: "post",
        params: { key: "privacy-policy" },
        data: { value },
      }),
      transformResponse: (response: any) =>
        response.data.setting.value,
      invalidatesTags: ["PrivacyPolicy"],
    }),
  }),
});

export const {
  useGetPrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation,
} = privacyPolicyApi;
