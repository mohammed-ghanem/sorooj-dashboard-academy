/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useMemo, useState } from "react";
import { Column, DataTable } from "@/components/datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import { useSessionReady } from "@/hooks/useSessionReady";
import {
  useGetExamArticleReviewsQuery,
  useGetExamArticleReviewQuery,
  useReviewExamArticleMutation,
} from "@/store/examArticleReviews/examArticleReviewsApi";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, FileText, X, Check, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { IExamArticleReview } from "@/types/examArticleReview";

function isReviewed(row: IExamArticleReview) {
  return row.article_review_status === "reviewed";
}

function reviewStatusLabel(
  row: IExamArticleReview,
  labels: { reviewed?: string; pendingReview?: string },
) {
  return isReviewed(row) ? labels.reviewed : labels.pendingReview;
}

function getAnswerCorrectness(row: IExamArticleReview): boolean | null {
  if (!isReviewed(row)) return null;
  if (row.is_correct === true) return true;
  if (row.is_correct === false) return false;
  if (row.marks_awarded != null) {
    return row.marks_awarded > 0;
  }
  return null;
}

export default function ExamArticleReviews() {
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const headers = TABLE_HEADERS[lang as "ar" | "en"].examArticleReviews;
  const t = translate?.pages.examArticleReviews;

  const { data: reviews = [], isLoading } = useGetExamArticleReviewsQuery(
    undefined,
    { skip: !sessionReady },
  );

  const [showId, setShowId] = useState<number | null>(null);
  const { data: detail, isFetching: isDetailLoading } =
    useGetExamArticleReviewQuery(showId!, {
      skip: !sessionReady || showId == null,
    });

  const [reviewArticle, { isLoading: isReviewing }] =
    useReviewExamArticleMutation();

  const truncate = (text: string, limit = 80) =>
    text.length > limit ? text.slice(0, limit) + " .... " : text;

  const questionLabel = (row: IExamArticleReview) =>
    row.question_text || row.exam?.title || row.exam?.examable_label || "—";

  const handleReview = async (id: number, is_correct: 0 | 1) => {
    try {
      const res = await reviewArticle({ id, is_correct }).unwrap();
      toast.success(res?.message);
      setShowId(null);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          (messages as string[]).forEach((msg) => toast.error(msg)),
        );
        return;
      }
      toast.error(errorData?.message || "Error");
    }
  };

  const columns: Column<IExamArticleReview>[] = [
    {
      key: "student",
      header: headers.student,
      render: (_, row) => (
        <span className="font-medium text-slate-800">{row.student.name}</span>
      ),
    },
    {
      key: "question_text",
      header: headers.question,
      render: (_, row) => (
        <span className="text-sm text-slate-700">
          {truncate(questionLabel(row))}
        </span>
      ),
    },
    {
      key: "article_answer",
      header: headers.answer,
      render: (_, row) => (
        <span className="text-sm text-slate-600">
          {truncate(row.article_answer)}
        </span>
      ),
    },
    {
      key: "submitted_at",
      header: headers.submittedAt,
    },
    {
      key: "article_review_status",
      header: headers.status,
      align: "center",
      render: (_, row) => {
        const reviewed = isReviewed(row);
        return (
          <p
            className={`inline-flex rounded-lg px-2 py-1.5 text-xs font-semibold ${
              reviewed
                ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70"
                : "bg-amber-50 text-amber-950 ring-1 ring-amber-200/70"
            }`}
          >
            {reviewStatusLabel(row, {
              reviewed: t?.reviewed,
              pendingReview: t?.pendingReview,
            })}
          </p>
        );
      },
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, row) => (
        <Button
          type="button"
          size="sm"
          className={dash.tableView}
          onClick={() => setShowId(row.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  const listRow =
    showId != null ? reviews.find((r) => r.id === showId) : undefined;

  const activeRow = useMemo(() => {
    if (showId == null) return undefined;
    if (!listRow && !detail) return undefined;
    if (!detail) return listRow;
    if (!listRow) return detail;
    return {
      ...listRow,
      ...detail,
      question_text: detail.question_text || listRow.question_text,
      article_answer: detail.article_answer || listRow.article_answer,
      student: detail.student?.name ? detail.student : listRow.student,
      exam:
        detail.exam?.title || detail.exam?.examable_label
          ? detail.exam
          : listRow.exam,
      article_review_status:
        detail.article_review_status || listRow.article_review_status,
      is_correct:
        detail.is_correct !== null && detail.is_correct !== undefined
          ? detail.is_correct
          : listRow.is_correct,
      marks_awarded:
        detail.marks_awarded != null
          ? detail.marks_awarded
          : listRow.marks_awarded,
      marks_possible: detail.marks_possible ?? listRow.marks_possible,
    };
  }, [showId, listRow, detail]);

  const reviewed = activeRow ? isReviewed(activeRow) : false;
  const answerCorrectness = activeRow ? getAnswerCorrectness(activeRow) : null;
  const headerRow = activeRow ?? listRow;

  return (
    <>
      <IndexListPage
        icon={FileText}
        title={t?.listTitle ?? ""}
        description={t?.listDescription}
        createHref="#"
        createLabel=""
        showCreate={false}
        showSkeleton={showSkeleton}
        dir={pageDir}
      >
        <DataTable
          data={reviews}
          columns={columns}
          isSkeleton={showSkeleton}
          searchPlaceholder={t?.searchPlaceholder}
          className={dash.dataTableOuter}
          tableCardClassName={dash.dataTableCard}
          tableHeaderClassName={dash.dataTableHeader}
        />
      </IndexListPage>

      <Dialog open={showId != null} onOpenChange={() => setShowId(null)}>
        <DialogContent
          className="max-w-2xl rounded-2xl border-slate-200 [&>button]:hidden"
          dir={pageDir}
        >
          <DialogHeader className="flex flex-row items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-1 text-start">
              <DialogTitle className="text-lg font-bold text-slate-900">
                {t?.showTitle}
              </DialogTitle>
              {headerRow?.exam?.examable_label ? (
                <p className="text-sm font-medium leading-snug text-slate-600">
                  {headerRow.exam.examable_label}
                </p>
              ) : null}
            </div>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </DialogHeader>

          {isDetailLoading && !activeRow ? (
            <p className="py-8 text-center text-sm text-slate-500">
              {t?.loading}
            </p>
          ) : activeRow ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span>
                  {activeRow.exam?.title || activeRow.exam?.examable_label}
                </span>
              </div>
              <div>
                {/* student name */}
                <p className="font-semibold text-slate-800">
                  <span>{t?.studentName}: </span>
                  <span>{activeRow.student.name}</span>
                </p>
                <p className="text-slate-400">
                  <span>{t?.studentEmail}: </span>
                  <span>{activeRow.student.email}</span>
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <p
                  className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    reviewed
                      ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70"
                      : "bg-amber-50 text-amber-950 ring-1 ring-amber-200/70"
                  }`}
                >
                  {reviewStatusLabel(activeRow, {
                    reviewed: t?.reviewed,
                    pendingReview: t?.pendingReview,
                  })}
                </p>
                {reviewed && answerCorrectness !== null ? (
                  <p
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      answerCorrectness
                        ? "bg-sky-50 text-sky-900 ring-1 ring-sky-200/70"
                        : "bg-red-50 text-red-900 ring-1 ring-red-200/70"
                    }`}
                  >
                    {answerCorrectness ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {answerCorrectness ? t?.answerCorrect : t?.answerIncorrect}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-800">
                  {t?.questionLabel}
                </h3>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-800 ring-1 ring-slate-900/5">
                  <p className="whitespace-pre-wrap">
                    {questionLabel(activeRow)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-800">
                  {t?.answerLabel}
                </h3>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-800 ring-1 ring-slate-900/5">
                  <p className="whitespace-pre-wrap">
                    {activeRow.article_answer}
                  </p>
                </div>
              </div>

              {!reviewed ? (
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="inline-flex items-center gap-2 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                    disabled={isReviewing}
                    onClick={() => handleReview(activeRow.id, 0)}
                  >
                    <XCircle className="h-4 w-4" />
                    {t?.incorrectBtn}
                  </Button>
                  <Button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 shadow-sm hover:bg-emerald-700"
                    disabled={isReviewing}
                    onClick={() => handleReview(activeRow.id, 1)}
                  >
                    <Check className="h-4 w-4" />
                    {t?.correctBtn}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
