/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  ICreateBookCategoryPayload,
  IBookCategory,
  IUpdateBookCategoryPayload,
} from "@/types/bookCategory";
import type { IApiMessageResponse } from "@/types/academicYear";

function normalizeCategory(item: any): IBookCategory {
  return {
    id: Number(item?.id) || 0,
    name: String(item?.name ?? ""),
    about_category: String(item?.about_category ?? ""),
    type: item?.type ?? null,
    is_active: Boolean(
      item?.is_active === true || Number(item?.is_active ?? 0) === 1,
    ),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
    message: item?.message ?? "",
  };
}

function buildCategoryFormData(
  data: ICreateBookCategoryPayload | IUpdateBookCategoryPayload,
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
    nested?.BookCategory ??
    nested?.book_category ??
    nested?.bookCategory ??
    nested?.data?.BookCategory ??
    nested?.data?.book_category ??
    (Array.isArray(nested?.data) ? nested.data[0] : null) ??
    (nested?.id != null ? nested : null)
  );
}

function pickBookCategoriesList(response: any): any[] {
  const body = response?.data ?? response;

  if (Array.isArray(body)) {
    return body;
  }

  const raw =
    (Array.isArray(body?.data) ? body.data : null) ??
    body?.BookCategories ??
    body?.book_categories ??
    body?.data ??
    [];

  return Array.isArray(raw) ? raw : [];
}

export const bookCategoriesApi = createApi({
  reducerPath: "bookCategoriesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BookCategories", "BookCategory"],
  endpoints: (builder) => ({
    getBookCategories: builder.query<IBookCategory[], void>({
      query: () => ({
        url: "/book-categories",
        method: "get",
      }),
      transformResponse: (response: any) =>
        pickBookCategoriesList(response).map(normalizeCategory),
      providesTags: ["BookCategories"],
    }),

    getBookCategoryById: builder.query<IBookCategory, number>({
      query: (id) => ({
        url: `/book-categories/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickCategoryFromPayload(response);
        if (!raw) throw new Error("Book category not found");
        return normalizeCategory(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "BookCategory", id }],
    }),

    createBookCategory: builder.mutation<
      { message: string; data?: IBookCategory },
      ICreateBookCategoryPayload
    >({
      query: (data) => ({
        url: "/book-categories",
        method: "post",
        data: buildCategoryFormData(data),
      }),
      invalidatesTags: ["BookCategories"],
    }),

    updateBookCategory: builder.mutation<
      { message: string; data?: IBookCategory },
      { id: number; data: IUpdateBookCategoryPayload }
    >({
      query: ({ id, data }) => ({
        url: `/book-categories/${id}`,
        method: "put",
        data: buildCategoryFormData(data),
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "BookCategories",
        { type: "BookCategory", id },
      ],
    }),

    deleteBookCategory: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/book-categories/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["BookCategories"],
    }),

    toggleBookCategoryStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/book-categories/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          bookCategoriesApi.util.updateQueryData(
            "getBookCategories",
            undefined,
            (draft: IBookCategory[]) => {
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
      invalidatesTags: ["BookCategories"],
    }),
  }),
});

export const {
  useGetBookCategoriesQuery,
  useGetBookCategoryByIdQuery,
  useCreateBookCategoryMutation,
  useUpdateBookCategoryMutation,
  useDeleteBookCategoryMutation,
  useToggleBookCategoryStatusMutation,
} = bookCategoriesApi;
