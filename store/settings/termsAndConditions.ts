/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";

interface SettingValue {
  ar: string;
  en?: string;
  message?: string;
}

export const termsAndConditionsApi = createApi({
  reducerPath: "termsAndConditionsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["TermsAndConditions"],
  endpoints: (builder) => ({
    getTermsAndConditions: builder.query<SettingValue, void>({
      query: () => ({
        url: "/settings",
        method: "get",
        params: { key: "terms-and-conditions" },
      }),
      

      transformResponse: (response: any) => {
        return response?.data?.[0]?.value ?? { ar: "", en: "" };
      },

      keepUnusedDataFor: 300, // 3 minutes
    }),

    updateTermsAndConditions: builder.mutation<
      SettingValue,
      SettingValue
    >({
      query: (value) => ({
        url: "/settings",
        method: "post",
        params: { key: "terms-and-conditions" },
        data: { value },
        auth: true,
        withCsrf: true,
      }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["TermsAndConditions"],
    }),
  }),
});

export const {
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
} = termsAndConditionsApi;