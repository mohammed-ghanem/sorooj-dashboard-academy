"use client";

import { useGetVideoExamQuery } from "@/store/videoExams/videoExamsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import ExamActionsCell, {
  type ExamActionsUi,
} from "@/components/exam/ExamActionsCell";
import {
  ACADEMIC_LESSONS_BASE_PATH,
  lessonVideoExamHref,
} from "@/utils/lessonsPaths";

type Props = {
  videoId: number;
  lessonId: number;
  lang: string;
  examUi: ExamActionsUi | undefined;
  onDeleteExam: () => void | Promise<void>;
  lessonsBasePath?: string;
};

export default function VideoExamActionsCell({
  videoId,
  lessonId,
  lang,
  examUi,
  onDeleteExam,
  lessonsBasePath = ACADEMIC_LESSONS_BASE_PATH,
}: Props) {
  const sessionReady = useSessionReady();

  const { data, isError, error, isLoading, isFetching } =
    useGetVideoExamQuery(videoId, {
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
      groupLabel="Video exam"
      viewHref={lessonVideoExamHref(lang, lessonId, videoId, lessonsBasePath)}
      editHref={lessonVideoExamHref(
        lang,
        lessonId,
        videoId,
        lessonsBasePath,
        "/edit",
      )}
      hasExam={hasExam}
      loadFailed={loadFailed}
      isLoading={!sessionReady || isLoading || isFetching}
      onDeleteExam={onDeleteExam}
    />
  );
}
