/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Eye,
  FileStack,
  PlaySquare,
  ClipboardList,
  FileText,
} from "lucide-react";

import { useGetSubjectsQuery } from "@/store/subjects/subjectsApi";
import { useGetLessonByIdQuery } from "@/store/lessons/lessonsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import LangUseParams from "@/translate/LangUseParams";

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
import TranslateHook from "@/translate/TranslateHook";
import ViewLessonSkeleton from "@/components/skeleton/ViewLessonSkeleton";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

import "ckeditor5/ckeditor5.css";
import "@/components/ckEditor/style.css";
import "./style.css";

export default function ViewLesson() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const lessonId = Number(id);

  const { data: subjects = [] } = useGetSubjectsQuery(undefined, {
    skip: !sessionReady,
  });

  const { data: lesson, isLoading, isError } = useGetLessonByIdQuery(
    lessonId,
    {
      skip: !sessionReady || !id || Number.isNaN(lessonId),
    },
  );

  const displaySubject = useMemo(() => {
    if (!lesson) return "—";
    const nested = lesson.subject;
    if (nested) {
      const loc = parseLocalizedNameFromModel(nested);
      return lang === "ar"
        ? loc.name_ar || loc.name || loc.name_en || "—"
        : loc.name_en || loc.name || loc.name_ar || "—";
    }
    const row = subjects.find((s) => s.id === lesson.subject_id);
    if (row) {
      const loc = parseLocalizedNameFromModel(row);
      return lang === "ar" ? loc.name_ar || loc.name : loc.name_en || loc.name;
    }
    return lesson.subject_id ? `#${lesson.subject_id}` : "—";
  }, [lesson, subjects, lang]);

  const displayDoctor = useMemo(() => {
    if (!lesson) return "—";
    const n = lesson.doctor?.name?.trim();
    if (n) return n;
    return lesson.doctor_id ? `#${lesson.doctor_id}` : "—";
  }, [lesson]);

  if (!sessionReady || isLoading) {
    return <ViewLessonSkeleton />;
  }

  if (isError || !lesson) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center text-muted-foreground">
        {translate?.pages.lessons.viewLesson.notFound}
      </div>
    );
  }

  const attachments = lesson.attachments ?? [];
  const videos = lesson.videos ?? [];
  const vl = translate?.pages.lessons.viewLesson;

  const fieldBox =
    "mt-1 text-sm rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-sm ring-1 ring-slate-900/4";

  return (
    <div className="w-full mx-auto py-10 px-4 md:px-4">
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
        <CardHeader className="space-y-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 pb-8 pt-8 md:pt-10 md:pb-10 px-6 md:px-10">
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-800 shadow-inner ring-1 ring-emerald-200/60">
              <Eye className="w-6 h-6" />
            </span>
            <div className="space-y-2 min-w-0">
              <span className="leading-tight block">{vl?.title}</span>
              <CardDescription className="text-base text-slate-600 leading-relaxed">
                {vl?.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 py-8 md:px-10 md:py-10 space-y-10">
          <section className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/15 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3">
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100">
                <ClipboardList className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="text-lg font-bold text-slate-900">
                {vl?.sectionBasics}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold text-slate-800">
                  {vl?.lessonNumber}
                </Label>
                <div className={fieldBox}>{lesson.lesson_number || "—"}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {vl?.titleField}
                </Label>
                <div className={fieldBox}>{lesson.title || "—"}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/25 via-white to-teal-50/15 p-6 md:p-8 shadow-sm ring-1 ring-emerald-900/5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100">
                <FileText className="h-5 w-5" />
              </span>
              <Label className="font-bold text-slate-900 text-base">
                {vl?.content}
              </Label>
            </div>
            {lesson.content?.trim() ? (
              <div
                className="lesson-view-html ck-content mt-2 text-sm px-4 py-4 max-w-none overflow-x-auto min-h-12"
                dir={lang === "ar" ? "rtl" : "ltr"}
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            ) : (
              <div className={`${fieldBox} mt-2 text-muted-foreground`}>—</div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold text-slate-800">
                  {vl?.subject}
                </Label>
                <div className={fieldBox}>{displaySubject}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {vl?.doctor}
                </Label>
                <div className={fieldBox}>{displayDoctor}</div>
              </div>
            </div>
          </section>

          <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          <section className="rounded-2xl border-2 border-violet-200/70 bg-gradient-to-b from-violet-50/45 via-white to-white p-6 md:p-8 shadow-md shadow-violet-950/6 ring-1 ring-violet-900/4">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20">
                <PlaySquare className="h-5 w-5" />
              </span>
              <Label className="font-bold text-slate-900 text-base">
                {vl?.videos}
              </Label>
            </div>
            {videos.length === 0 ? (
              <div className={fieldBox}>—</div>
            ) : (
              <ul className="space-y-3">
                {videos.map((v, i) => (
                  <li
                    key={v.id ?? i}
                    className="rounded-xl border border-violet-100/90 bg-white/95 px-4 py-3 shadow-sm ring-1 ring-violet-900/4 space-y-2"
                  >
                    <div className="font-semibold text-slate-900">
                      {v.title || "—"}
                    </div>
                    <a
                      href={v.youtube_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-700 underline break-all text-sm font-medium"
                      dir="ltr"
                    >
                      {v.youtube_url || "—"}
                    </a>
                    <div className="text-xs font-medium text-muted-foreground">
                      {v.is_active
                        ? translate?.pages.lessons.active
                        : translate?.pages.lessons.inactive}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/35 via-white to-orange-50/20 p-6 md:p-8 shadow-lg shadow-amber-950/5 ring-1 ring-amber-900/6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-600/25">
                <FileStack className="h-5 w-5" />
              </span>
              <Label className="font-bold text-slate-900 text-base">
                {vl?.attachments}
              </Label>
            </div>
            {attachments.length === 0 ? (
              <div className={fieldBox}>—</div>
            ) : (
              <ul className="space-y-2">
                {attachments.map((att) => (
                  <li key={att.id}>
                    <a
                      href={att.file_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-xl border border-amber-100/90 bg-amber-50/50 px-4 py-2.5 text-sm font-medium text-amber-950 hover:bg-amber-100/60 transition-colors"
                    >
                      {att.name || att.file_url || `#${att.id}`}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">
              {vl?.status}
            </Label>
            {lesson.is_active ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 font-semibold px-3 py-1">
                {translate?.pages.lessons.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold px-3 py-1">
                {translate?.pages.lessons.inactive}
              </Badge>
            )}
          </div>

          <Button
            type="button"
            className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white px-8 py-6 shadow-lg"
            onClick={() => router.back()}
          >
            {vl?.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
