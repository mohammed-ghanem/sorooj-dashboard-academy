/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  type IAppContactsValue,
  emptyAppContacts,
} from "@/types/appContacts";

function firstMobile(mobile: unknown): string {
  if (Array.isArray(mobile)) {
    return String(mobile[0] ?? "");
  }
  if (mobile == null) return "";
  return String(mobile);
}

function normalizeAppContacts(raw: any): IAppContactsValue {
  if (!raw || typeof raw !== "object") {
    return emptyAppContacts();
  }
  const social = raw.social && typeof raw.social === "object" ? raw.social : {};
  return {
    mobile: firstMobile(raw.mobile),
    whatsapp: String(raw.whatsapp ?? ""),
    email: String(raw.email ?? ""),
    social: {
      facebook: String(social.facebook ?? ""),
      instagram: String(social.instagram ?? ""),
      x: String(social.x ?? social.twitter ?? ""),
    },
  };
}

function buildAppContactsFormData(value: IAppContactsValue) {
  const fd = new FormData();
  fd.append("key", "app-contacts");
  const mobile = value.mobile?.trim() ?? "";
  if (mobile) {
    fd.append("value[mobile][]", mobile);
  } else {
    fd.append("value[mobile][]", "");
  }
  fd.append("value[whatsapp]", value.whatsapp ?? "");
  fd.append("value[email]", value.email ?? "");
  fd.append("value[social][facebook]", value.social?.facebook ?? "");
  fd.append("value[social][instagram]", value.social?.instagram ?? "");
  fd.append("value[social][x]", value.social?.x ?? "");
  return fd;
}

export const appContactsApi = createApi({
  reducerPath: "appContactsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AppContacts"],
  endpoints: (builder) => ({
    getAppContacts: builder.query<IAppContactsValue, void>({
      query: () => ({
        url: "/settings",
        method: "get",
        params: { key: "app-contacts" },
      }),
      transformResponse: (response: any) => {
        const row =
          response?.data?.[0]?.value ??
          response?.data?.value ??
          response?.value;
        return normalizeAppContacts(row);
      },
      providesTags: ["AppContacts"],
    }),

    updateAppContacts: builder.mutation<
      { message?: string } | any,
      IAppContactsValue
    >({
      query: (value) => ({
        url: "/settings",
        method: "post",
        params: { key: "app-contacts" },
        data: buildAppContactsFormData(value),
        auth: true,
        withCsrf: true,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ["AppContacts"],
    }),
  }),
});

export const { useGetAppContactsQuery, useUpdateAppContactsMutation } =
  appContactsApi;
