/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipboardList, HelpCircle, Plus, Trash2 } from "lucide-react";

import { useSessionReady } from "@/hooks/useSessionReady";
import LessonFormSkeleton from "@/components/skeleton/LessonFormSkeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

import "@/components/lessons/style.css";

import type {
  ILessonExamQuestion,
  LessonExamQuestionType,
} from "@/types/lessonExam";

export type SharedExamFormLabels = Record<string, string | undefined>;

export type SharedExamFormModel = {
  title: string;
  max_attempts: number;
  passing_percentage: number;
  is_active: boolean;
  questions: ILessonExamQuestion[];
};

export type SharedExamFormProps = {
  examId: number;
  invalidId: boolean;
  lang: string;
  pageDir: "rtl" | "ltr";
  ex: SharedExamFormLabels | undefined;
  exam: SharedExamFormModel | undefined;
  isLoading: boolean;
  isFetching: boolean;
  is404: boolean;
  otherError: boolean;
  isSaving: boolean;
  afterSavePath: string;
  backListPath: string;
  onCreate: (payload: {
    title: string;
    max_attempts: number;
    passing_percentage: number;
    is_active: boolean;
    questions: ILessonExamQuestion[];
  }) => Promise<{ message?: string } | unknown>;
  onUpdate: (payload: {
    title: string;
    max_attempts: number;
    passing_percentage: number;
    is_active: boolean;
    questions: ILessonExamQuestion[];
  }) => Promise<{ message?: string } | unknown>;
};

function newKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

type OptionRow = {
  key: string;
  id?: number;
  option_text: string;
  is_correct: boolean;
};

type QuestionRow = {
  key: string;
  id?: number;
  type: LessonExamQuestionType;
  question_text: string;
  marks: number;
  options?: OptionRow[];
  correct_boolean?: boolean;
};

function defaultMcOptions(): OptionRow[] {
  return [
    { key: newKey(), option_text: "", is_correct: true },
    { key: newKey(), option_text: "", is_correct: false },
  ];
}

/** Exactly one `is_correct` per multiple-choice row (radio semantics). */
function ensureSingleMcCorrect(options: OptionRow[]): OptionRow[] {
  const firstCorrect = options.findIndex((o) => o.is_correct);
  if (firstCorrect >= 0) {
    return options.map((o, i) => ({ ...o, is_correct: i === firstCorrect }));
  }
  if (!options.length) return options;
  return options.map((o, i) => ({ ...o, is_correct: i === 0 }));
}

function blankQuestionRow(
  type: LessonExamQuestionType = "multiple_choice",
): QuestionRow {
  const key = newKey();
  if (type === "multiple_choice") {
    return {
      key,
      type,
      question_text: "",
      marks: 1,
      options: defaultMcOptions(),
    };
  }
  if (type === "true_false") {
    return {
      key,
      type,
      question_text: "",
      marks: 1,
      correct_boolean: true,
    };
  }
  return { key, type: "article", question_text: "", marks: 1 };
}

function examQuestionsToRows(questions: ILessonExamQuestion[]): QuestionRow[] {
  if (!questions.length) {
    return [blankQuestionRow()];
  }
  return questions.map((q) => {
    const key = newKey();
    if (q.type === "multiple_choice") {
      const optsRaw =
        q.options && q.options.length >= 2
          ? q.options.map((o) => ({
              key: newKey(),
              id: o.id,
              option_text: o.option_text,
              is_correct: o.is_correct,
            }))
          : defaultMcOptions();
      const opts = ensureSingleMcCorrect(optsRaw);
      return {
        key,
        id: q.id,
        type: "multiple_choice",
        question_text: q.question_text,
        marks: q.marks || 1,
        options: opts,
      };
    }
    if (q.type === "true_false") {
      return {
        key,
        id: q.id,
        type: "true_false",
        question_text: q.question_text,
        marks: q.marks || 1,
        correct_boolean:
          q.correct_boolean !== undefined ? q.correct_boolean : true,
      };
    }
    return {
      key,
      id: q.id,
      type: "article",
      question_text: q.question_text,
      marks: q.marks || 1,
    };
  });
}

function rowsToPayload(rows: QuestionRow[]): ILessonExamQuestion[] {
  return rows.map((r) => {
    const base = {
      id: r.id,
      type: r.type,
      question_text: r.question_text.trim(),
      marks: r.marks,
    };
    if (r.type === "multiple_choice" && r.options) {
      return {
        ...base,
        options: r.options.map((o) => ({
          id: o.id,
          option_text: o.option_text.trim(),
          is_correct: o.is_correct,
        })),
      };
    }
    if (r.type === "true_false") {
      return { ...base, correct_boolean: Boolean(r.correct_boolean) };
    }
    return { ...base };
  });
}

export default function SharedExamForm({
  examId,
  invalidId,
  lang,
  pageDir,
  ex,
  exam,
  isLoading,
  isFetching,
  is404,
  otherError,
  isSaving,
  afterSavePath,
  backListPath,
  onCreate,
  onUpdate,
}: SharedExamFormProps) {
  const sessionReady = useSessionReady();
  const router = useRouter();

  const editMode = Boolean(exam) && !is404;

  const [title, setTitle] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [passingPct, setPassingPct] = useState(60);
  const [isActive, setIsActive] = useState(true);
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    blankQuestionRow(),
  ]);

  useEffect(() => {
    if (isLoading || isFetching) return;
    if (!exam || is404) return;
    setTitle(exam.title ?? "");
    setMaxAttempts(Math.max(1, exam.max_attempts));
    setPassingPct(exam.passing_percentage);
    setIsActive(exam.is_active);
    setQuestionRows(examQuestionsToRows(exam.questions ?? []));
  }, [exam, is404, isLoading, isFetching]);

  const addQuestion = () =>
    setQuestionRows((prev) => [...prev, blankQuestionRow()]);

  const removeQuestion = (key: string) => {
    setQuestionRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.key !== key),
    );
  };

  const patchQuestion = (key: string, patch: Partial<QuestionRow>) => {
    setQuestionRows((prev) =>
      prev.map((r) => {
        if (r.key !== key) return r;
        const nextType = patch.type ?? r.type;
        if (patch.type && patch.type !== r.type) {
          return { ...blankQuestionRow(patch.type), key: r.key, id: r.id };
        }
        return { ...r, ...patch, type: nextType };
      }),
    );
  };

  const addMcOption = (qKey: string) => {
    setQuestionRows((prev) =>
      prev.map((r) => {
        if (r.key !== qKey || r.type !== "multiple_choice") return r;
        const nextOpts = [
          ...(r.options ?? defaultMcOptions()),
          { key: newKey(), option_text: "", is_correct: false },
        ];
        return {
          ...r,
          options: ensureSingleMcCorrect(nextOpts),
        };
      }),
    );
  };

  const removeMcOption = (qKey: string, optKey: string) => {
    setQuestionRows((prev) =>
      prev.map((r) => {
        if (r.key !== qKey || r.type !== "multiple_choice" || !r.options)
          return r;
        if (r.options.length <= 2) return r;
        const nextOpts = r.options.filter((o) => o.key !== optKey);
        return {
          ...r,
          options: ensureSingleMcCorrect(nextOpts),
        };
      }),
    );
  };

  const setMcCorrectOption = (qKey: string, correctOptKey: string) => {
    setQuestionRows((prev) =>
      prev.map((r) => {
        if (r.key !== qKey || r.type !== "multiple_choice" || !r.options)
          return r;
        return {
          ...r,
          options: r.options.map((o) => ({
            ...o,
            is_correct: o.key === correctOptKey,
          })),
        };
      }),
    );
  };

  const patchMcOption = (
    qKey: string,
    optKey: string,
    patch: Partial<OptionRow>,
  ) => {
    setQuestionRows((prev) =>
      prev.map((r) => {
        if (r.key !== qKey || !r.options) return r;
        return {
          ...r,
          options: r.options.map((o) =>
            o.key === optKey ? { ...o, ...patch } : o,
          ),
        };
      }),
    );
  };

  const validatePayload = (): string | null => {
    const tTitle = title.trim();
    if (!tTitle)
      return lang === "ar"
        ? "يرجى إدخال عنوان الاختبار"
        : "Exam title is required";
    if (maxAttempts < 1)
      return lang === "ar"
        ? "الحد الأدنى لمحاولات واحد"
        : "Max attempts must be at least 1";
    if (passingPct < 0 || passingPct > 100)
      return lang === "ar"
        ? "نسبة النجاح بين ٠ و١٠٠"
        : "Passing percentage must be between 0 and 100";

    const rows = rowsToPayload(questionRows);
    if (!rows.length)
      return lang === "ar"
        ? "أضف سؤالاً واحداً على الأقل"
        : "Add at least one question";

    for (let i = 0; i < rows.length; i++) {
      const q = rows[i];
      if (!q.question_text.trim())
        return lang === "ar"
          ? `نص السؤال ${i + 1} فارغ`
          : `Question ${i + 1}: text is required`;
      if (!(q.marks >= 1))
        return lang === "ar"
          ? `درجة السؤال ${i + 1} يجب أن تكون على الأقل ١`
          : `Question ${i + 1}: marks must be at least 1`;
      if (q.type === "multiple_choice") {
        const opts = q.options ?? [];
        if (opts.length < 2)
          return lang === "ar"
            ? `سؤال اختيار من متعدد ${i + 1}: يحتاج خيارين على الأقل`
            : `Question ${i + 1}: add at least 2 choices`;
        if (opts.some((o) => !o.option_text.trim()))
          return lang === "ar"
            ? `سؤال ${i + 1}: كل الخيارات يجب أن يكون لها نص`
            : `Question ${i + 1}: all choices must have text`;
        if (!opts.some((o) => o.is_correct))
          return lang === "ar"
            ? `سؤال ${i + 1}: حدّد إجابة صحيحة واحدة على الأقل`
            : `Question ${i + 1}: select at least one correct choice`;
      }
    }
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errMsg = validatePayload();
    if (errMsg) {
      toast.error(errMsg);
      return;
    }

    const payload = {
      title: title.trim(),
      max_attempts: maxAttempts,
      passing_percentage: passingPct,
      is_active: isActive,
      questions: rowsToPayload(questionRows),
    };

    try {
      if (editMode) {
        const res = (await onUpdate(payload)) as { message?: string };
        toast.success(res?.message ?? ex?.saveSuccess ?? "");
      } else {
        const res = (await onCreate(payload)) as { message?: string };
        toast.success(res?.message ?? ex?.saveSuccess ?? "");
      }
      router.push(afterSavePath);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
        return;
      }
      if (errorData?.message) {
        toast.error(errorData.message);
        return;
      }
    }
  };

  if (invalidId) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center text-muted-foreground">
        {ex?.examNotFound}
      </div>
    );
  }

  if (otherError && !exam) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-4 text-center">
        <p className="text-muted-foreground">{ex?.loadError ?? ""}</p>
        <Button type="button" onClick={() => router.push(backListPath)}>
          {ex?.backList ?? ex?.backLessons ?? ex?.backSubjects ?? ""}
        </Button>
      </div>
    );
  }

  if (!sessionReady || isLoading || isFetching) {
    return <LessonFormSkeleton />;
  }

  const entityDescription =
    (editMode ? ex?.editDescription : ex?.createDescription) ??
    `${ex?.entityIdLabel ?? ex?.lessonIdLabel ?? ex?.subjectIdLabel ?? ""}: ${examId}`;

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.sectionIconWrap}>
              <ClipboardList className="h-6 w-6" strokeWidth={2} />
            </span>
            <span>{editMode ? ex?.editTitle : ex?.createTitle}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {entityDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-10 md:space-y-12">
            <section
              className={dash.sectionNeutral}
              aria-labelledby="exam-meta"
            >
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <HelpCircle className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="space-y-1 min-w-0">
                  <h2
                    id="exam-meta"
                    className="text-lg font-bold tracking-tight text-slate-900"
                  >
                    {ex?.sectionExamSetup}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {ex?.sectionExamSetupHint}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {ex?.examTitleField}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {ex?.maxAttempts}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    type="number"
                    min={1}
                    value={maxAttempts || ""}
                    onChange={(e) =>
                      setMaxAttempts(Number(e.target.value) || 1)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {ex?.passingPercentage}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    type="number"
                    min={0}
                    max={100}
                    value={passingPct}
                    onChange={(e) =>
                      setPassingPct(
                        Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                      )
                    }
                  />
                </div>
              </div>
            </section>

            <section
              aria-labelledby="exam-questions"
              className={dash.sectionVideos}
            >
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-start gap-4 min-w-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
                    <HelpCircle className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="space-y-1 min-w-0">
                    <h2
                      id="exam-questions"
                      className="text-lg font-bold text-slate-900"
                    >
                      {ex?.sectionQuestions}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {ex?.sectionQuestionsHint}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {questionRows.map((row, idx) => (
                  <div key={row.key} className={dash.videosCard}>
                    <div className="flex justify-between items-center gap-2 mb-4 flex-wrap">
                      <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-800 ring-1 ring-violet-100">
                        #{idx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeQuestion(row.key)}
                        disabled={questionRows.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-1">
                        <Label>{ex?.questionType}</Label>
                        <select
                          className={dash.select}
                          value={row.type}
                          onChange={(e) =>
                            patchQuestion(row.key, {
                              type: e.target.value as LessonExamQuestionType,
                            })
                          }
                        >
                          <option value="multiple_choice">
                            {ex?.typeMultipleChoice}
                          </option>
                          <option value="true_false">
                            {ex?.typeTrueFalse}
                          </option>
                          <option value="article">{ex?.typeArticle}</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <Label>{ex?.marks}</Label>
                        <Input
                          className={cn("h-10", dash.input)}
                          type="number"
                          min={1}
                          value={row.marks || ""}
                          onChange={(e) =>
                            patchQuestion(row.key, {
                              marks: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label>{ex?.questionText}</Label>
                      <Input
                        className={cn("h-10", dash.input)}
                        value={row.question_text}
                        onChange={(e) =>
                          patchQuestion(row.key, {
                            question_text: e.target.value,
                          })
                        }
                      />
                    </div>

                    {row.type === "true_false" && (
                      <div className="mt-4 space-y-3 rounded-lg border border-emerald-100/90 bg-emerald-50/15 p-3">
                        <div className="space-y-1 min-w-0">
                          <Label className="text-sm font-semibold">
                            {ex?.correctAnswer}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {ex?.correctChoiceGroup ?? ex?.correctChoice}
                          </p>
                        </div>
                        {/* —— True false correct option —— */}
                        <div className="flex flex-col gap-3">
                          <label
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 transition-opacity duration-200",
                              row.correct_boolean
                                ? "opacity-100"
                                : "opacity-40 hover:opacity-75",
                            )}
                            title={ex?.correctChoiceGroup ?? ex?.correctChoice}
                          >
                            <input
                              type="radio"
                              className="h-4 w-4 shrink-0 cursor-pointer accent-emerald-600"
                              name={`tf-correct-${row.key}`}
                              checked={row.correct_boolean}
                              onChange={() =>
                                patchQuestion(row.key, {
                                  correct_boolean: true,
                                })
                              }
                              aria-label={`${ex?.valueTrue} · ${ex?.correctAnswer ?? ""}`}
                            />
                            <span
                              className={cn(
                                "select-none text-sm font-semibold tracking-tight transition-colors",
                                row.correct_boolean
                                  ? "rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-900 shadow-sm ring-1 ring-emerald-200/90"
                                  : "rounded-lg border border-slate-200/70 bg-slate-50/50 px-2.5 py-1.5 text-slate-500 shadow-sm",
                              )}
                            >
                              {ex?.valueTrue}
                            </span>
                          </label>
                          <label
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 transition-opacity duration-200",
                              !row.correct_boolean
                                ? "opacity-100"
                                : "opacity-40 hover:opacity-75",
                            )}
                            title={ex?.correctChoiceGroup ?? ex?.correctChoice}
                          >
                            <input
                              type="radio"
                              className="h-4 w-4 shrink-0 cursor-pointer accent-emerald-600"
                              name={`tf-correct-${row.key}`}
                              checked={!row.correct_boolean}
                              onChange={() =>
                                patchQuestion(row.key, {
                                  correct_boolean: false,
                                })
                              }
                              aria-label={`${ex?.valueFalse} · ${ex?.correctAnswer ?? ""}`}
                            />
                            <span
                              className={cn(
                                "select-none text-sm font-semibold tracking-tight transition-colors",
                                !row.correct_boolean
                                  ? "rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-900 shadow-sm ring-1 ring-emerald-200/90"
                                  : "rounded-lg border border-slate-200/70 bg-slate-50/50 px-2.5 py-1.5 text-slate-500 shadow-sm",
                              )}
                            >
                              {ex?.valueFalse}
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {row.type === "multiple_choice" && row.options && (
                      <div className="mt-4 space-y-3 rounded-lg border border-violet-100/90 bg-violet-50/20 p-3">
                        <div className="flex flex-wrap justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <Label className="text-sm font-semibold">
                              {ex?.choicesHeading}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {ex?.correctChoiceGroup ?? ex?.correctChoice}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 border-violet-200"
                            onClick={() => addMcOption(row.key)}
                          >
                            <Plus className="w-3.5 h-3.5 me-1" />
                            {ex?.addChoice}
                          </Button>
                        </div>
                        {row.options.map((opt, oi) => (
                          <div
                            key={opt.key}
                            className="flex flex-col sm:flex-row sm:items-end gap-3 border-b border-violet-100/80 pb-3 last:border-0 last:pb-0"
                          >
                            <div className="flex-1 space-y-1 min-w-0">
                              <span className="text-xs font-medium text-slate-500">
                                #{oi + 1}
                              </span>
                              <Input
                                className={cn("h-9", dash.input)}
                                value={opt.option_text}
                                onChange={(e) =>
                                  patchMcOption(row.key, opt.key, {
                                    option_text: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div
                              className="flex items-center gap-2 shrink-0"
                              dir="ltr"
                            >
                              <label
                                className={cn(
                                  "flex cursor-pointer items-center gap-2.5 transition-opacity duration-200",
                                  opt.is_correct
                                    ? "opacity-100"
                                    : "opacity-40 hover:opacity-75",
                                )}
                                title={
                                  ex?.correctChoiceGroup ?? ex?.correctChoice
                                }
                              >
                                <input
                                  type="radio"
                                  className="h-4 w-4 shrink-0 cursor-pointer accent-emerald-600"
                                  name={`mc-correct-${row.key}`}
                                  checked={opt.is_correct}
                                  onChange={() =>
                                    setMcCorrectOption(row.key, opt.key)
                                  }
                                  aria-label={`${ex?.correctAnswerLabel ?? ex?.correctChoice ?? "Correct"} · #${oi + 1}`}
                                />
                                <span
                                  className={cn(
                                    "select-none text-sm font-semibold tracking-tight transition-colors",
                                    opt.is_correct
                                      ? "rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-900 shadow-sm ring-1 ring-emerald-200/90"
                                      : "rounded-lg border border-slate-200/70 bg-slate-50/50 px-2.5 py-1.5 text-slate-500 shadow-sm",
                                  )}
                                >
                                  {ex?.correctAnswerLabel ?? ex?.correctChoice}
                                </span>
                              </label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 shrink-0"
                                disabled={(row.options?.length ?? 0) <= 2}
                                onClick={() => removeMcOption(row.key, opt.key)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                className={`${dash.videoAddBtn} mt-4`}
                onClick={addQuestion}
              >
                <Plus className="w-4 h-4 me-1.5 opacity-90" />
                {ex?.addQuestion}
              </Button>
            </section>

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(Boolean(v))}
                />
                <span className="text-sm font-medium text-slate-800">
                  {ex?.isActiveExam}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-4 md:mt-0 md:justify-end">
                {/* <Button type="button" variant="outline" onClick={() => router.push(backListPath)}>
                  {ex?.cancelBtnForm ?? ex?.cancelBtn}
                </Button> */}
                <Button
                  type="submit"
                  disabled={isSaving}
                  className={dash.formSubmit}
                >
                  {isSaving ? ex?.processing : ex?.submitBtn}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
