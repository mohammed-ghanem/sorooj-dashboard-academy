/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type { IVideoExam, IVideoExamSavePayload } from "@/types/videoExam";
import type { IApiMessageResponse } from "@/types/subject";
import { pickExamRawFromResponse } from "@/store/utils/pickExamFromApiResponse";
import {
  buildExamFormData,
  buildUpdateExamFormData,
  normalizeExam,
} from "@/store/utils/examApiUtils";
import { lessonVideosApi } from "@/store/lessonVideos/lessonVideosApi";
import type { AppDispatch } from "@/store/store";

type QueryPatchResult = { undo: () => void };

function patchLessonVideoHasExam(
  dispatch: AppDispatch,
  lessonId: number | undefined,
  videoId: number,
  hasExam: boolean,
): QueryPatchResult | undefined {
  if (lessonId == null || lessonId <= 0) return undefined;
  return dispatch(
    lessonVideosApi.util.updateQueryData(
      "getLessonVideos",
      lessonId,
      (draft) => {
        const video = draft.videos.find((v) => v.id === videoId);
        if (video) video.has_exam = hasExam;
      },
    ),
  );
}

export function normalizeVideoExam(row: any): IVideoExam {
  return normalizeExam(row, "lesson_video_id") as IVideoExam;
}

export const videoExamsApi = createApi({
  reducerPath: "videoExamsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["VideoExam", "LessonVideos"],
  endpoints: (builder) => ({
    getVideoExam: builder.query<IVideoExam, number>({
      query: (videoId) => ({
        url: `/lesson-videos/${videoId}/exam`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickExamRawFromResponse(response);
        if (raw == null) throw new Error("Exam data not found");
        return normalizeVideoExam(raw);
      },
      providesTags: (_result, _err, videoId) => [
        { type: "VideoExam", id: videoId },
      ],
    }),

    createVideoExam: builder.mutation<
      { message?: string; data?: IVideoExam },
      { videoId: number; lessonId?: number; payload: IVideoExamSavePayload }
    >({
      query: ({ videoId, payload }) => ({
        url: `/lesson-videos/${videoId}/exam`,
        method: "post",
        data: buildExamFormData(payload),
      }),
      async onQueryStarted(
        { videoId, lessonId },
        { dispatch, queryFulfilled },
      ) {
        const patch = patchLessonVideoHasExam(
          dispatch,
          lessonId,
          videoId,
          true,
        );
        try {
          await queryFulfilled;
        } catch {
          patch?.undo?.();
        }
      },
      invalidatesTags: (_r, _e, { videoId, lessonId }) => [
        { type: "VideoExam", id: videoId },
        ...(lessonId != null
          ? [{ type: "LessonVideos" as const, id: lessonId }]
          : []),
      ],
    }),

    updateVideoExam: builder.mutation<
      { message?: string; data?: IVideoExam },
      { videoId: number; lessonId?: number; payload: IVideoExamSavePayload }
    >({
      query: ({ videoId, payload }) => ({
        url: `/lesson-videos/${videoId}/exam`,
        method: "post",
        data: buildUpdateExamFormData(payload),
      }),
      invalidatesTags: (_r, _e, { videoId, lessonId }) => [
        { type: "VideoExam", id: videoId },
        ...(lessonId != null
          ? [{ type: "LessonVideos" as const, id: lessonId }]
          : []),
      ],
    }),

    deleteVideoExam: builder.mutation<
      IApiMessageResponse,
      { videoId: number; lessonId?: number }
    >({
      query: ({ videoId }) => ({
        url: `/lesson-videos/${videoId}/exam`,
        method: "delete",
      }),
      async onQueryStarted(
        { videoId, lessonId },
        { dispatch, queryFulfilled },
      ) {
        const patch = patchLessonVideoHasExam(
          dispatch,
          lessonId,
          videoId,
          false,
        );
        try {
          await queryFulfilled;
          if (lessonId != null) {
            dispatch(
              lessonVideosApi.util.invalidateTags([
                { type: "LessonVideos", id: lessonId },
              ]),
            );
          }
        } catch {
          patch?.undo?.();
        }
      },
      invalidatesTags: (_r, _e, { videoId, lessonId }) => [
        { type: "VideoExam", id: videoId },
        ...(lessonId != null
          ? [{ type: "LessonVideos" as const, id: lessonId }]
          : []),
      ],
    }),
  }),
});

export const {
  useGetVideoExamQuery,
  useCreateVideoExamMutation,
  useUpdateVideoExamMutation,
  useDeleteVideoExamMutation,
} = videoExamsApi;
