"use client";

import Link from "next/link";
import { FileQuestion, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

export type ExamActionsUi = {
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
  examUi: ExamActionsUi | undefined;
  groupLabel?: string;
  viewHref: string;
  editHref: string;
  hasExam: boolean;
  loadFailed: boolean;
  isLoading: boolean;
  onDeleteExam: () => void | Promise<void>;
  onViewClick?: () => void;
  onCreateClick?: () => void;
  onEditClick?: () => void;
};

export default function ExamActionsCell({
  examUi,
  groupLabel = "Exam",
  viewHref,
  editHref,
  hasExam,
  loadFailed,
  isLoading,
  onDeleteExam,
  onViewClick,
  onCreateClick,
  onEditClick,
}: Props) {
  const btn =
    "rounded-xl shrink-0 h-8 w-9 p-0 text-white shadow-sm disabled:opacity-40 disabled:pointer-events-none";

  const wrapClass =
    "flex justify-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/90 w-full";

  if (isLoading) {
    return (
      <div className={wrapClass} aria-label={examUi?.groupAriaLabel ?? groupLabel}>
        <Skeleton className="h-8 w-9 rounded-xl shrink-0" />
        <Skeleton className="h-8 w-9 rounded-xl shrink-0" />
        <Skeleton className="h-8 w-9 rounded-xl shrink-0" />
      </div>
    );
  }

  const ViewBtn = onViewClick ? (
    <Button
      type="button"
      size="sm"
      className={`${btn} bg-sky-600 hover:bg-sky-700`}
      title={examUi?.tooltipExamView ?? ""}
      aria-label={examUi?.tooltipExamView ?? ""}
      onClick={onViewClick}
    >
      <FileQuestion className="h-4 w-4" />
    </Button>
  ) : (
    <Link href={viewHref}>
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
  );

  const CreateBtn = onCreateClick ? (
    <Button
      type="button"
      size="sm"
      className={`${btn} bg-indigo-600 hover:bg-indigo-700`}
      title={examUi?.tooltipExamCreate ?? ""}
      aria-label={examUi?.tooltipExamCreate ?? ""}
      onClick={onCreateClick}
    >
      <Plus className="h-4 w-4" />
    </Button>
  ) : (
    <Link href={editHref}>
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
  );

  const EditBtn = onEditClick ? (
    <Button
      type="button"
      size="sm"
      className={`${btn} bg-violet-600 hover:bg-violet-700`}
      title={examUi?.tooltipExamEdit ?? ""}
      aria-label={examUi?.tooltipExamEdit ?? ""}
      onClick={onEditClick}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  ) : (
    <Link href={editHref}>
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
  );

  if (loadFailed) {
    return (
      <div
        className={wrapClass}
        aria-label={examUi?.groupAriaLabel ?? groupLabel}
        title={examUi?.loadError ?? ""}
      >
        {ViewBtn}
        {CreateBtn}
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
    <div className={wrapClass} aria-label={examUi?.groupAriaLabel ?? groupLabel}>
      {ViewBtn}
      {!hasExam ? CreateBtn : EditBtn}
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
