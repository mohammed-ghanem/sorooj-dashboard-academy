"use client";

import { useGetVideoExamQuery } from "@/store/videoExams/videoExamsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import ExamActionsCell, {
  type ExamActionsUi,
} from "@/components/exam/ExamActionsCell";

type Props = {
  videoId: number;
  lessonId: number;
  lang: string;
  examUi: ExamActionsUi | undefined;
  onDeleteExam: () => void | Promise<void>;
};

export default function VideoExamActionsCell({
  videoId,
  lessonId,
  lang,
  examUi,
  onDeleteExam,
}: Props) {
  const sessionReady = useSessionReady();
  const base = `/${lang}/lessons/videos/${lessonId}/exam/${videoId}`;

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
      viewHref={base}
      editHref={`${base}/edit`}
      hasExam={hasExam}
      loadFailed={loadFailed}
      isLoading={!sessionReady || isLoading || isFetching}
      onDeleteExam={onDeleteExam}
    />
  );
}
