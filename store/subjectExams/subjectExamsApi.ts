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

export function normalizeSubjectExam(row: any): ISubjectExam {
  return normalizeExam(row, "subject_id") as ISubjectExam;
}

export const subjectExamsApi = createApi({
  reducerPath: "subjectExamsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["SubjectExam"],
  endpoints: (builder) => ({
    getSubjectExam: builder.query<ISubjectExam, number>({
      query: (subjectId) => ({
        url: `/subjects/${subjectId}/exam`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickExamRawFromResponse(response);
        if (raw == null) throw new Error("Exam data not found");
        return normalizeSubjectExam(raw);
      },
      providesTags: (_result, _err, subjectId) => [
        { type: "SubjectExam", id: subjectId },
      ],
    }),

    createSubjectExam: builder.mutation<
      { message?: string; data?: ISubjectExam },
      { subjectId: number; payload: ISubjectExamSavePayload }
    >({
      query: ({ subjectId, payload }) => ({
        url: `/subjects/${subjectId}/exam`,
        method: "post",
        data: buildExamFormData(payload),
      }),
      invalidatesTags: (_r, _e, { subjectId }) => [
        { type: "SubjectExam", id: subjectId },
      ],
    }),

    updateSubjectExam: builder.mutation<
      { message?: string; data?: ISubjectExam },
      { subjectId: number; payload: ISubjectExamSavePayload }
    >({
      query: ({ subjectId, payload }) => ({
        url: `/subjects/${subjectId}/exam`,
        method: "post",
        data: buildUpdateExamFormData(payload),
      }),
      invalidatesTags: (_r, _e, { subjectId }) => [
        { type: "SubjectExam", id: subjectId },
      ],
    }),

    deleteSubjectExam: builder.mutation<IApiMessageResponse, number>({
      query: (subjectId) => ({
        url: `/subjects/${subjectId}/exam`,
        method: "delete",
      }),
      invalidatesTags: (_r, _e, subjectId) => [
        { type: "SubjectExam", id: subjectId },
      ],
    }),
  }),
});

export const {
  useGetSubjectExamQuery,
  useCreateSubjectExamMutation,
  useUpdateSubjectExamMutation,
  useDeleteSubjectExamMutation,
} = subjectExamsApi;
