"use client";

import {
  AlertTriangle,
  BookOpen,
  BookOpenText,
  ClipboardList,
  Film,
  Library,
  Route,
  Users,
} from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";
import type {
  DashboardFilters,
  DashboardPeriod,
  DashboardStats,
} from "./types";

type Props = {
  stats: DashboardStats;
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
};

const PERIODS: DashboardPeriod[] = ["today", "week", "month", "year"];

const widget =
  "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/4";

export default function DoctorStatistics({
  stats,
  filters,
  onFiltersChange,
}: Props) {
  const lang = LangUseParams();
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const doctor = stats.doctor;
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const periodLabel: Record<DashboardPeriod, string> = {
    today: t?.periodToday,
    week: t?.periodThisWeek,
    month: t?.periodThisMonth,
    year: t?.periodThisYear,
    all: t?.periodAll,
  };

  const kpis = doctor?.kpis;
  const content = doctor?.content;
  const exams = doctor?.exams;
  const attention = doctor?.attention;

  const kpiCards = [
    {
      key: "subjects",
      label: t?.doctorKpiSubjects,
      value: kpis?.subjectsTaught.value ?? 0,
      icon: BookOpenText,
    },
    {
      key: "lessons",
      label: t?.doctorKpiLessons,
      value: kpis?.lessons.value ?? 0,
      icon: BookOpen,
    },
    {
      key: "videos",
      label: t?.doctorKpiVideos,
      value: kpis?.videos.value ?? 0,
      icon: Film,
    },
    {
      key: "students",
      label: t?.doctorKpiStudents,
      value: kpis?.studentsReached.value ?? 0,
      icon: Users,
    },
    {
      key: "attempts",
      label: t?.doctorKpiAttempts,
      value: kpis?.examAttempts.value ?? 0,
      icon: ClipboardList,
    },
    {
      key: "action",
      label: t?.kpiNeedsAction,
      value: kpis?.actionRequired.value ?? 0,
      icon: AlertTriangle,
    },
  ];

  return (
    <section className="space-y-6" dir={pageDir}>
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
            {t?.doctorStatsTitle}
          </h1>
          {doctor?.filters.from ? (
            <p className="mt-1 text-sm text-slate-500">
              {doctor.filters.from} — {doctor.filters.to}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => onFiltersChange({ ...filters, period })}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition",
                filters.period === period
                  ? "bg-emerald-700 text-white ring-emerald-700"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {periodLabel[period]}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((card) => (
          <article key={card.key} className={cn(widget, "p-4")}>
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
              <card.icon className="h-5 w-5" />
            </span>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-sm text-slate-600">{card.label}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className={widget}>
          <div className="mb-4 flex items-center gap-2 text-emerald-800">
            <BookOpen className="h-5 w-5" />
            <h2 className="font-bold">{t?.programTitle}</h2>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              {t?.programSubjects}: {content?.program.subjects ?? 0}
            </li>
            <li>
              {t?.programLessons}: {content?.program.lessons ?? 0}
            </li>
            <li>
              {t?.programVideos}: {content?.program.videos ?? 0}
            </li>
          </ul>
        </article>
        <article className={widget}>
          <div className="mb-4 flex items-center gap-2 text-teal-800">
            <Route className="h-5 w-5" />
            <h2 className="font-bold">{t?.tracksTitle}</h2>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              {t?.tracksSubjects}: {content?.scientificTracks.subjects ?? 0}
            </li>
            <li>
              {t?.tracksLessons}: {content?.scientificTracks.lessons ?? 0}
            </li>
            <li>
              {t?.programVideos}: {content?.scientificTracks.videos ?? 0}
            </li>
          </ul>
        </article>
        <article className={widget}>
          <div className="mb-4 flex items-center gap-2 text-amber-800">
            <Library className="h-5 w-5" />
            <h2 className="font-bold">{t?.libraryTitle}</h2>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              {t?.libraryActiveBooks}: {content?.library.booksActive ?? 0}
            </li>
            <li>
              {t?.libraryInactiveBooks}: {content?.library.booksInactive ?? 0}
            </li>
          </ul>
        </article>
      </div>

      <article className={widget}>
        <h2 className="mb-4 font-bold text-slate-900">
          {t?.examPerformanceTitle}
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {(
            [
              ["subject", t?.examSubject, exams?.subject],
              ["lesson", t?.examLesson, exams?.lesson],
              ["video", t?.examVideo, exams?.video],
            ] as const
          ).map(([key, label, group]) => (
            <div
              key={key}
              className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100"
            >
              <p className="font-semibold text-slate-800">{label}</p>
              <p className="mt-2 text-sm text-slate-600">
                {t?.doctorExamAttempts}: {group?.attempts ?? 0}
              </p>
              <p className="text-sm text-slate-600">
                {t?.tracksPassRate}: {group?.passRate ?? 0}%
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className={cn(widget, dash.sectionNeutral)}>
        <div className="mb-4 flex items-center gap-2 text-rose-800">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="font-bold">{t?.attentionTitle}</h2>
        </div>
        <ul className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <li>
            {t?.attentionEssayReviews}: {attention?.pendingArticleReviews ?? 0}
          </li>
          <li>
            {t?.doctorLessonsWithoutExam}: {attention?.lessonsWithoutExam ?? 0}
          </li>
          <li>
            {t?.doctorVideosWithoutExam}: {attention?.videosWithoutExam ?? 0}
          </li>
          <li>
            {t?.attentionNoExam}: {attention?.subjectsWithoutExam ?? 0}
          </li>
        </ul>
      </article>
    </section>
  );
}
