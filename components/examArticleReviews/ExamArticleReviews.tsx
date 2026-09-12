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
import {
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { IExamArticleReview } from "@/types/examArticleReview";

type StatusTab = "pending" | "reviewed" | "all";
type EvaluationFilter = "all" | "correct" | "incorrect";

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

  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [selectedExamable, setSelectedExamable] = useState<string>("all");
  const [evaluationFilter, setEvaluationFilter] =
    useState<EvaluationFilter>("all");

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

  const pendingCount = useMemo(
    () => reviews.filter((r) => !isReviewed(r)).length,
    [reviews],
  );

  const reviewedCount = useMemo(
    () => reviews.filter((r) => isReviewed(r)).length,
    [reviews],
  );

  const allCount = reviews.length;

  // Extract unique subjects / examable contexts with counts
  const examableOptions = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    reviews.forEach((r) => {
      const rawLabel =
        r.exam?.examable_label?.trim() || r.exam?.title?.trim() || "";
      if (!rawLabel) return;
      const existing = map.get(rawLabel);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(rawLabel, { label: rawLabel, count: 1 });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label, lang === "ar" ? "ar" : "en", {
        numeric: true,
      }),
    );
  }, [reviews, lang]);

  const isFiltered = selectedExamable !== "all" || evaluationFilter !== "all";

  const handleResetFilters = () => {
    setSelectedExamable("all");
    setEvaluationFilter("all");
  };

  // Filter list by status tab, selected subject/exam, and evaluation
  const filteredReviews = useMemo(() => {
    return reviews.filter((row) => {
      if (statusTab === "pending" && isReviewed(row)) return false;
      if (statusTab === "reviewed" && !isReviewed(row)) return false;

      if (selectedExamable !== "all") {
        const rowLabel =
          row.exam?.examable_label?.trim() || row.exam?.title?.trim() || "";
        if (rowLabel !== selectedExamable) return false;
      }

      if (evaluationFilter !== "all") {
        const correctness = getAnswerCorrectness(row);
        if (evaluationFilter === "correct" && correctness !== true)
          return false;
        if (evaluationFilter === "incorrect" && correctness !== false)
          return false;
      }

      return true;
    });
  }, [reviews, statusTab, selectedExamable, evaluationFilter]);

  const columns: Column<IExamArticleReview>[] = [
    {
      key: "student",
      header: headers.student,
      render: (_, row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-slate-800">
            {row.student.name}
          </span>
          {row.student.email ? (
            <span className="text-xs text-slate-400 font-normal">
              {row.student.email}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "exam",
      header: headers.exam ?? t?.examContext ?? "المادة / الاختبار",
      render: (_, row) => (
        <div className="flex max-w-64 flex-col gap-1">
          {row.exam?.examable_label ? (
            <span
              className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/70"
              title={row.exam.examable_label}
            >
              <BookOpen className="h-3 w-3 shrink-0 text-emerald-700" />
              <span className="truncate">{row.exam.examable_label}</span>
            </span>
          ) : null}
          {row.exam?.title &&
          row.exam.title !== row.exam?.examable_label ? (
            <span
              className="truncate text-xs font-medium text-slate-500"
              title={row.exam.title}
            >
              {row.exam.title}
            </span>
          ) : null}
          {!row.exam?.examable_label && !row.exam?.title ? (
            <span className="text-xs text-slate-400">—</span>
          ) : null}
        </div>
      ),
    },
    {
      key: "question_text",
      header: headers.question,
      render: (_, row) => (
        <span
          className="text-sm font-medium text-slate-700"
          title={questionLabel(row)}
        >
          {truncate(questionLabel(row))}
        </span>
      ),
    },
    {
      key: "article_answer",
      header: headers.answer,
      render: (_, row) => (
        <span
          className="text-sm text-slate-600"
          title={row.article_answer}
        >
          {truncate(row.article_answer)}
        </span>
      ),
    },
    {
      key: "submitted_at",
      header: headers.submittedAt,
      render: (val) => (
        <span className="text-xs font-medium tabular-nums text-slate-500">
          {val || "—"}
        </span>
      ),
    },
    {
      key: "article_review_status",
      header: headers.status,
      align: "center",
      render: (_, row) => {
        const reviewed = isReviewed(row);
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold",
              reviewed
                ? "bg-slate-50 text-slate-700 ring-1 ring-slate-200"
                : "bg-amber-50 text-amber-950 ring-1 ring-amber-200/70",
            )}
          >
            {reviewed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-amber-600" />
            )}
            {reviewStatusLabel(row, {
              reviewed: t?.reviewed,
              pendingReview: t?.pendingReview,
            })}
          </span>
        );
      },
    },
    {
      key: "evaluation" as any,
      header: headers.evaluation ?? t?.evaluation ?? "التقييم",
      align: "center",
      render: (_, row) => {
        const correctness = getAnswerCorrectness(row);
        if (!isReviewed(row)) {
          return (
            <span className="text-xs font-medium text-slate-400">—</span>
          );
        }
        if (correctness === true) {
          return (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/70">
              <Check className="h-3.5 w-3.5 text-emerald-700" />
              {t?.answerCorrect ?? "إجابة صحيحة"}
            </span>
          );
        }
        if (correctness === false) {
          return (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-900 ring-1 ring-red-200/70">
              <XCircle className="h-3.5 w-3.5 text-red-700" />
              {t?.answerIncorrect ?? "إجابة خاطئة"}
            </span>
          );
        }
        return <span className="text-xs font-medium text-slate-400">—</span>;
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
          title={t?.showTitle}
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
      reviewer: detail.reviewer?.name ? detail.reviewer : listRow.reviewer,
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
        <div className="space-y-4">
          {/* Controls Bar: Status Tabs + Filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-50/80 p-1.5 ring-1 ring-slate-200/80">
              <button
                type="button"
                onClick={() => setStatusTab("pending")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
                  statusTab === "pending"
                    ? "bg-white text-amber-900 shadow-sm ring-1 ring-amber-200/70"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                )}
              >
                <Clock className="h-4 w-4 text-amber-600" />
                <span>{t?.tabPending ?? "بانتظار المراجعة"}</span>
                <span
                  className={cn(
                    "inline-flex min-w-5 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums",
                    statusTab === "pending"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-slate-200/70 text-slate-600",
                  )}
                >
                  {pendingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusTab("reviewed")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
                  statusTab === "reviewed"
                    ? "bg-white text-emerald-900 shadow-sm ring-1 ring-emerald-200/70"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                )}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{t?.tabReviewed ?? "تمت المراجعة"}</span>
                <span
                  className={cn(
                    "inline-flex min-w-5 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums",
                    statusTab === "reviewed"
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-slate-200/70 text-slate-600",
                  )}
                >
                  {reviewedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusTab("all")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
                  statusTab === "all"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-300"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                )}
              >
                <span>{t?.tabAll ?? "جميع الإجابات"}</span>
                <span
                  className={cn(
                    "inline-flex min-w-5 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums",
                    statusTab === "all"
                      ? "bg-slate-200 text-slate-800"
                      : "bg-slate-200/70 text-slate-600",
                  )}
                >
                  {allCount}
                </span>
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Subject / Exam filter */}
              <div className="relative flex min-w-44 flex-1 sm:flex-initial">
                <select
                  value={selectedExamable}
                  onChange={(e) => setSelectedExamable(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                  title={t?.filterBySubject ?? "المادة / الاختبار"}
                >
                  <option value="all">
                    {t?.allSubjects ?? "جميع المواد والاختبارات"}
                  </option>
                  {examableOptions.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Evaluation Result filter (active when not in pending) */}
              {statusTab !== "pending" ? (
                <div className="relative flex min-w-36 flex-1 sm:flex-initial">
                  <select
                    value={evaluationFilter}
                    onChange={(e) =>
                      setEvaluationFilter(e.target.value as EvaluationFilter)
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                    title={t?.filterByResult ?? "التقييم"}
                  >
                    <option value="all">
                      {t?.allResults ?? "جميع النتائج"}
                    </option>
                    <option value="correct">
                      {t?.answerCorrect ?? "إجابة صحيحة"}
                    </option>
                    <option value="incorrect">
                      {t?.answerIncorrect ?? "إجابة خاطئة"}
                    </option>
                  </select>
                </div>
              ) : null}

              {/* Reset Filters button */}
              {isFiltered ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-10 gap-1.5 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                  <span>{t?.resetFilters ?? "إعادة ضبط"}</span>
                </Button>
              ) : null}
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={filteredReviews}
            columns={columns}
            isSkeleton={showSkeleton}
            searchPlaceholder={t?.searchPlaceholder}
            className={dash.dataTableOuter}
            tableCardClassName={dash.dataTableCard}
            tableHeaderClassName={dash.dataTableHeader}
          />
        </div>
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
                <p className="font-semibold text-slate-800">
                  <span>{t?.studentName}: </span>
                  <span>{activeRow.student.name}</span>
                </p>
                <p className="text-slate-400">
                  <span>{t?.studentEmail}: </span>
                  <span>{activeRow.student.email}</span>
                </p>
                {reviewed || activeRow.reviewer?.name ? (
                  <p className="font-semibold text-slate-800">
                    <span>{t?.reviewerName}: </span>
                    <span>{activeRow.reviewer?.name || "—"}</span>
                  </p>
                ) : null}
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
