"use client";

import Link from "next/link";
import {
  BookOpenCheck,
  BookOpenText,
  CalendarRange,
  Film,
  FolderPlus,
  ShieldUser,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import {
  ACADEMIC_LESSONS_BASE_PATH,
  ACADEMIC_STUDY_SUBJECTS_PATH,
  ACADEMIC_STUDY_TERMS_PATH,
} from "@/utils/lessonsPaths";

type ToneKey =
  | "emerald"
  | "teal"
  | "cyan"
  | "amber"
  | "orange"
  | "gold"
  | "violet"
  | "sky";

type QuickItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  tone: ToneKey;
  module: string;
};

const TONES: Record<
  ToneKey,
  { card: string; icon: string; rail: string }
> = {
  emerald: {
    card: "border-emerald-100 bg-linear-to-br from-white via-emerald-50/40 to-teal-50/30 ring-emerald-100/80 hover:border-emerald-200 hover:shadow-emerald-900/8",
    icon: "bg-linear-to-br from-emerald-100 to-teal-50 text-emerald-800 ring-emerald-200/80",
    rail: "bg-linear-to-b from-emerald-400 to-teal-700",
  },
  teal: {
    card: "border-teal-100 bg-linear-to-br from-white via-teal-50/40 to-cyan-50/30 ring-teal-100/80 hover:border-teal-200 hover:shadow-teal-900/8",
    icon: "bg-linear-to-br from-teal-100 to-cyan-50 text-teal-800 ring-teal-200/80",
    rail: "bg-linear-to-b from-teal-400 to-cyan-700",
  },
  cyan: {
    card: "border-cyan-100 bg-linear-to-br from-white via-cyan-50/40 to-sky-50/30 ring-cyan-100/80 hover:border-cyan-200 hover:shadow-cyan-900/8",
    icon: "bg-linear-to-br from-cyan-100 to-sky-50 text-cyan-800 ring-cyan-200/80",
    rail: "bg-linear-to-b from-cyan-400 to-teal-700",
  },
  amber: {
    card: "border-amber-100 bg-linear-to-br from-white via-amber-50/45 to-orange-50/30 ring-amber-100/80 hover:border-amber-200 hover:shadow-amber-900/8",
    icon: "bg-linear-to-br from-amber-100 to-orange-50 text-amber-800 ring-amber-200/80",
    rail: "bg-linear-to-b from-amber-400 to-orange-600",
  },
  orange: {
    card: "border-orange-100 bg-linear-to-br from-white via-orange-50/40 to-amber-50/30 ring-orange-100/80 hover:border-orange-200 hover:shadow-orange-900/8",
    icon: "bg-linear-to-br from-orange-100 to-amber-50 text-orange-800 ring-orange-200/80",
    rail: "bg-linear-to-b from-orange-400 to-amber-700",
  },
  gold: {
    card: "border-yellow-100 bg-linear-to-br from-white via-yellow-50/45 to-amber-50/30 ring-yellow-100/80 hover:border-yellow-200 hover:shadow-amber-900/8",
    icon: "bg-linear-to-br from-yellow-100 to-amber-50 text-amber-800 ring-yellow-200/80",
    rail: "bg-linear-to-b from-yellow-400 to-amber-600",
  },
  violet: {
    card: "border-violet-100 bg-linear-to-br from-white via-violet-50/40 to-fuchsia-50/25 ring-violet-100/80 hover:border-violet-200 hover:shadow-violet-900/8",
    icon: "bg-linear-to-br from-violet-100 to-fuchsia-50 text-violet-800 ring-violet-200/80",
    rail: "bg-linear-to-b from-violet-400 to-indigo-700",
  },
  sky: {
    card: "border-sky-100 bg-linear-to-br from-white via-sky-50/45 to-indigo-50/25 ring-sky-100/80 hover:border-sky-200 hover:shadow-sky-900/8",
    icon: "bg-linear-to-br from-sky-100 to-indigo-50 text-sky-800 ring-sky-200/80",
    rail: "bg-linear-to-b from-sky-400 to-indigo-600",
  },
};

export default function QuickLinks() {
  const lang = LangUseParams() ?? "ar";
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const { canAccessHref, isReady } = useUserPermissions();

  const deniedMessage =
    t?.noPermission ?? "You do not have permission to access this page.";

  const items: QuickItem[] = [
    {
      href: `/${lang}/${ACADEMIC_STUDY_TERMS_PATH}/create`,
      icon: BookOpenCheck,
      labelKey: "quickStudyTerm",
      tone: "emerald",
      module: "study_terms",
    },
    {
      href: `/${lang}/${ACADEMIC_STUDY_SUBJECTS_PATH}/create`,
      icon: BookOpenText,
      labelKey: "quickAcademicSubject",
      tone: "teal",
      module: "subjects",
    },
    {
      href: `/${lang}/${ACADEMIC_LESSONS_BASE_PATH}/create`,
      icon: Film,
      labelKey: "quickAcademicLesson",
      tone: "cyan",
      module: "lessons",
    },
    {
      href: `/${lang}/singleLearnPath/categories/create`,
      icon: FolderPlus,
      labelKey: "quickTrackCategory",
      tone: "amber",
      module: "scientific_track_categories",
    },
    {
      href: `/${lang}/singleLearnPath/subjects/create`,
      icon: BookOpenText,
      labelKey: "quickTrackSubject",
      tone: "orange",
      module: "scientific_track_subjects",
    },
    {
      href: `/${lang}/singleLearnPath/lessons/create`,
      icon: Film,
      labelKey: "quickTrackLesson",
      tone: "gold",
      module: "lessons",
    },
    {
      href: `/${lang}/doctors/create`,
      icon: ShieldUser,
      labelKey: "quickDoctor",
      tone: "violet",
      module: "doctors",
    },
    {
      href: `/${lang}/cohorts/create`,
      icon: CalendarRange,
      labelKey: "quickCohort",
      tone: "sky",
      module: "cohorts",
    },
  ];

  const visibleItems = isReady
    ? items.filter((item) => canAccessHref(item.href, lang))
    : [];

  if (!isReady || visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{t?.quickTitle}</h2>
        <p className="text-sm text-slate-600">{t?.quickDescription}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {visibleItems.map((item) => {
          const tone = TONES[item.tone];
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => {
                if (!canAccessHref(item.href, lang)) {
                  event.preventDefault();
                  toast.error(deniedMessage);
                }
              }}
              className={cn(
                "group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border p-4",
                "shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md",
                tone.card,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-s-0 top-4 bottom-4 w-1 rounded-full opacity-80",
                  tone.rail,
                )}
              />
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl shadow-inner ring-1 transition group-hover:scale-105",
                  tone.icon,
                )}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold leading-snug text-slate-800">
                {t?.[item.labelKey]}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
