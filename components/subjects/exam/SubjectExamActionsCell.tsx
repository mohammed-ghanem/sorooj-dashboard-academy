"use client";

import Link from "next/link";
import { FileQuestion, Pencil, Plus, Trash2 } from "lucide-react";

import { useGetSubjectExamQuery } from "@/store/subjectExams/subjectExamsApi";
import { useSessionReady } from "@/hooks/useSessionReady";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

type ExamUi = {
  groupAriaLabel?: string;
  tooltipExamView?: string;
  tooltipExamCreate?: string;
  tooltipExamEdit?: string;
  tooltipExamDeleteDisabled?: string;
  loadError?: string;
  deleteTitle?: string;
  deleteMessage?: string;
  deleteBtn?: string;
  cancelBtn?: string;
};

type Props = {
  subjectId: number;
  lang: string;
  examUi: ExamUi | undefined;
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

  const btn =
    "rounded-xl shrink-0 h-8 w-9 p-0 text-white shadow-sm disabled:opacity-40 disabled:pointer-events-none";

  if (!sessionReady || isLoading || isFetching) {
    return (
      <div
        className="flex justify-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/90 w-full"
        aria-label={examUi?.groupAriaLabel ?? "Subject exam"}
      >
        <Skeleton className="h-8 w-9 rounded-xl shrink-0" />
        <Skeleton className="h-8 w-9 rounded-xl shrink-0" />
        <Skeleton className="h-8 w-9 rounded-xl shrink-0" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div
        className="flex justify-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/90 w-full"
        aria-label={examUi?.groupAriaLabel ?? "Subject exam"}
        title={examUi?.loadError ?? ""}
      >
        <Link href={`/${lang}/subjects/exam/${subjectId}`}>
          <Button
            type="button"
            size="sm"
            className={`${btn} bg-sky-600 hover:bg-sky-700`}
            title={examUi?.tooltipExamView ?? ""}
            aria-label={examUi?.tooltipExamView ?? ""}
          >
            <FileQuestion className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/${lang}/subjects/exam/${subjectId}/edit`}>
          <Button
            type="button"
            size="sm"
            className={`${btn} bg-indigo-600 hover:bg-indigo-700`}
            title={examUi?.tooltipExamCreate ?? ""}
            aria-label={examUi?.tooltipExamCreate ?? ""}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled
          className="h-8 w-9 p-0 rounded-xl shrink-0 border-amber-200 text-amber-700"
          title={examUi?.loadError ?? ""}
          aria-label={examUi?.loadError ?? ""}
        >
          ?
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex justify-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/90 w-full"
      aria-label={examUi?.groupAriaLabel ?? "Subject exam"}
    >
      <Link href={`/${lang}/subjects/exam/${subjectId}`}>
        <Button
          type="button"
          size="sm"
          className={`${btn} bg-sky-600 hover:bg-sky-700`}
          title={examUi?.tooltipExamView ?? ""}
          aria-label={examUi?.tooltipExamView ?? ""}
        >
          <FileQuestion className="h-4 w-4" />
        </Button>
      </Link>

      {!hasExam ? (
        <Link href={`/${lang}/subjects/exam/${subjectId}/edit`}>
          <Button
            type="button"
            size="sm"
            className={`${btn} bg-indigo-600 hover:bg-indigo-700`}
            title={examUi?.tooltipExamCreate ?? ""}
            aria-label={examUi?.tooltipExamCreate ?? ""}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Link href={`/${lang}/subjects/exam/${subjectId}/edit`}>
          <Button
            type="button"
            size="sm"
            className={`${btn} bg-violet-600 hover:bg-violet-700`}
            title={examUi?.tooltipExamEdit ?? ""}
            aria-label={examUi?.tooltipExamEdit ?? ""}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      )}

      {hasExam ? (
        <DeleteConfirmDialog
          title={examUi?.deleteTitle ?? ""}
          description={examUi?.deleteMessage ?? ""}
          confirmText={examUi?.deleteBtn ?? ""}
          cancelText={examUi?.cancelBtn ?? ""}
          onConfirm={onDeleteExam}
        />
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled
          className="h-8 w-9 p-0 rounded-xl shrink-0 border-slate-200 text-slate-400"
          title={examUi?.tooltipExamDeleteDisabled ?? ""}
          aria-label={examUi?.tooltipExamDeleteDisabled ?? ""}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
