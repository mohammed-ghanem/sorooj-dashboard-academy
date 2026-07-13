/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, usePathname, useSearchParams } from "next/navigation";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import SharedExamForm from "@/components/exam/SharedExamForm";
import {
  useGetLessonExamQuery,
  useCreateLessonExamMutation,
  useUpdateLessonExamMutation,
} from "@/store/lessonExams/lessonExamsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import {
  LESSONS_LIST_QUERY_KEY,
  lessonExamHref,
  resolveLessonsBaseFromPathname,
} from "@/utils/lessonsPaths";

import type { ILessonExamSavePayload } from "@/types/lessonExam";

export default function LessonExamForm() {
  const sessionReady = useSessionReady();
  const { lessonId: lessonIdParam } = useParams<{ lessonId: string }>();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const lang = LangUseParams() ?? "ar";
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const lessonsBasePath = resolveLessonsBaseFromPathname(
    pathname,
    lang,
    searchParams.get(LESSONS_LIST_QUERY_KEY),
  );

  const ex = translate?.pages.lessons.lessonExam as Record<
    string,
    string | undefined
  >;

  const lessonId = Number(lessonIdParam);
  const invalidId =
    lessonIdParam == null ||
    lessonIdParam === "" ||
    Number.isNaN(lessonId) ||
    lessonId <= 0;

  const {
    data: exam,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetLessonExamQuery(lessonId, {
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

  const [createExam, { isLoading: creating }] =
    useCreateLessonExamMutation();
  const [updateExam, { isLoading: updating }] =
    useUpdateLessonExamMutation();

  return (
    <SharedExamForm
      examId={lessonId}
      invalidId={invalidId}
      lang={lang}
      pageDir={pageDir}
      ex={ex}
      exam={exam}
      isLoading={isLoading}
      isFetching={isFetching}
      is404={is404}
      otherError={otherError}
      isSaving={creating || updating}
      afterSavePath={lessonExamHref(lang, lessonId, lessonsBasePath)}
      backListPath={`/${lang}/${lessonsBasePath}`}
      onCreate={(payload) =>
        createExam({
          lessonId,
          payload: payload as ILessonExamSavePayload,
        }).unwrap()
      }
      onUpdate={(payload) =>
        updateExam({
          lessonId,
          payload: payload as ILessonExamSavePayload,
        }).unwrap()
      }
    />
  );
}
