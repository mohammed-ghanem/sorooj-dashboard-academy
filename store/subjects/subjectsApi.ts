/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  ISubject,
  ICreateSubjectPayload,
  IUpdateSubjectPayload,
  IApiMessageResponse,
} from "@/types/subject";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

function pickStudyTermId(item: any): number {
  const candidates = [
    item?.study_term_id,
    item?.studyTermId,
    item?.study_term?.id,
    item?.studyTerm?.id,
  ];
  for (const v of candidates) {
    if (v === null || v === undefined || v === "") continue;
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function normalizeSubject(item: any): ISubject {
  const localized = parseLocalizedNameFromModel(item);

  const stRaw = item?.study_term ?? item?.studyTerm;
  let study_term: ISubject["study_term"] = undefined;
  if (stRaw && typeof stRaw === "object") {
    const stLoc = parseLocalizedNameFromModel(stRaw);
    study_term = {
      id: stRaw?.id != null ? Number(stRaw.id) : undefined,
      name: stLoc.name,
      name_ar: stLoc.name_ar,
      name_en: stLoc.name_en,
    };
  }

  return {
    id: Number(item?.id) || 0,
    name: localized.name,
    name_ar: localized.name_ar,
    name_en: localized.name_en,
    about_subject: item?.about_subject ?? "",
    study_term_id: pickStudyTermId(item),
    study_term,
    cover: item?.cover ?? item?.cover_url ?? undefined,
    is_active: Boolean(item?.is_active === true || Number(item?.is_active ?? 0) === 1),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
    message: item?.message ?? "",
  };
}

function buildSubjectFormData(data: ICreateSubjectPayload | IUpdateSubjectPayload) {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("about_subject", data.about_subject);
  fd.append("study_term_id", String(data.study_term_id));
  fd.append("is_active", data.is_active ? "1" : "0");
  if (data.cover) fd.append("cover", data.cover);
  return fd;
}

function pickSubjectFromPayload(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.Subject ??
    nested?.subject ??
    nested?.data?.Subject ??
    nested?.data?.subject ??
    (Array.isArray(nested?.data) ? nested.data[0] : null) ??
    (nested?.id != null ? nested : null)
  );
}

export const subjectsApi = createApi({
  reducerPath: "subjectsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Subjects", "Subject"],
  endpoints: (builder) => ({
    getSubjects: builder.query<ISubject[], void>({
      query: () => ({
        url: "/subjects",
        method: "get",
        params: { page: 0, limit: 0 },
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw =
          (Array.isArray(d?.data) ? d.data : null) ??
          d?.data?.data ??
          d?.Subjects ??
          d?.subjects ??
          d?.subjects ??
          d?.data ??
          d ??
          [];
        return (Array.isArray(raw) ? raw : []).map(normalizeSubject);
      },
      providesTags: ["Subjects"],
    }),

    getSubjectById: builder.query<ISubject, number>({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickSubjectFromPayload(response);
        if (!raw) throw new Error("Subject data not found");
        return normalizeSubject(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Subject", id }],
    }),

    createSubject: builder.mutation<
      { message: string; data?: ISubject },
      ICreateSubjectPayload
    >({
      query: (data) => ({
        url: "/subjects",
        method: "post",
        data: buildSubjectFormData(data),
      }),
      invalidatesTags: ["Subjects"],
    }),

    updateSubject: builder.mutation<
      { message: string; data?: ISubject },
      { id: number; data: IUpdateSubjectPayload }
    >({
      query: ({ id, data }) => ({
        url: `/subjects/${id}`,
        method: "put",
        data: buildSubjectFormData(data),
      }),
      invalidatesTags: (_r, _e, { id }) => ["Subjects", { type: "Subject", id }],
    }),

    deleteSubject: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Subjects"],
    }),

    toggleSubjectStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/subjects/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          subjectsApi.util.updateQueryData(
            "getSubjects",
            undefined,
            (draft: ISubject[]) => {
              const row = draft.find((s) => s.id === id);
              if (row) row.is_active = !row.is_active;
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Subjects"],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useToggleSubjectStatusMutation,
} = subjectsApi;
