/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type { IApiMessageResponse } from "@/types/academicYear";
import type {
  IHomePageItem,
  IHomePageItemPayload,
} from "@/types/homePageSection";
import { readOrderField, sortByOrderField } from "@/lib/sortByOrderField";

function mediaUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (typeof value === "object") {
    const record = value as { url?: string; path?: string };
    return mediaUrl(record.url ?? record.path);
  }
  return undefined;
}

function normalizeItem(item: any): IHomePageItem {
  const row =
    item?.HomeFeature ??
    item?.home_feature ??
    item?.HomeGoal ??
    item?.home_goal ??
    item?.HomeMethodology ??
    item?.home_methodology ??
    item?.HomeStudyLevel ??
    item?.home_study_level ??
    item;

  return {
    id: Number(row?.id) || 0,
    title: String(row?.title ?? row?.name ?? ""),
    description: String(row?.description ?? ""),
    icon: mediaUrl(row?.icon ?? row?.icon_url),
    image: mediaUrl(row?.image ?? row?.image_url),
    is_active: Boolean(
      row?.is_active === true ||
        row?.is_active === "1" ||
        Number(row?.is_active ?? 0) === 1,
    ),
    sort_order: readOrderField(row) ?? null,
    created_at: row?.created_at,
    updated_at: row?.updated_at,
    message: item?.message ?? row?.message ?? "",
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

function firstRecord(value: unknown): any | null {
  if (Array.isArray(value)) {
    return (
      value.find(
        (row: any) => row && typeof row === "object" && row.id != null,
      ) ?? null
    );
  }
  if (value && typeof value === "object" && (value as { id?: unknown }).id != null) {
    return value;
  }
  return null;
}

function pickList(response: any): any[] {
  const body = response?.data ?? response;
  if (Array.isArray(body)) return body;
  const raw =
    (Array.isArray(body?.data) ? body.data : null) ??
    body?.HomeFeatures ??
    body?.home_features ??
    body?.HomeGoals ??
    body?.home_goals ??
    body?.HomeMethodologies ??
    body?.home_methodologies ??
    body?.HomeStudyLevels ??
    body?.home_study_levels ??
    body?.data ??
    [];
  return Array.isArray(raw) ? raw : [];
}

function pickItem(response: any): any {
  const nested = response?.data ?? response;
  return (
    firstRecord(nested?.HomeFeature) ??
    firstRecord(nested?.home_feature) ??
    firstRecord(nested?.homeFeature) ??
    firstRecord(nested?.HomeGoal) ??
    firstRecord(nested?.home_goal) ??
    firstRecord(nested?.homeGoal) ??
    firstRecord(nested?.HomeMethodology) ??
    firstRecord(nested?.home_methodology) ??
    firstRecord(nested?.homeMethodology) ??
    firstRecord(nested?.HomeStudyLevel) ??
    firstRecord(nested?.home_study_level) ??
    firstRecord(nested?.homeStudyLevel) ??
    firstRecord(nested?.item) ??
    firstRecord(nested?.data) ??
    firstRecord(nested)
  );
}

export function createHomePageSectionApi<TReducerPath extends string>(options: {
  reducerPath: TReducerPath;
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
          sortByOrderField(pickList(response).map(normalizeItem)),
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
        query: ({ id, data }) => ({
          url: `/${endpoint}/${id}`,
          method: "put",
          data: buildFormData(data),
        }),
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
            (api.util.updateQueryData as any)(
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
