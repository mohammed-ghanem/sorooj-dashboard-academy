"use client";

import { useGetLessonExamQuery } from "@/store/lessonExams/lessonExamsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import ExamActionsCell, {
  type ExamActionsUi,
} from "@/components/exam/ExamActionsCell";
import {
  ACADEMIC_LESSONS_BASE_PATH,
  lessonExamHref,
} from "@/utils/lessonsPaths";

type Props = {
  lessonId: number;
  lang: string;
  examUi: ExamActionsUi | undefined;
  onDeleteExam: () => void | Promise<void>;
  /** Lessons index path: `academic-study/lessons` or `singleLearnPath/lessons` */
  lessonsBasePath?: string;
};

export default function LessonExamActionsCell({
  lessonId,
  lang,
  examUi,
  onDeleteExam,
  lessonsBasePath = ACADEMIC_LESSONS_BASE_PATH,
}: Props) {
  const sessionReady = useSessionReady();

  const { data, isError, error, isLoading, isFetching } =
    useGetLessonExamQuery(lessonId, {
      skip: !sessionReady,
    });

  const is404 =
    isError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: unknown }).status === 404;

  const hasExam = Boolean(data) && !is404;
  const loadFailed = isError && !is404;

  return (
    <ExamActionsCell
      examUi={examUi}
      groupLabel="Lesson exam"
      viewHref={lessonExamHref(lang, lessonId, lessonsBasePath)}
      editHref={lessonExamHref(lang, lessonId, lessonsBasePath, "/edit")}
      hasExam={hasExam}
      loadFailed={loadFailed}
      isLoading={!sessionReady || isLoading || isFetching}
      onDeleteExam={onDeleteExam}
    />
  );
}
