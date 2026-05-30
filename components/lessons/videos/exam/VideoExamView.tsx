/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { ClipboardCheck, Eye, Pencil } from "lucide-react";

import { useGetVideoExamQuery } from "@/store/videoExams/videoExamsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";

import {
  Card,
  CardContent,
  CardHeader, 
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import LessonFormSkeleton from "@/components/skeleton/LessonFormSkeleton";

import "@/components/lessons/style.css";

export default function VideoExamView() {
  const sessionReady = useSessionReady();
  const { lessonId: lessonIdParam, videoId: videoIdParam } = useParams<{
    lessonId: string;
    videoId: string;
  }>();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const ex = translate?.pages.lessons.videoExam;
  const pg = translate?.pages.lessons;

  const lessonId = Number(lessonIdParam);
  const videoId = Number(videoIdParam);
  const invalidId =
    lessonIdParam == null ||
    lessonIdParam === "" ||
    videoIdParam == null ||
    videoIdParam === "" ||
    Number.isNaN(lessonId) ||
    lessonId <= 0 ||
    Number.isNaN(videoId) ||
    videoId <= 0;

  const videosBase = `/${lang}/lessons/videos/${lessonId}`;
  const examBase = `${videosBase}/exam/${videoId}`;

  const { data: exam, isLoading, isError, error } = useGetVideoExamQuery(
    videoId,
    { skip: !sessionReady || invalidId },
  );

  const is404 =
    isError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: unknown }).status === 404;

  const otherErr = isError && !is404;

  const fieldBox =
    "mt-1 text-sm rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-sm ring-1 ring-slate-900/4";

  const displayQuestions = (exam?.questions ?? []).filter(
    (q) => q.type === "multiple_choice" || q.type === "true_false",
  );

  if (!sessionReady) {
    return <LessonFormSkeleton />;
  }

  if (invalidId) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center text-muted-foreground">
        {ex?.examNotFound ?? ex?.lessonNotFound}
      </div>
    );
  }

  if (isLoading && !is404 && !exam) {
    return <LessonFormSkeleton />;
  }

  if (otherErr) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-4 text-center">
        <p className="text-muted-foreground">{ex?.loadError}</p>
        <Button type="button" variant="outline" onClick={() => router.push(videosBase)}>
          {ex?.backVideos ?? pg?.viewLesson?.backBtn}
        </Button>
      </div>
    );
  }

  if (is404 || !exam) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <Eye className="h-8 w-8 opacity-70" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">{ex?.noExamTitle}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {ex?.noExamDescription}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => router.push(`${examBase}/edit`)}>
            {ex?.createExamBtn}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(videosBase)}>
            {ex?.backVideos ?? pg?.viewLesson?.backBtn}
          </Button>
        </div>
      </div>
    );
  }

  const pageDir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="w-full mx-auto py-10 px-4 md:px-4" dir={pageDir}>
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
        <CardHeader className="space-y-3 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-violet-50/35 pb-8 pt-8 md:pt-10 md:pb-10 px-6 md:px-10">
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-100 to-indigo-50 text-violet-800 shadow-inner ring-1 ring-violet-200/60">
              <ClipboardCheck className="w-6 h-6" />
            </span>
            <div className="space-y-2 min-w-0">
              <span className="leading-tight block">{ex?.viewTitle}</span>
              <CardDescription className="text-base text-slate-600 leading-relaxed">
                {exam.title}
              </CardDescription>
            </div>
          </CardTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant={exam.is_active ? "default" : "secondary"}>
              {exam.is_active ? ex?.activeExam : ex?.inactiveExam}
            </Badge>
            <span className="text-xs text-muted-foreground self-center">
              {ex?.videoIdLabel}: #{videoId}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-8 md:px-10 md:py-10 space-y-8">
          <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 md:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="font-semibold text-slate-800">
                  {ex?.maxAttempts}
                </Label>
                <div className={fieldBox}>{exam.max_attempts}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {ex?.passingPercentage}
                </Label>
                <div className={fieldBox}>{exam.passing_percentage}%</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {ex?.questionsCountLabel}
                </Label>
                <div className={fieldBox}>{displayQuestions.length}</div>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-6">
            <Label className="text-lg font-bold text-slate-900">
              {ex?.sectionQuestions}
            </Label>
            <div className="space-y-4">
              {displayQuestions.map((q, i) => (
                <Card
                  key={q.id ?? i}
                  className="rounded-2xl border-violet-200/70 bg-violet-50/20 shadow-sm"
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-violet-800 bg-violet-100 px-2 py-1 rounded-md">
                        #{i + 1} ·{" "}
                        {q.type === "multiple_choice"
                          ? ex?.typeMultipleChoice
                          : ex?.typeTrueFalse}
                      </span>
                      <Badge variant="outline">{q.marks}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 whitespace-pre-wrap">
                      {q.question_text || "—"}
                    </p>
                    {q.type === "multiple_choice" && q.options?.length ? (
                      <ul className="space-y-2 ms-3">
                        {q.options.map((o, j) => (
                          <li
                            key={o.id ?? j}
                            className="flex gap-2 text-sm items-start"
                          >
                            <span className="text-violet-600 font-semibold shrink-0">
                              {String.fromCharCode(65 + j)}.
                            </span>
                            <span
                              className={
                                o.is_correct ? "font-semibold text-white bg-green-700 px-2 py-0.5 rounded-md" : ""
                              }
                            >
                              {o.option_text}
                              {o.is_correct ? ` (${ex?.correctChoiceBadge})` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {q.type === "true_false" ? (
                      <div className={fieldBox}>
                        {ex?.correctAnswer}:{" "}
                        <strong className="text-white bg-green-700 px-2 py-0.5 rounded-md">
                          {q.correct_boolean ? ex?.valueTrue : ex?.valueFalse}
                        </strong>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
              onClick={() => router.push(`${examBase}/edit`)}
            >
              <Pencil className="w-4 h-4 me-2" />
              {ex?.editExamBtn}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(videosBase)}>
              {ex?.backVideos ?? pg?.viewLesson?.backBtn}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
