/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  ICreateScientificTrackCategoryPayload,
  IScientificTrackCategory,
  IUpdateScientificTrackCategoryPayload,
} from "@/types/scientificTrackCategory";
import type { IApiMessageResponse } from "@/types/academicYear";

function normalizeCategory(item: any): IScientificTrackCategory {
  return {
    id: Number(item?.id) || 0,
    name: String(item?.name ?? ""),
    about_category: String(item?.about_category ?? ""),
    is_active: Boolean(
      item?.is_active === true || Number(item?.is_active ?? 0) === 1,
    ),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
    message: item?.message ?? "",
  };
}

function buildCategoryFormData(
  data: ICreateScientificTrackCategoryPayload | IUpdateScientificTrackCategoryPayload,
) {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("about_category", data.about_category);
  fd.append("is_active", data.is_active ? "1" : "0");
  return fd;
}

function pickCategoryFromPayload(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.ScientificTrackCategory ??
    nested?.scientific_track_category ??
    nested?.scientificTrackCategory ??
    nested?.data?.ScientificTrackCategory ??
    nested?.data?.scientific_track_category ??
    (Array.isArray(nested?.data) ? nested.data[0] : null) ??
    (nested?.id != null ? nested : null)
  );
}

export const scientificTrackCategoriesApi = createApi({
  reducerPath: "scientificTrackCategoriesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ScientificTrackCategories", "ScientificTrackCategory"],
  endpoints: (builder) => ({
    getScientificTrackCategories: builder.query<
      IScientificTrackCategory[],
      void
    >({
      query: () => ({
        url: "/scientific-track-categories",
        method: "get",
        params: { page: 0, limit: 0 },
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw =
          (Array.isArray(d?.data) ? d.data : null) ??
          d?.ScientificTrackCategories ??
          d?.scientific_track_categories ??
          d?.data ??
          d ??
          [];
        return (Array.isArray(raw) ? raw : []).map(normalizeCategory);
      },
      providesTags: ["ScientificTrackCategories"],
    }),

    getScientificTrackCategoryById: builder.query<
      IScientificTrackCategory,
      number
    >({
      query: (id) => ({
        url: `/scientific-track-categories/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickCategoryFromPayload(response);
        if (!raw) throw new Error("Scientific track category not found");
        return normalizeCategory(raw);
      },
      providesTags: (_r, _e, id) => [
        { type: "ScientificTrackCategory", id },
      ],
    }),

    createScientificTrackCategory: builder.mutation<
      { message: string; data?: IScientificTrackCategory },
      ICreateScientificTrackCategoryPayload
    >({
      query: (data) => ({
        url: "/scientific-track-categories",
        method: "post",
        data: buildCategoryFormData(data),
      }),
      invalidatesTags: ["ScientificTrackCategories"],
    }),

    updateScientificTrackCategory: builder.mutation<
      { message: string; data?: IScientificTrackCategory },
      { id: number; data: IUpdateScientificTrackCategoryPayload }
    >({
      query: ({ id, data }) => ({
        url: `/scientific-track-categories/${id}`,
        method: "put",
        data: buildCategoryFormData(data),
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "ScientificTrackCategories",
        { type: "ScientificTrackCategory", id },
      ],
    }),

    deleteScientificTrackCategory: builder.mutation<
      IApiMessageResponse,
      number
    >({
      query: (id) => ({
        url: `/scientific-track-categories/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["ScientificTrackCategories"],
    }),

    toggleScientificTrackCategoryStatus: builder.mutation<
      { message: string },
      number
    >({
      query: (id) => ({
        url: `/scientific-track-categories/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          scientificTrackCategoriesApi.util.updateQueryData(
            "getScientificTrackCategories",
            undefined,
            (draft: IScientificTrackCategory[]) => {
              const row = draft.find((c) => c.id === id);
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
      invalidatesTags: ["ScientificTrackCategories"],
    }),
  }),
});

export const {
  useGetScientificTrackCategoriesQuery,
  useGetScientificTrackCategoryByIdQuery,
  useCreateScientificTrackCategoryMutation,
  useUpdateScientificTrackCategoryMutation,
  useDeleteScientificTrackCategoryMutation,
  useToggleScientificTrackCategoryStatusMutation,
} = scientificTrackCategoriesApi;
