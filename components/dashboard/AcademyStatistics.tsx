"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  Compass,
  FileText,
  Globe,
  Hourglass,
  Library,
  Mail,
  ShieldUser,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserX,
  Users,
  type LucideIcon,
} from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import type {
  DashboardFilters,
  DashboardPeriod,
  DashboardStats,
  StageKey,
} from "./types";

type Props = {
  stats: DashboardStats;
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
};

const widget =
  "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/4";

const STAGE_COLORS: Record<StageKey, string> = {
  studying: "#0f766e",
  makeup_pending: "#0284c7",
  makeup: "#d97706",
  year_failed: "#e11d48",
  program_completed: "#ca8a04",
};

const KPI_TONES = {
  emerald: {
    card: "border-emerald-100 bg-linear-to-br from-white via-emerald-50/50 to-teal-50/40 ring-emerald-100/80",
    icon: "bg-linear-to-br from-emerald-100 to-teal-50 text-emerald-800 ring-emerald-200/80",
    rail: "bg-linear-to-b from-emerald-400 to-teal-700",
    value: "text-emerald-950",
  },
  teal: {
    card: "border-teal-100 bg-linear-to-br from-white via-teal-50/45 to-cyan-50/35 ring-teal-100/80",
    icon: "bg-linear-to-br from-teal-100 to-cyan-50 text-teal-800 ring-teal-200/80",
    rail: "bg-linear-to-b from-teal-400 to-cyan-700",
    value: "text-teal-950",
  },
  rose: {
    card: "border-rose-100 bg-linear-to-br from-white via-rose-50/50 to-orange-50/30 ring-rose-100/80",
    icon: "bg-linear-to-br from-rose-100 to-orange-50 text-rose-700 ring-rose-200/80",
    rail: "bg-linear-to-b from-rose-400 to-rose-700",
    value: "text-rose-800",
  },
  violet: {
    card: "border-violet-100 bg-linear-to-br from-white via-violet-50/45 to-fuchsia-50/30 ring-violet-100/80",
    icon: "bg-linear-to-br from-violet-100 to-fuchsia-50 text-violet-800 ring-violet-200/80",
    rail: "bg-linear-to-b from-violet-400 to-indigo-700",
    value: "text-violet-950",
  },
  sky: {
    card: "border-sky-100 bg-linear-to-br from-white via-sky-50/50 to-cyan-50/35 ring-sky-100/80",
    icon: "bg-linear-to-br from-sky-100 to-cyan-50 text-sky-800 ring-sky-200/80",
    rail: "bg-linear-to-b from-sky-400 to-cyan-700",
    value: "text-sky-950",
  },
  amber: {
    card: "border-amber-100 bg-linear-to-br from-white via-amber-50/55 to-orange-50/35 ring-amber-100/80",
    icon: "bg-linear-to-br from-amber-100 to-orange-50 text-amber-800 ring-amber-200/80",
    rail: "bg-linear-to-b from-amber-400 to-orange-600",
    value: "text-amber-800",
  },
} as const;

type KpiTone = keyof typeof KPI_TONES;

const SECTION_TONES = {
  path: "border-teal-100/90 bg-linear-to-br from-white via-white to-teal-50/40 ring-teal-100/70",
  stages:
    "border-emerald-100/90 bg-linear-to-br from-white via-white to-emerald-50/45 ring-emerald-100/70",
  program:
    "border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/25 to-teal-50/30 ring-emerald-100/70",
  tracks:
    "border-amber-100/90 bg-linear-to-br from-white via-amber-50/30 to-orange-50/25 ring-amber-100/70",
  library:
    "border-cyan-100/90 bg-linear-to-br from-white via-cyan-50/30 to-sky-50/25 ring-cyan-100/70",
  attention:
    "border-orange-100/90 bg-linear-to-br from-white via-orange-50/30 to-amber-50/25 ring-orange-100/70",
  exams:
    "border-sky-100/90 bg-linear-to-br from-white via-sky-50/35 to-indigo-50/25 ring-sky-100/70",
} as const;

function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

function formatRate(value: number) {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 rounded-xl border border-emerald-100 bg-linear-to-br from-white to-emerald-50/40 px-3 py-1.5 text-sm shadow-sm ring-1 ring-emerald-900/4 transition focus-within:border-emerald-300 focus-within:ring-emerald-200/70">
      <span className="shrink-0 text-emerald-700/80">{label}:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-24 max-w-40 flex-1 cursor-pointer bg-transparent font-medium text-slate-800 outline-none"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function WidgetTitle({
  icon: Icon,
  title,
  tone = "emerald",
}: {
  icon: LucideIcon;
  title?: string;
  tone?: "emerald" | "amber" | "sky" | "cyan" | "violet";
}) {
  const tones = {
    emerald:
      "bg-linear-to-br from-emerald-100 to-teal-50 text-emerald-800 ring-emerald-200/80",
    amber:
      "bg-linear-to-br from-amber-100 to-orange-50 text-amber-800 ring-amber-200/80",
    sky: "bg-linear-to-br from-sky-100 to-indigo-50 text-sky-800 ring-sky-200/80",
    cyan: "bg-linear-to-br from-cyan-100 to-teal-50 text-cyan-800 ring-cyan-200/80",
    violet:
      "bg-linear-to-br from-violet-100 to-fuchsia-50 text-violet-800 ring-violet-200/80",
  };
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1",
          tones[tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
    </div>
  );
}

function StatRow({ label, value }: { label?: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-slate-900">
        {formatCount(value)}
      </span>
    </div>
  );
}

function ProgressFooter({
  value,
  label,
  tone = "emerald",
}: {
  value: number;
  label?: string;
  tone?: "emerald" | "amber" | "cyan" | "sky";
}) {
  const barTone = {
    emerald: "bg-linear-to-r from-emerald-500 to-teal-600",
    amber: "bg-linear-to-r from-amber-400 to-orange-500",
    cyan: "bg-linear-to-r from-cyan-400 to-teal-600",
    sky: "bg-linear-to-r from-sky-400 to-indigo-500",
  };
  const textTone = {
    emerald: "text-emerald-800",
    amber: "text-amber-800",
    cyan: "text-cyan-800",
    sky: "text-sky-800",
  };
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        {label ? <span className="text-slate-600">{label}</span> : <span />}
        <span className={cn("font-semibold tabular-nums", textTone[tone])}>
          {formatRate(value)}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100/90 ring-1 ring-slate-200/60">
        <div
          className={cn("h-full rounded-full shadow-sm transition-all", barTone[tone])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function DonutChart({
  segments,
  total,
  totalLabel,
}: {
  segments: { key: StageKey; value: number }[];
  total: number;
  totalLabel?: string;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const safeTotal = total || 1;
  let offset = 0;

  return (
    <div className="relative mx-auto h-44 w-44">
      <div
        aria-hidden
        className="absolute inset-3 rounded-full bg-linear-to-br from-emerald-50 via-white to-amber-50/60 shadow-inner"
      />
      <svg viewBox="0 0 140 140" className="relative h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#d1fae5"
          strokeWidth="16"
        />
        {segments.map((segment) => {
          const length = (segment.value / safeTotal) * circumference;
          const circle = (
            <circle
              key={segment.key}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={STAGE_COLORS[segment.key]}
              strokeWidth="16"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
            />
          );
          offset += length;
          return circle;
        })}
      </svg>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold tabular-nums text-slate-900">
          {formatCount(total)}
        </p>
        <p className="text-xs text-slate-500">{totalLabel}</p>
      </div>
    </div>
  );
}

function ExamGroup({
  title,
  values,
  labels,
  variant = "program",
}: {
  title?: string;
  values: { subject: number; lesson: number; video: number };
  labels: { subject?: string; lesson?: string; video?: string };
  variant?: "program" | "tracks";
}) {
  const bars =
    variant === "tracks"
      ? [
          { key: "subject" as const, value: values.subject, bar: "bg-linear-to-t from-amber-700 to-amber-300" },
          { key: "lesson" as const, value: values.lesson, bar: "bg-linear-to-t from-orange-600 to-amber-400" },
          { key: "video" as const, value: values.video, bar: "bg-linear-to-t from-yellow-700 to-amber-200" },
        ]
      : [
          { key: "subject" as const, value: values.subject, bar: "bg-linear-to-t from-teal-400 to-cyan-200" },
          { key: "lesson" as const, value: values.lesson, bar: "bg-linear-to-t from-teal-600 to-emerald-400" },
          { key: "video" as const, value: values.video, bar: "bg-linear-to-t from-emerald-900 to-teal-500" },
        ];

  return (
    <div className="flex-1">
      <p className="mb-4 text-center text-sm font-semibold text-slate-700">
        {title}
      </p>
      <div className="flex h-40 items-end justify-center gap-5">
        {bars.map((bar) => (
          <div key={bar.key} className="flex h-full w-11 flex-col items-center justify-end">
            <div
              className={cn("w-8 rounded-t-lg shadow-sm", bar.bar)}
              style={{ height: `${Math.max(8, bar.value)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-5 text-center">
        {bars.map((bar) => (
          <div key={bar.key} className="w-11">
            <p className="text-xs font-semibold tabular-nums text-slate-800">
              {bar.value}%
            </p>
            <p className="mt-1 text-xs text-slate-500">{labels[bar.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AcademyStatistics({
  stats,
  filters,
  onFiltersChange,
}: Props) {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const lang = LangUseParams() ?? "ar";
  const { hasModuleAccess, isReady } = useUserPermissions();
  const can = (module: string) => isReady && hasModuleAccess(module);

  const allLabel = t?.filterAll;
  const cohortOptions = [
    { id: "", label: allLabel },
    ...stats.filters.cohorts,
  ];
  const yearOptions = [{ id: "", label: allLabel }, ...stats.filters.years];
  const periodOptions = [
    { id: "month", label: t?.periodThisMonth ?? "" },
    { id: "year", label: t?.periodThisYear ?? "" },
    { id: "all", label: t?.periodAll ?? allLabel },
  ];

  const showStudents = can("students");
  const showProgram =
    can("study_terms") || can("subjects") || can("lessons");
  const showTracks = can("scientific_tracks");
  const showLibrary =
    can("books") || can("book_categories") || can("scientific_library");
  const showAttention =
    can("exam_article_reviews") || can("contact_us") || showStudents;
  const showExams = showProgram || showTracks;

  const kpis = [
    {
      key: "total",
      label: t?.kpiTotalStudents,
      value: stats.kpis.studentsTotal.value,
      icon: Users,
      show: showStudents,
      growth: stats.kpis.studentsTotal.changePercentage,
      tone: "emerald" as KpiTone,
    },
    {
      key: "enrolled",
      label: t?.kpiEnrolled,
      value: stats.kpis.studentsEnrolled.value,
      icon: UserCheck,
      show: showStudents,
      growth: stats.kpis.studentsEnrolled.changePercentage,
      tone: "teal" as KpiTone,
    },
    {
      key: "notEnrolled",
      label: t?.kpiNotEnrolled,
      value: stats.kpis.studentsNotEnrolled.value,
      icon: UserX,
      show: showStudents,
      growth: stats.kpis.studentsNotEnrolled.changePercentage,
      tone: "rose" as KpiTone,
    },
    {
      key: "doctors",
      label: t?.kpiDoctorsActive,
      value: stats.kpis.doctorsActive.value,
      icon: ShieldUser,
      show: can("doctors"),
      growth: stats.kpis.doctorsActive.changePercentage,
      tone: "violet" as KpiTone,
    },
    {
      key: "countries",
      label: t?.kpiCountries,
      value: stats.kpis.countries.value,
      icon: Globe,
      show: showStudents,
      growth: stats.kpis.countries.changePercentage,
      tone: "sky" as KpiTone,
    },
    {
      key: "action",
      label: t?.kpiNeedsAction,
      value: stats.kpis.actionRequired.value,
      icon: AlertTriangle,
      show: showAttention,
      growth: stats.kpis.actionRequired.changePercentage,
      tone: "amber" as KpiTone,
    },
  ].filter((item) => item.show);

  const pathRows = [
    {
      key: "registered",
      label: t?.pathRegistered,
      value: stats.path.registered,
      bar: "bg-linear-to-r from-emerald-800 to-teal-500",
    },
    {
      key: "enrolled",
      label: t?.pathEnrolled,
      value: stats.path.enrolled,
      bar: "bg-linear-to-r from-teal-600 to-cyan-400",
    },
    {
      key: "studying",
      label: t?.pathStudying,
      value: stats.path.studying,
      bar: "bg-linear-to-r from-cyan-600 to-sky-400",
    },
    {
      key: "completed",
      label: t?.pathCompleted,
      value: stats.path.completed,
      bar: "bg-linear-to-r from-amber-500 to-yellow-300",
    },
  ];
  const pathMax = Math.max(...pathRows.map((row) => row.value), 1);

  const stages = useMemo(
    () =>
      stats.phases.map((phase) => ({
        ...phase,
        label:
          phase.key === "studying"
            ? t?.stageStudying
            : phase.key === "makeup_pending"
              ? t?.stageMakeupPending
              : phase.key === "makeup"
                ? t?.stageMakeup
                : phase.key === "year_failed"
                  ? t?.stageYearFailed
                  : t?.stageProgramCompleted,
      })),
    [stats.phases, t],
  );

  const attentionItems = [
    {
      key: "reviews",
      label: t?.attentionEssayReviews,
      value: stats.attention.essayReviews,
      icon: FileText,
      tone: "text-amber-700 bg-linear-to-br from-amber-100 to-orange-50 ring-1 ring-amber-200/70",
      href: `/${lang}/exam-article-reviews`,
      show: can("exam_article_reviews"),
    },
    {
      key: "messages",
      label: t?.attentionMessages,
      value: stats.attention.unrepliedMessages,
      icon: Mail,
      tone: "text-emerald-700 bg-linear-to-br from-emerald-100 to-teal-50 ring-1 ring-emerald-200/70",
      href: `/${lang}/contact-us`,
      show: can("contact_us"),
    },
    {
      key: "makeupPending",
      label: t?.attentionMakeupPending,
      value: stats.attention.makeupPending,
      icon: Hourglass,
      tone: "text-sky-700 bg-linear-to-br from-sky-100 to-cyan-50 ring-1 ring-sky-200/70",
      show: showStudents,
    },
    {
      key: "makeup",
      label: t?.attentionMakeup,
      value: stats.attention.makeup,
      icon: UserCheck,
      tone: "text-violet-700 bg-linear-to-br from-violet-100 to-fuchsia-50 ring-1 ring-violet-200/70",
      show: showStudents,
    },
    {
      key: "failures",
      label: t?.attentionYearFailures,
      value: stats.attention.yearFailures,
      icon: UserMinus,
      tone: "text-rose-700 bg-linear-to-br from-rose-100 to-orange-50 ring-1 ring-rose-200/70",
      show: showStudents,
    },
    {
      key: "noExam",
      label: t?.attentionNoExam,
      value: stats.attention.subjectsWithoutExam,
      icon: ClipboardList,
      tone: "text-slate-600 bg-linear-to-br from-slate-100 to-cyan-50 ring-1 ring-slate-200/80",
      show: can("subjects"),
    },
  ].filter((item) => item.show);

  const examLabels = {
    subject: t?.examSubject,
    lesson: t?.examLesson,
    video: t?.examVideo,
  };

  return (
    <section
      className={cn(
        "space-y-5 transition-opacity",
        stats.isFetching && "opacity-70",
      )}
    >
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className={dash.pageIconBox}>
            <TrendingUp className="h-6 w-6" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
            {t?.academyStatsTitle}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {can("cohorts") ? (
            <FilterSelect
              label={t?.filterCohort ?? ""}
              value={filters.cohortId}
              onChange={(cohortId) =>
                onFiltersChange({ ...filters, cohortId, yearId: "" })
              }
              options={cohortOptions}
            />
          ) : null}
          {can("academic_years") ? (
            <FilterSelect
              label={t?.filterYear ?? ""}
              value={filters.yearId}
              onChange={(yearId) => onFiltersChange({ ...filters, yearId })}
              options={yearOptions}
            />
          ) : null}
          <FilterSelect
            label={t?.filterPeriod ?? ""}
            value={filters.period}
            onChange={(period) =>
              onFiltersChange({
                ...filters,
                period: period as DashboardPeriod,
              })
            }
            options={periodOptions}
          />
        </div>
      </header>

      {kpis.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((item) => {
            const tone = KPI_TONES[item.tone];
            return (
            <article key={item.key} className={cn(widget, "p-4", tone.card)}>
              <span
                aria-hidden
                className={cn("absolute inset-s-0 top-3 bottom-3 w-1 rounded-full", tone.rail)}
              />
              <div className="mb-3 flex items-start justify-between gap-2 ps-2">
                <p className="text-sm text-slate-600">{item.label}</p>
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-inner ring-1",
                    tone.icon,
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
              </div>
              <p
                className={cn(
                  "ps-2 text-2xl font-bold tabular-nums md:text-3xl",
                  tone.value,
                )}
              >
                {formatCount(item.value)}
              </p>
              {item.growth != null ? (
                <p
                  className={cn(
                    "mt-1 ps-2 text-xs font-semibold",
                    item.growth >= 0 ? "text-emerald-600" : "text-rose-600",
                  )}
                >
                  {item.growth >= 0 ? "+" : ""}
                  {item.growth}%
                </p>
              ) : null}
            </article>
            );
          })}
        </div>
      ) : null}

      {showStudents ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <article className={cn(widget, SECTION_TONES.path)}>
            <h3 className="mb-5 text-base font-bold text-slate-900">
              {t?.studentPathTitle}
            </h3>
            <div className="space-y-4">
              {pathRows.map((row) => (
                <div key={row.key} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3">
                  <span className="text-sm text-slate-600">{row.label}</span>
                  <div className="h-3.5 overflow-hidden rounded-full bg-slate-100/90 ring-1 ring-slate-200/50">
                    <div
                      className={cn("h-full rounded-full shadow-sm", row.bar)}
                      style={{ width: `${(row.value / pathMax) * 100}%` }}
                    />
                  </div>
                  <span className="text-end text-sm font-semibold tabular-nums text-slate-800">
                    {formatCount(row.value)}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className={cn(widget, SECTION_TONES.stages)}>
            <h3 className="mb-5 text-base font-bold text-slate-900">
              {t?.progressStagesTitle}
            </h3>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <ul className="w-full flex-1 space-y-2.5">
                {stages.map((stage) => (
                  <li
                    key={stage.key}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STAGE_COLORS[stage.key] }}
                      />
                      {stage.label}
                    </span>
                    <span className="tabular-nums text-slate-800">
                      {formatCount(stage.value)}{" "}
                      <span className="text-slate-400">
                        ({formatRate(stage.percentage)}%)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <DonutChart
                segments={stages}
                total={stats.kpis.studentsTotal.value}
                totalLabel={t?.kpiTotalStudents}
              />
            </div>
          </article>
        </div>
      ) : null}

      {showProgram || showTracks || showLibrary ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {showProgram ? (
            <article className={cn(widget, SECTION_TONES.program)}>
              <WidgetTitle icon={BookOpen} title={t?.programTitle} />
              <StatRow label={t?.programTerms} value={stats.program.terms} />
              <StatRow label={t?.programSubjects} value={stats.program.subjects} />
              <StatRow label={t?.programLessons} value={stats.program.lessons} />
              <StatRow label={t?.programVideos} value={stats.program.videos} />
              <ProgressFooter
                value={stats.program.watchRate}
                label={t?.programWatchRate}
              />
            </article>
          ) : null}

          {showTracks ? (
            <article className={cn(widget, SECTION_TONES.tracks)}>
              <WidgetTitle icon={Compass} title={t?.tracksTitle} tone="amber" />
              <StatRow label={t?.tracksCategories} value={stats.tracks.categories} />
              <StatRow label={t?.tracksSubjects} value={stats.tracks.subjects} />
              <StatRow label={t?.tracksLessons} value={stats.tracks.lessons} />
              <StatRow
                label={t?.tracksExamAttempts}
                value={stats.tracks.examAttempts}
              />
              {stats.tracks.topCategory ? (
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5">
                  <span className="text-sm text-slate-600">
                    {t?.tracksTopCategory}
                  </span>
                  <span className="text-end text-sm font-semibold text-slate-900">
                    {stats.tracks.topCategory.name}{" "}
                    <span className="tabular-nums text-slate-500">
                      ({formatCount(stats.tracks.topCategory.count)})
                    </span>
                  </span>
                </div>
              ) : null}
              <ProgressFooter
                value={stats.tracks.passRate}
                label={t?.tracksPassRate}
                tone="amber"
              />
            </article>
          ) : null}

          {showLibrary ? (
            <article className={cn(widget, SECTION_TONES.library)}>
              <WidgetTitle icon={Library} title={t?.libraryTitle} tone="cyan" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <StatRow
                    label={t?.libraryCategories}
                    value={stats.library.categories}
                  />
                  <StatRow
                    label={t?.libraryActiveBooks}
                    value={stats.library.activeBooks}
                  />
                  <StatRow
                    label={t?.libraryInactiveBooks}
                    value={stats.library.inactiveBooks}
                  />
                  <StatRow
                    label={t?.librarySheikhs}
                    value={stats.library.sheikhs}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    {t?.libraryTopCategories}
                  </p>
                  {stats.library.topCategories.length ? (
                    <ul className="space-y-2">
                      {stats.library.topCategories.map((category, index) => {
                        const dots = ["bg-teal-500", "bg-cyan-500", "bg-amber-500"];
                        return (
                        <li
                          key={category.name}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="flex items-center gap-2 text-slate-600">
                            <span
                              className={cn(
                                "h-2.5 w-2.5 rounded-full shadow-sm",
                                dots[index % dots.length],
                              )}
                            />
                            {category.name}
                          </span>
                          <span className="font-semibold tabular-nums text-slate-900">
                            {formatCount(category.count)}
                          </span>
                        </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">—</p>
                  )}
                </div>
              </div>
            </article>
          ) : null}
        </div>
      ) : null}

      {showAttention || showExams ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          {showAttention ? (
            <article className={cn(widget, SECTION_TONES.attention)}>
              <WidgetTitle
                icon={Bell}
                title={t?.attentionTitle}
                tone="amber"
              />
              <ul>
                {attentionItems.map((item) => {
                  const content = (
                    <span className="flex w-full items-center justify-between gap-3 py-3">
                      <span className="flex items-center gap-3 text-sm text-slate-700">
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            item.tone,
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-slate-900">
                        {formatCount(item.value)}
                      </span>
                    </span>
                  );
                  return (
                    <li
                      key={item.key}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      {item.href ? (
                        <Link href={item.href} className="block hover:bg-slate-50/80">
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          ) : null}

          {showExams ? (
            <article className={cn(widget, SECTION_TONES.exams)}>
              <WidgetTitle
                icon={BarChart3}
                title={t?.examPerformanceTitle}
                tone="sky"
              />
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                {showProgram ? (
                  <ExamGroup
                    title={t?.examProgram}
                    values={stats.exams.program}
                    labels={examLabels}
                    variant="program"
                  />
                ) : null}
                {showProgram && showTracks ? (
                  <div className="hidden h-44 w-px border-s border-dashed border-sky-200 sm:block" />
                ) : null}
                {showTracks ? (
                  <ExamGroup
                    title={t?.examTracks}
                    values={stats.exams.tracks}
                    labels={examLabels}
                    variant="tracks"
                  />
                ) : null}
              </div>
            </article>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
