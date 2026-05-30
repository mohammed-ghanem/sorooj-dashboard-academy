"use client";

import { useGetSubjectExamQuery } from "@/store/subjectExams/subjectExamsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import ExamActionsCell, {
  type ExamActionsUi,
} from "@/components/exam/ExamActionsCell";

type Props = {
  subjectId: number;
  lang: string;
  examUi: ExamActionsUi | undefined;
  onDeleteExam: () => void | Promise<void>;
};

export default function SubjectExamActionsCell({
  subjectId,
  lang,
  examUi,
  onDeleteExam,
}: Props) {
  const sessionReady = useSessionReady();

  const { data, isError, error, isLoading, isFetching } =
    useGetSubjectExamQuery(subjectId, {
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
      groupLabel="Subject exam"
      viewHref={`/${lang}/subjects/exam/${subjectId}`}
      editHref={`/${lang}/subjects/exam/${subjectId}/edit`}
      hasExam={hasExam}
      loadFailed={loadFailed}
      isLoading={!sessionReady || isLoading || isFetching}
      onDeleteExam={onDeleteExam}
    />
  );
}
