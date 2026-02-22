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
        method: "get",
        params: { key: "privacy-policy" },
      }),
      transformResponse: (response: any) => {
        return response?.data?.data?.[0]?.value ?? { ar: "", en: "" };
      },
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
        auth: true,
        withCsrf: true,
      }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["PrivacyPolicy"],
    }),
  }),
}); 

export const {
  useGetPrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation,
} = privacyPolicyApi;











// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { createApi } from "@reduxjs/toolkit/query/react";
// import { axiosBaseQuery } from "../base/axiosBaseQuery";

// interface SettingValue {
//   ar: string;
//   en?: string;
//   message?: string;
// }

// export const privacyPolicyApi = createApi({
//   reducerPath: "privacyPolicyApi",
//   baseQuery: axiosBaseQuery(),
//   tagTypes: ["PrivacyPolicy"],
//   endpoints: (builder) => ({
//     getPrivacyPolicy: builder.query<SettingValue, void>({
//       query: () => ({
//         url: "/settings",
//         method: "post",
//         params: { key: "privacy-policy" },
//       }),
//       transformResponse: (response: any) =>
//         response.data.setting.value,
//       providesTags: ["PrivacyPolicy"],
//       keepUnusedDataFor: 300, // 5 دقائق
//     }),

//     updatePrivacyPolicy: builder.mutation<
//       SettingValue,
//       SettingValue
//     >({
//       query: (value) => ({
//         url: "/settings",
//         method: "post",
//         params: { key: "privacy-policy" },
//         data: { value },
//       }),
//       transformResponse: (response: any) =>
//         response.data.setting.value,
//       invalidatesTags: ["PrivacyPolicy"],
//     }),
//   }),
// });

// export const {
//   useGetPrivacyPolicyQuery,
//   useUpdatePrivacyPolicyMutation,
// } = privacyPolicyApi;
