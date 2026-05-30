/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams } from "next/navigation";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import SharedExamForm from "@/components/exam/SharedExamForm";
import {
  useGetVideoExamQuery,
  useCreateVideoExamMutation,
  useUpdateVideoExamMutation,
} from "@/store/videoExams/videoExamsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import type { IVideoExamSavePayload } from "@/types/videoExam";
import type { ILessonExamQuestion } from "@/types/lessonExam";

function filterVideoQuestions(
  questions: ILessonExamQuestion[] | undefined,
): ILessonExamQuestion[] {
  return (questions ?? []).filter(
    (q) => q.type === "multiple_choice" || q.type === "true_false",
  );
}

export default function VideoExamForm() {
  const sessionReady = useSessionReady();
  const { lessonId: lessonIdParam, videoId: videoIdParam } = useParams<{
    lessonId: string;
    videoId: string;
  }>();
  const lang = LangUseParams() ?? "ar";
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const ex = translate?.pages.lessons.videoExam as Record<
    string,
    string | undefined
  >;

  const lessonId = Number(lessonIdParam);
  const videoId = Number(videoIdParam);
  const invalidId =
    lessonIdParam == null ||
    lessonIdParam === "" ||
    videoIdParam == null ||
    videoIdParam === "" ||
    Number.isNaN(lessonId) ||
    lessonId <= 0 ||
    Number.isNaN(videoId) ||
    videoId <= 0;

  const {
    data: exam,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetVideoExamQuery(videoId, {
    skip: !sessionReady || invalidId,
    refetchOnMountOrArgChange: true,
  });

  const is404 =
    isError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: unknown }).status === 404;

  const otherError = isError && !is404;

  const [createExam, { isLoading: creating }] = useCreateVideoExamMutation();
  const [updateExam, { isLoading: updating }] = useUpdateVideoExamMutation();

  const langPrefix = `/${lang}`;
  const videosBase = `${langPrefix}/lessons/videos/${lessonId}`;

  const examModel = exam
    ? {
        title: exam.title,
        max_attempts: exam.max_attempts,
        passing_percentage: exam.passing_percentage,
        is_active: exam.is_active,
        questions: filterVideoQuestions(exam.questions),
      }
    : undefined;

  return (
    <SharedExamForm
      examId={videoId}
      invalidId={invalidId}
      lang={lang}
      pageDir={pageDir}
      ex={ex}
      exam={examModel}
      isLoading={isLoading}
      isFetching={isFetching}
      is404={is404}
      otherError={otherError}
      isSaving={creating || updating}
      afterSavePath={`${videosBase}/exam/${videoId}`}
      backListPath={videosBase}
      allowedQuestionTypes={["multiple_choice", "true_false"]}
      onCreate={(payload) =>
        createExam({
          videoId,
          lessonId,
          payload: payload as IVideoExamSavePayload,
        }).unwrap()
      }
      onUpdate={(payload) =>
        updateExam({
          videoId,
          lessonId,
          payload: payload as IVideoExamSavePayload,
        }).unwrap()
      }
    />
  );
}
