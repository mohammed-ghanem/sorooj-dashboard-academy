/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  ICreateScientificTrackSubjectPayload,
  IScientificTrackSubject,
  IUpdateScientificTrackSubjectPayload,
} from "@/types/scientificTrackSubject";
import type { IApiMessageResponse } from "@/types/academicYear";
import { readOrderField, sortByOrderField } from "@/lib/sortByOrderField";

function pickCategoryId(item: any): number {
  const candidates = [
    item?.category_id,
    item?.categoryId,
    item?.category?.id,
    item?.scientific_track_category_id,
    item?.scientific_track_category?.id,
  ];
  for (const v of candidates) {
    if (v === null || v === undefined || v === "") continue;
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function normalizeSubject(item: any): IScientificTrackSubject {
  const catRaw =
    item?.category ??
    item?.Category ??
    item?.scientific_track_category ??
    item?.ScientificTrackCategory;

  let category: IScientificTrackSubject["category"] = undefined;
  if (catRaw && typeof catRaw === "object") {
    category = {
      id: catRaw?.id != null ? Number(catRaw.id) : undefined,
      name: String(catRaw?.name ?? ""),
    };
  }

  return {
    id: Number(item?.id) || 0,
    name: String(item?.name ?? ""),
    about_subject: String(item?.about_subject ?? ""),
    category_id: pickCategoryId(item),
    category,
    cover: item?.cover ?? item?.cover_url ?? undefined,
    sort_order: readOrderField(item),
    is_active: Boolean(
      item?.is_active === true || Number(item?.is_active ?? 0) === 1,
    ),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
    message: item?.message ?? "",
  };
}

function buildSubjectFormData(
  data: ICreateScientificTrackSubjectPayload | IUpdateScientificTrackSubjectPayload,
) {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("about_subject", data.about_subject);
  fd.append("category_id", String(data.category_id));
  fd.append("is_active", data.is_active ? "1" : "0");
  if (data.cover) fd.append("cover", data.cover);
  return fd;
}

function pickSubjectFromPayload(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.ScientificTrackSubject ??
    nested?.scientific_track_subject ??
    nested?.scientificTrackSubject ??
    nested?.Subject ??
    nested?.subject ??
    nested?.data?.ScientificTrackSubject ??
    nested?.data?.scientific_track_subject ??
    (Array.isArray(nested?.data) ? nested.data[0] : null) ??
    (nested?.id != null ? nested : null)
  );
}

export const scientificTrackSubjectsApi = createApi({
  reducerPath: "scientificTrackSubjectsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ScientificTrackSubjects", "ScientificTrackSubject"],
  endpoints: (builder) => ({
    getScientificTrackSubjects: builder.query<IScientificTrackSubject[], void>({
      query: () => ({
        url: "/scientific-track-subjects",
        method: "get",
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw =
          (Array.isArray(d?.data) ? d.data : null) ??
          d?.ScientificTrackSubjects ??
          d?.scientific_track_subjects ??
          d?.data ??
          d ??
          [];
        return sortByOrderField(
          (Array.isArray(raw) ? raw : []).map(normalizeSubject),
        );
      },
      providesTags: ["ScientificTrackSubjects"],
    }),

    getScientificTrackSubjectById: builder.query<
      IScientificTrackSubject,
      number
    >({
      query: (id) => ({
        url: `/scientific-track-subjects/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickSubjectFromPayload(response);
        if (!raw) throw new Error("Scientific track subject not found");
        return normalizeSubject(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "ScientificTrackSubject", id }],
    }),

    createScientificTrackSubject: builder.mutation<
      { message: string; data?: IScientificTrackSubject },
      ICreateScientificTrackSubjectPayload
    >({
      query: (data) => ({
        url: "/scientific-track-subjects",
        method: "post",
        data: buildSubjectFormData(data),
      }),
      invalidatesTags: ["ScientificTrackSubjects"],
    }),

    updateScientificTrackSubject: builder.mutation<
      { message: string; data?: IScientificTrackSubject },
      { id: number; data: IUpdateScientificTrackSubjectPayload }
    >({
      query: ({ id, data }) => {
        const fd = buildSubjectFormData(data);
        fd.append("_method", "PUT");
        return {
          url: `/scientific-track-subjects/${id}`,
          method: "post",
          data: fd,
        };
      },
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const listPatch = dispatch(
          scientificTrackSubjectsApi.util.updateQueryData(
            "getScientificTrackSubjects",
            undefined,
            (draft: IScientificTrackSubject[]) => {
              const row = draft.find((s) => s.id === id);
              if (!row) return;
              row.name = data.name;
              row.about_subject = data.about_subject;
              row.category_id = data.category_id;
              row.is_active = data.is_active;
            },
          ),
        );
        const detailPatch = dispatch(
          scientificTrackSubjectsApi.util.updateQueryData(
            "getScientificTrackSubjectById",
            id,
            (draft: IScientificTrackSubject) => {
              draft.name = data.name;
              draft.about_subject = data.about_subject;
              draft.category_id = data.category_id;
              draft.is_active = data.is_active;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          listPatch.undo();
          detailPatch.undo();
        }
      },
      invalidatesTags: (_r, _e, { id }) => [
        "ScientificTrackSubjects",
        { type: "ScientificTrackSubject", id },
      ],
    }),

    deleteScientificTrackSubject: builder.mutation<
      IApiMessageResponse,
      number
    >({
      query: (id) => ({
        url: `/scientific-track-subjects/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["ScientificTrackSubjects"],
    }),

    toggleScientificTrackSubjectStatus: builder.mutation<
      { message: string },
      number
    >({
      query: (id) => ({
        url: `/scientific-track-subjects/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          scientificTrackSubjectsApi.util.updateQueryData(
            "getScientificTrackSubjects",
            undefined,
            (draft: IScientificTrackSubject[]) => {
              const row = draft.find((s) => s.id === id);
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
      invalidatesTags: ["ScientificTrackSubjects"],
    }),
  }),
});

export const {
  useGetScientificTrackSubjectsQuery,
  useGetScientificTrackSubjectByIdQuery,
  useCreateScientificTrackSubjectMutation,
  useUpdateScientificTrackSubjectMutation,
  useDeleteScientificTrackSubjectMutation,
  useToggleScientificTrackSubjectStatusMutation,
} = scientificTrackSubjectsApi;
