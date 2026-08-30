/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  IBook,
  ICreateBookPayload,
  IUpdateBookPayload,
} from "@/types/book";
import type { IApiMessageResponse } from "@/types/academicYear";

function normalizeAttachment(item: any) {
  return {
    id: Number(item?.id) || 0,
    file_url: item?.file_url ?? item?.url ?? item?.path ?? "",
    name: item?.name ?? item?.original_name ?? "",
  };
}

function normalizeBook(item: any): IBook {
  const row = item?.book ?? item;
  const categoryRaw = row?.category ?? row?.book_category ?? row?.Category;
  const doctorRaw = row?.doctor ?? row?.Doctor;

  return {
    id: Number(row?.id) || 0,
    title: String(row?.title ?? ""),
    content: String(row?.content ?? ""),
    category_id: Number(row?.category_id ?? categoryRaw?.id ?? 0),
    doctor_id: Number(row?.doctor_id ?? doctorRaw?.id ?? 0),
    category:
      categoryRaw && typeof categoryRaw === "object"
        ? {
            id: categoryRaw?.id != null ? Number(categoryRaw.id) : undefined,
            name: String(categoryRaw?.name ?? ""),
          }
        : undefined,
    doctor:
      doctorRaw && typeof doctorRaw === "object"
        ? {
            id: doctorRaw?.id != null ? Number(doctorRaw.id) : undefined,
            name: String(doctorRaw?.name ?? ""),
          }
        : undefined,
    image: row?.image ?? row?.cover ?? null,
    attachments: (Array.isArray(row?.attachments) ? row.attachments : []).map(
      normalizeAttachment,
    ),
    is_active: Boolean(
      row?.is_active === true || Number(row?.is_active ?? 0) === 1,
    ),
    created_at: row?.created_at,
    updated_at: row?.updated_at,
    message: row?.message ?? "",
  };
}

function pickBookFromPayload(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.Book ??
    nested?.book ??
    nested?.data?.Book ??
    nested?.data?.book ??
    (nested?.data && nested.data?.id != null ? nested.data : null) ??
    (nested?.id != null ? nested : null)
  );
}

function appendBookFields(
  fd: FormData,
  data: ICreateBookPayload | IUpdateBookPayload,
) {
  fd.append("title", data.title);
  fd.append("content", data.content);
  fd.append("category_id", String(data.category_id));
  fd.append("doctor_id", String(data.doctor_id));
  fd.append("is_active", data.is_active ? "1" : "0");
  if (data.image) fd.append("image", data.image);
  data.attachments.forEach((file) => {
    fd.append("attachments[]", file);
  });
}

function buildCreateBookFormData(data: ICreateBookPayload) {
  const fd = new FormData();
  appendBookFields(fd, data);
  return fd;
}

function buildUpdateBookFormData(data: IUpdateBookPayload) {
  const fd = new FormData();
  fd.append("_method", "PUT");
  appendBookFields(fd, data);
  return fd;
}

export const booksApi = createApi({
  reducerPath: "booksApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Books", "Book"],
  endpoints: (builder) => ({
    getBooks: builder.query<IBook[], void>({
      query: () => ({
        url: "/books",
        method: "get",
        params: { page: 0, limit: 0 },
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw =
          (Array.isArray(d?.data) ? d.data : null) ??
          d?.Books ??
          d?.books ??
          d?.data ??
          d ??
          [];
        return (Array.isArray(raw) ? raw : []).map(normalizeBook);
      },
      providesTags: ["Books"],
    }),

    getBookById: builder.query<IBook, number>({
      query: (id) => ({
        url: `/books/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickBookFromPayload(response);
        if (!raw) throw new Error("Book not found");
        return normalizeBook(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Book", id }],
    }),

    createBook: builder.mutation<
      { message: string; data?: IBook },
      ICreateBookPayload
    >({
      query: (data) => ({
        url: "/books",
        method: "post",
        data: buildCreateBookFormData(data),
      }),
      invalidatesTags: ["Books"],
    }),

    updateBook: builder.mutation<
      { message: string; data?: IBook },
      { id: number; data: IUpdateBookPayload }
    >({
      query: ({ id, data }) => ({
        url: `/books/${id}`,
        method: "post",
        data: buildUpdateBookFormData(data),
      }),
      invalidatesTags: (_r, _e, { id }) => ["Books", { type: "Book", id }],
    }),

    deleteBook: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/books/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Books"],
    }),

    deleteBookAttachment: builder.mutation<
      IApiMessageResponse,
      { bookId: number; attachmentId: number }
    >({
      query: ({ bookId, attachmentId }) => ({
        url: `/books/${bookId}/attachments/${attachmentId}`,
        method: "delete",
      }),
      invalidatesTags: (_r, _e, { bookId }) => [
        "Books",
        { type: "Book", id: bookId },
      ],
    }),

    toggleBookStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/books/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          booksApi.util.updateQueryData("getBooks", undefined, (draft) => {
            const row = draft.find((b) => b.id === id);
            if (row) row.is_active = !row.is_active;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Books"],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookByIdQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useDeleteBookAttachmentMutation,
  useToggleBookStatusMutation,
} = booksApi;
