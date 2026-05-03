/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  ILesson,
  ILessonVideo,
  ILessonAttachment,
  ICreateLessonPayload,
  IUpdateLessonPayload,
  ILessonVideoPayload,
} from "@/types/lesson";
import type { IApiMessageResponse } from "@/types/subject";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

function normalizeVideo(item: any): ILessonVideo {
  return {
    id: item?.id != null ? Number(item.id) : undefined,
    title: String(item?.title ?? ""),
    youtube_url: String(item?.youtube_url ?? item?.youtubeUrl ?? ""),
    is_active: Boolean(
      item?.is_active === true || Number(item?.is_active ?? 1) === 1
    ),
  };
}

function normalizeAttachment(item: any): ILessonAttachment {
  return {
    id: Number(item?.id) || 0,
    file_url: item?.file_url ?? item?.url ?? item?.path ?? "",
    name: item?.name ?? item?.original_name ?? "",
  };
}

function normalizeLesson(item: any): ILesson {
  const row = item?.lesson ?? item;
  const subjectRaw = row?.subject ?? row?.Subject;
  const doctorRaw = row?.doctor ?? row?.Doctor;

  let subject: ILesson["subject"] = undefined;
  if (subjectRaw && typeof subjectRaw === "object") {
    const loc = parseLocalizedNameFromModel(subjectRaw);
    subject = {
      id: subjectRaw?.id != null ? Number(subjectRaw.id) : undefined,
      name: loc.name,
      name_ar: loc.name_ar,
      name_en: loc.name_en,
    };
  }

  const doctor =
    doctorRaw && typeof doctorRaw === "object"
      ? {
          id: doctorRaw?.id != null ? Number(doctorRaw.id) : undefined,
          name: String(doctorRaw?.name ?? ""),
        }
      : undefined;

  const videosRaw = row?.videos ?? row?.lesson_videos ?? [];
  const attachmentsRaw = row?.attachments ?? row?.attachment_pdfs ?? [];

  return {
    id: Number(row?.id) || 0,
    lesson_number: String(row?.lesson_number ?? ""),
    title: String(row?.title ?? ""),
    brief_content: String(row?.brief_content ?? ""),
    content: String(row?.content ?? ""),
    subject_id: Number(row?.subject_id ?? subject?.id ?? 0),
    doctor_id: Number(row?.doctor_id ?? doctor?.id ?? 0),
    subject,
    doctor,
    videos: (Array.isArray(videosRaw) ? videosRaw : []).map(normalizeVideo),
    attachments: (Array.isArray(attachmentsRaw) ? attachmentsRaw : []).map(
      normalizeAttachment
    ),
    is_active: Boolean(
      row?.is_active === true || Number(row?.is_active ?? 0) === 1
    ),
    created_at: row?.created_at,
    updated_at: row?.updated_at,
    message: row?.message ?? "",
  };
}

function pickLessonFromPayload(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.Lesson ??
    nested?.lesson ??
    nested?.data?.Lesson ??
    nested?.data?.lesson ??
    (nested?.data && nested.data?.id != null ? nested.data : null) ??
    (nested?.id != null ? nested : null)
  );
}

function appendVideos(fd: FormData, videos: ILessonVideoPayload[]) {
  videos.forEach((v, i) => {
    if (v.id != null && v.id > 0) {
      fd.append(`videos[${i}][id]`, String(v.id));
    }
    fd.append(`videos[${i}][title]`, v.title);
    fd.append(`videos[${i}][youtube_url]`, v.youtube_url);
    fd.append(`videos[${i}][is_active]`, v.is_active ? "1" : "0");
  });
}

function appendLessonFields(
  fd: FormData,
  data: ICreateLessonPayload | IUpdateLessonPayload
) {
  fd.append("lesson_number", data.lesson_number);
  fd.append("title", data.title);
  fd.append("brief_content", data.brief_content);
  fd.append("content", data.content);
  fd.append("subject_id", String(data.subject_id));
  fd.append("doctor_id", String(data.doctor_id));
  fd.append("is_active", data.is_active ? "1" : "0");
  appendVideos(fd, data.videos);
  data.attachments.forEach((file) => {
    fd.append("attachments[]", file);
  });
}

function buildCreateLessonFormData(data: ICreateLessonPayload) {
  const fd = new FormData();
  appendLessonFields(fd, data);
  return fd;
}

function buildUpdateLessonFormData(data: IUpdateLessonPayload) {
  const fd = new FormData();
  fd.append("_method", "PUT");
  appendLessonFields(fd, data);
  return fd;
}

export const lessonsApi = createApi({
  reducerPath: "lessonsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Lessons", "Lesson"],
  endpoints: (builder) => ({
    getLessons: builder.query<ILesson[], void>({
      query: () => ({
        url: "/lessons",
        method: "get",
        params: { page: 0, limit: 0 },
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw =
          (Array.isArray(d?.data) ? d.data : null) ??
          d?.Lessons ??
          d?.lessons ??
          d?.data ??
          d ??
          [];
        return (Array.isArray(raw) ? raw : []).map(normalizeLesson);
      },
      providesTags: ["Lessons"],
    }),

    getLessonById: builder.query<ILesson, number>({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickLessonFromPayload(response);
        if (!raw) throw new Error("Lesson data not found");
        return normalizeLesson(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Lesson", id }],
    }),

    createLesson: builder.mutation<
      { message: string; data?: ILesson },
      ICreateLessonPayload
    >({
      query: (data) => ({
        url: "/lessons",
        method: "post",
        data: buildCreateLessonFormData(data),
      }),
      invalidatesTags: ["Lessons"],
    }),

    updateLesson: builder.mutation<
      { message: string; data?: ILesson },
      { id: number; data: IUpdateLessonPayload }
    >({
      query: ({ id, data }) => ({
        url: `/lessons/${id}`,
        method: "post",
        data: buildUpdateLessonFormData(data),
      }),
      invalidatesTags: (_r, _e, { id }) => ["Lessons", { type: "Lesson", id }],
    }),

    deleteLesson: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Lessons"],
    }),

    deleteLessonAttachment: builder.mutation<
      IApiMessageResponse,
      { lessonId: number; attachmentId: number }
    >({
      query: ({ lessonId, attachmentId }) => ({
        url: `/lessons/${lessonId}/attachments/${attachmentId}`,
        method: "delete",
      }),
      invalidatesTags: (_r, _e, { lessonId }) => [
        "Lessons",
        { type: "Lesson", id: lessonId },
      ],
    }),

    toggleLessonStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/lessons/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          lessonsApi.util.updateQueryData(
            "getLessons",
            undefined,
            (draft: ILesson[]) => {
              const row = draft.find((l) => l.id === id);
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
      invalidatesTags: ["Lessons"],
    }),
  }),
});

export const {
  useGetLessonsQuery,
  useGetLessonByIdQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useDeleteLessonAttachmentMutation,
  useToggleLessonStatusMutation,
} = lessonsApi;
