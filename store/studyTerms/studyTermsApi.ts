/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  IStudyTerm,
  ICreateStudyTermPayload,
  IUpdateStudyTermPayload,
  IApiMessageResponse,
} from "@/types/studyTerm";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

/** Backend may send only nested `academic_year` without top-level `academic_year_id`. */
function pickAcademicYearId(item: any): number {
  const candidates = [
    item?.academic_year_id,
    item?.academicYearId,
    item?.academic_year?.id,
    item?.academicYear?.id,
  ];
  for (const v of candidates) {
    if (v === null || v === undefined || v === "") continue;
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function normalizeStudyTerm(item: any): IStudyTerm {
  const localized = parseLocalizedNameFromModel(item);

  const ayRaw = item?.academic_year ?? item?.academicYear;
  let academic_year: IStudyTerm["academic_year"] = undefined;
  if (ayRaw && typeof ayRaw === "object") {
    const ayLoc = parseLocalizedNameFromModel(ayRaw);
    academic_year = {
      id: ayRaw?.id != null ? Number(ayRaw.id) : undefined,
      name: ayLoc.name,
      name_ar: ayLoc.name_ar,
      name_en: ayLoc.name_en,
    };
  }

  const academic_year_id = pickAcademicYearId(item);

  return {
    id: Number(item?.id) || 0,
    name: localized.name,
    name_ar: localized.name_ar,
    name_en: localized.name_en,
    academic_year_id,
    academic_year,
    is_active: Boolean(item?.is_active === true || Number(item?.is_active ?? 0) === 1),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
    message: item?.message ?? "",
  };
}

function buildStudyTermFormData(data: ICreateStudyTermPayload | IUpdateStudyTermPayload) {
  const fd = new FormData();
  fd.append("name[ar]", data.name_ar);
  fd.append("name[en]", data.name_en);
  fd.append("academic_year_id", String(data.academic_year_id));
  fd.append("is_active", data.is_active ? "1" : "0");
  return fd;
}

function pickStudyTermFromPayload(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.StudyTerm ??
    nested?.study_term ??
    nested?.data?.StudyTerm ??
    nested?.data?.study_term ??
    (Array.isArray(nested?.data) ? nested.data[0] : null) ??
    (nested?.id != null ? nested : null)
  );
}

export const studyTermsApi = createApi({
  reducerPath: "studyTermsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["StudyTerms", "StudyTerm"],
  endpoints: (builder) => ({
    getStudyTerms: builder.query<IStudyTerm[], void>({
      query: () => ({
        url: "/study-terms",
        method: "get",
        params: {
          page: 0,
          limit: 0,
        },
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw =
          (Array.isArray(d?.data) ? d.data : null) ??
          d?.data?.data ??
          d?.StudyTerms ??
          d?.study_terms ??
          d?.studyTerms ??
          d?.data ??
          d ??
          [];
        const list = Array.isArray(raw) ? raw : [];
        return list.map(normalizeStudyTerm);
      },
      providesTags: ["StudyTerms"],
    }),

    getStudyTermById: builder.query<IStudyTerm, number>({
      query: (id) => ({
        url: `/study-terms/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickStudyTermFromPayload(response);
        if (!raw) throw new Error("Study term data not found");
        return normalizeStudyTerm(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "StudyTerm", id }],
    }),

    createStudyTerm: builder.mutation<
      { message: string; data?: IStudyTerm },
      ICreateStudyTermPayload
    >({
      query: (data) => ({
        url: "/study-terms",
        method: "post",
        data: buildStudyTermFormData(data),
      }),
      invalidatesTags: ["StudyTerms"],
    }),

    updateStudyTerm: builder.mutation<
      { message: string; data?: IStudyTerm },
      { id: number; data: IUpdateStudyTermPayload }
    >({
      query: ({ id, data }) => ({
        url: `/study-terms/${id}`,
        method: "put",
        data: buildStudyTermFormData(data),
      }),
      invalidatesTags: (_r, _e, { id }) => ["StudyTerms", { type: "StudyTerm", id }],
    }),

    deleteStudyTerm: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/study-terms/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["StudyTerms"],
    }),

    toggleStudyTermStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/study-terms/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          studyTermsApi.util.updateQueryData(
            "getStudyTerms",
            undefined,
            (draft: IStudyTerm[]) => {
              const row = draft.find((c) => c.id === id);
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
      invalidatesTags: ["StudyTerms"],
    }),
  }),
});

export const {
  useGetStudyTermsQuery,
  useGetStudyTermByIdQuery,
  useCreateStudyTermMutation,
  useUpdateStudyTermMutation,
  useDeleteStudyTermMutation,
  useToggleStudyTermStatusMutation,
} = studyTermsApi;

