/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type { ILessonExam, ILessonExamSavePayload } from "@/types/lessonExam";
import type { IApiMessageResponse } from "@/types/subject";
import { pickExamRawFromResponse } from "@/store/utils/pickExamFromApiResponse";
import {
  buildExamFormData,
  buildUpdateExamFormData,
  normalizeExam,
} from "@/store/utils/examApiUtils";

export function normalizeLessonExam(row: any): ILessonExam {
  return normalizeExam(row, "lesson_id");
}

export const lessonExamsApi = createApi({
  reducerPath: "lessonExamsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["LessonExam"],
  endpoints: (builder) => ({
    getLessonExam: builder.query<ILessonExam, number>({
      query: (lessonId) => ({
        url: `/lessons/${lessonId}/exam`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickExamRawFromResponse(response);
        if (raw == null) throw new Error("Exam data not found");
        return normalizeLessonExam(raw);
      },
      providesTags: (_result, _err, lessonId) => [
        { type: "LessonExam", id: lessonId },
      ],
    }),

    createLessonExam: builder.mutation<
      { message?: string; data?: ILessonExam },
      { lessonId: number; payload: ILessonExamSavePayload }
    >({
      query: ({ lessonId, payload }) => ({
        url: `/lessons/${lessonId}/exam`,
        method: "post",
        data: buildExamFormData(payload),
      }),
      invalidatesTags: (_r, _e, { lessonId }) => [
        { type: "LessonExam", id: lessonId },
      ],
    }),

    updateLessonExam: builder.mutation<
      { message?: string; data?: ILessonExam },
      { lessonId: number; payload: ILessonExamSavePayload }
    >({
      query: ({ lessonId, payload }) => ({
        url: `/lessons/${lessonId}/exam`,
        method: "post",
        data: buildUpdateExamFormData(payload),
      }),
      invalidatesTags: (_r, _e, { lessonId }) => [
        { type: "LessonExam", id: lessonId },
      ],
    }),

    deleteLessonExam: builder.mutation<IApiMessageResponse, number>({
      query: (lessonId) => ({
        url: `/lessons/${lessonId}/exam`,
        method: "delete",
      }),
      invalidatesTags: (_r, _e, lessonId) => [
        { type: "LessonExam", id: lessonId },
      ],
    }),
  }),
});

export const {
  useGetLessonExamQuery,
  useCreateLessonExamMutation,
  useUpdateLessonExamMutation,
  useDeleteLessonExamMutation,
} = lessonExamsApi;
