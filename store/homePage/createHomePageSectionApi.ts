/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type { IApiMessageResponse } from "@/types/academicYear";
import type {
  IHomePageItem,
  IHomePageItemPayload,
} from "@/types/homePageSection";

function normalizeItem(item: any): IHomePageItem {
  return {
    id: Number(item?.id) || 0,
    title: String(item?.title ?? item?.name ?? ""),
    description: String(item?.description ?? ""),
    icon: item?.icon ?? item?.icon_url ?? undefined,
    image: item?.image ?? item?.image_url ?? undefined,
    is_active: Boolean(
      item?.is_active === true || Number(item?.is_active ?? 0) === 1,
    ),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
    message: item?.message ?? "",
  };
}

function buildFormData(data: IHomePageItemPayload) {
  const fd = new FormData();
  fd.append("title", data.title);
  fd.append("description", data.description);
  fd.append("is_active", data.is_active ? "1" : "0");
  if (data.icon) fd.append("icon", data.icon);
  if (data.image) fd.append("image", data.image);
  return fd;
}

function pickList(response: any): any[] {
  const body = response?.data ?? response;
  if (Array.isArray(body)) return body;
  const raw =
    (Array.isArray(body?.data) ? body.data : null) ??
    body?.data ??
    [];
  return Array.isArray(raw) ? raw : [];
}

function pickItem(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.data ??
    (Array.isArray(nested?.data) ? nested.data[0] : null) ??
    (nested?.id != null ? nested : null)
  );
}

export function createHomePageSectionApi(options: {
  reducerPath: string;
  endpoint: string;
  listTag: string;
  itemTag: string;
}) {
  const { reducerPath, endpoint, listTag, itemTag } = options;

  const api = createApi({
    reducerPath,
    baseQuery: axiosBaseQuery(),
    tagTypes: [listTag, itemTag],
    endpoints: (builder) => ({
      getItems: builder.query<IHomePageItem[], void>({
        query: () => ({ url: `/${endpoint}`, method: "get" }),
        transformResponse: (response: any) =>
          pickList(response).map(normalizeItem),
        providesTags: [listTag],
      }),
      getItemById: builder.query<IHomePageItem, number>({
        query: (id) => ({ url: `/${endpoint}/${id}`, method: "get" }),
        transformResponse: (response: any) => {
          const raw = pickItem(response);
          if (!raw) throw new Error("Home page item not found");
          return normalizeItem(raw);
        },
        providesTags: (_r, _e, id) => [{ type: itemTag, id }],
      }),
      createItem: builder.mutation<
        { message: string; data?: IHomePageItem },
        IHomePageItemPayload
      >({
        query: (data) => ({
          url: `/${endpoint}`,
          method: "post",
          data: buildFormData(data),
        }),
        invalidatesTags: [listTag],
      }),
      updateItem: builder.mutation<
        { message: string; data?: IHomePageItem },
        { id: number; data: IHomePageItemPayload }
      >({
        query: ({ id, data }) => {
          const fd = buildFormData(data);
          fd.append("_method", "PUT");
          return {
            url: `/${endpoint}/${id}`,
            method: "post",
            data: fd,
          };
        },
        invalidatesTags: (_r, _e, { id }) => [
          listTag,
          { type: itemTag, id },
        ],
      }),
      deleteItem: builder.mutation<IApiMessageResponse, number>({
        query: (id) => ({
          url: `/${endpoint}/${id}`,
          method: "delete",
        }),
        invalidatesTags: [listTag],
      }),
      toggleItemStatus: builder.mutation<{ message: string }, number>({
        query: (id) => ({
          url: `/${endpoint}/status/${id}`,
          method: "post",
        }),
        async onQueryStarted(id, { dispatch, queryFulfilled }) {
          const patchResult = dispatch(
            api.util.updateQueryData(
              "getItems",
              undefined,
              (draft: IHomePageItem[]) => {
                const row = draft.find((item) => item.id === id);
                if (row) row.is_active = !row.is_active;
              },
            ),
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        },
        invalidatesTags: [listTag],
      }),
    }),
  });

  return api;
}
