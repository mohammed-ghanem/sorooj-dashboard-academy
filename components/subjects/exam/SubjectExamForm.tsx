/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams } from "next/navigation";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import SharedExamForm from "@/components/exam/SharedExamForm";
import {
  useGetSubjectExamQuery,
  useCreateSubjectExamMutation,
  useUpdateSubjectExamMutation,
} from "@/store/subjectExams/subjectExamsApi";
import { useSessionReady } from "@/hooks/useSessionReady";

import type { ISubjectExamSavePayload } from "@/types/subjectExam";
import type { ILessonExamQuestion } from "@/types/lessonExam";

export default function SubjectExamForm() {
  const sessionReady = useSessionReady();
  const { subjectId: subjectIdParam } = useParams<{ subjectId: string }>();
  const lang = LangUseParams() ?? "ar";
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const ex = translate?.pages.subjects.subjectExam as Record<
    string,
    string | undefined
  >;

  const subjectId = Number(subjectIdParam);
  const invalidId =
    subjectIdParam == null ||
    subjectIdParam === "" ||
    Number.isNaN(subjectId) ||
    subjectId <= 0;

  const {
    data: exam,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetSubjectExamQuery(subjectId, {
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
    useCreateSubjectExamMutation();
  const [updateExam, { isLoading: updating }] =
    useUpdateSubjectExamMutation();

  const langPrefix = `/${lang}`;

  const examModel = exam
    ? {
        title: exam.title,
        max_attempts: exam.max_attempts,
        passing_percentage: exam.passing_percentage,
        is_active: exam.is_active,
        questions: exam.questions as unknown as ILessonExamQuestion[],
      }
    : undefined;

  return (
    <SharedExamForm
      examId={subjectId}
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
      afterSavePath={`${langPrefix}/subjects/exam/${subjectId}`}
      backListPath={`${langPrefix}/subjects`}
      onCreate={(payload) =>
        createExam({
          subjectId,
          payload: payload as ISubjectExamSavePayload,
        }).unwrap()
      }
      onUpdate={(payload) =>
        updateExam({
          subjectId,
          payload: payload as ISubjectExamSavePayload,
        }).unwrap()
      }
    />
  );
}
