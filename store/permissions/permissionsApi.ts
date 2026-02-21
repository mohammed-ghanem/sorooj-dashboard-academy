/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";

export interface PermissionControl {
  id: number;
  name: string;
  key: string;
  
}

export interface PermissionGroup {
  name: string;
  controls: PermissionControl[];
}

export const permissionsApi = createApi({
  reducerPath: "permissionsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Permissions"],
  endpoints: (builder) => ({
    getPermissions: builder.query<PermissionGroup[], void>({
      query: () => ({
        url: "/permissions",
        method: "get",
      }),

      transformResponse: (res: any) => {
        return (
          res?.data?.data ??
          res?.data ??
          []
        );
      },

      keepUnusedDataFor: 300,
      providesTags: ["Permissions"],
    }),
  }),
});

export const { useGetPermissionsQuery } = permissionsApi;
