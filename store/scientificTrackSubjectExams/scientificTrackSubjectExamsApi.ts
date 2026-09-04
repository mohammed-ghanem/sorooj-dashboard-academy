/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  ISubjectExam,
  ISubjectExamSavePayload,
} from "@/types/subjectExam";
import type { IApiMessageResponse } from "@/types/subject";
import { pickExamRawFromResponse } from "@/store/utils/pickExamFromApiResponse";
import {
  buildExamFormData,
  buildUpdateExamFormData,
  normalizeExam,
} from "@/store/utils/examApiUtils";
import { asResourceUpdate } from "@/lib/portal";

/**
 * Mirrors `subjectExamsApi` (academic subjects under study terms).
 * Only the resource path differs: `/scientific-track-subjects/{id}/exam`
 * instead of `/subjects/{id}/exam`.
 *
 * FormData is identical: title, max_attempts, passing_percentage, is_active,
 * questions[...] — parent id comes from the URL (same as academic).
 */
export function normalizeScientificTrackSubjectExam(row: any): ISubjectExam {
  return normalizeExam(row, "subject_id") as ISubjectExam;
}

export const scientificTrackSubjectExamsApi = createApi({
  reducerPath: "scientificTrackSubjectExamsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ScientificTrackSubjectExam"],
  endpoints: (builder) => ({
    getScientificTrackSubjectExam: builder.query<ISubjectExam, number>({
      query: (subjectId) => ({
        url: `/scientific-track-subjects/${subjectId}/exam`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickExamRawFromResponse(response);
        if (raw == null) throw new Error("Exam data not found");
        return normalizeScientificTrackSubjectExam(raw);
      },
      providesTags: (_result, _err, subjectId) => [
        { type: "ScientificTrackSubjectExam", id: subjectId },
      ],
    }),

    createScientificTrackSubjectExam: builder.mutation<
      { message?: string; data?: ISubjectExam },
      { subjectId: number; payload: ISubjectExamSavePayload }
    >({
      query: ({ subjectId, payload }) => ({
        url: `/scientific-track-subjects/${subjectId}/exam`,
        method: "post",
        data: buildExamFormData(payload),
      }),
      invalidatesTags: (_r, _e, { subjectId }) => [
        { type: "ScientificTrackSubjectExam", id: subjectId },
      ],
    }),

    updateScientificTrackSubjectExam: builder.mutation<
      { message?: string; data?: ISubjectExam },
      { subjectId: number; payload: ISubjectExamSavePayload }
    >({
      query: ({ subjectId, payload }) => ({
        url: `/scientific-track-subjects/${subjectId}/exam`,
        ...asResourceUpdate(buildUpdateExamFormData(payload)),
      }),
      invalidatesTags: (_r, _e, { subjectId }) => [
        { type: "ScientificTrackSubjectExam", id: subjectId },
      ],
    }),

    deleteScientificTrackSubjectExam: builder.mutation<
      IApiMessageResponse,
      number
    >({
      query: (subjectId) => ({
        url: `/scientific-track-subjects/${subjectId}/exam`,
        method: "delete",
      }),
      invalidatesTags: (_r, _e, subjectId) => [
        { type: "ScientificTrackSubjectExam", id: subjectId },
      ],
    }),
  }),
});

export const {
  useGetScientificTrackSubjectExamQuery,
  useCreateScientificTrackSubjectExamMutation,
  useUpdateScientificTrackSubjectExamMutation,
  useDeleteScientificTrackSubjectExamMutation,
} = scientificTrackSubjectExamsApi;
