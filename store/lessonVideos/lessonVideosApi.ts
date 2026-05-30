/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type { ILessonVideoListItem, ILessonVideosIndex } from "@/types/lessonVideo";

function normalizeVideoItem(item: any): ILessonVideoListItem {
  return {
    id: Number(item?.id),
    lesson_id: Number(item?.lesson_id ?? item?.lessonId ?? 0),
    title: String(item?.title ?? ""),
    youtube_url: String(item?.youtube_url ?? item?.youtubeUrl ?? ""),
    order_index:
      item?.order_index != null
        ? Number(item.order_index)
        : item?.orderIndex != null
          ? Number(item.orderIndex)
          : undefined,
    is_active: Boolean(
      item?.is_active === true || Number(item?.is_active ?? 0) === 1,
    ),
    has_exam: Boolean(
      item?.has_exam === true || Number(item?.has_exam ?? 0) === 1,
    ),
    created_at: item?.created_at ? String(item.created_at) : undefined,
    updated_at: item?.updated_at ? String(item.updated_at) : undefined,
  };
}

function pickLessonVideosPayload(response: any): ILessonVideosIndex {
  const outer = response?.data ?? response;
  const lessonRaw =
    outer?.lesson ?? outer?.Lesson ?? outer?.data?.lesson ?? {};
  const videosRaw =
    outer?.videos ??
    outer?.Videos ??
    outer?.lesson_videos ??
    outer?.lessonVideos ??
    [];

  const videosList = Array.isArray(videosRaw)
    ? videosRaw
    : videosRaw && typeof videosRaw === "object"
      ? Object.values(videosRaw)
      : [];

  return {
    lesson: {
      id: Number(lessonRaw?.id ?? 0),
      title: String(lessonRaw?.title ?? ""),
      lesson_number: String(
        lessonRaw?.lesson_number ?? lessonRaw?.lessonNumber ?? "",
      ),
    },
    videos: videosList.map(normalizeVideoItem),
  };
}

export const lessonVideosApi = createApi({
  reducerPath: "lessonVideosApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["LessonVideos"],
  endpoints: (builder) => ({
    getLessonVideos: builder.query<ILessonVideosIndex, number>({
      query: (lessonId) => ({
        url: `/lessons/${lessonId}/videos`,
        method: "get",
      }),
      transformResponse: (response: any) => pickLessonVideosPayload(response),
      providesTags: (_result, _err, lessonId) => [
        { type: "LessonVideos", id: lessonId },
      ],
    }),
  }),
});

export const { useGetLessonVideosQuery } = lessonVideosApi;
