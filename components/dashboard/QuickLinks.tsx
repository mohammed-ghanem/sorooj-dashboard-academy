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

type QuickItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  tone: string;
  module: string;
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
      tone: "hover:border-emerald-300 hover:bg-emerald-50/50",
      module: "study_terms",
    },
    {
      href: `/${lang}/${ACADEMIC_STUDY_SUBJECTS_PATH}/create`,
      icon: BookOpenText,
      labelKey: "quickAcademicSubject",
      tone: "hover:border-teal-300 hover:bg-teal-50/50",
      module: "subjects",
    },
    {
      href: `/${lang}/${ACADEMIC_LESSONS_BASE_PATH}/create`,
      icon: Film,
      labelKey: "quickAcademicLesson",
      tone: "hover:border-cyan-300 hover:bg-cyan-50/40",
      module: "lessons",
    },
    {
      href: `/${lang}/singleLearnPath/categories/create`,
      icon: FolderPlus,
      labelKey: "quickTrackCategory",
      tone: "hover:border-sky-300 hover:bg-sky-50/40",
      module: "scientific_track_categories",
    },
    {
      href: `/${lang}/singleLearnPath/subjects/create`,
      icon: BookOpenText,
      labelKey: "quickTrackSubject",
      tone: "hover:border-amber-300 hover:bg-amber-50/40",
      module: "scientific_track_subjects",
    },
    {
      href: `/${lang}/singleLearnPath/lessons/create`,
      icon: Film,
      labelKey: "quickTrackLesson",
      tone: "hover:border-lime-300 hover:bg-lime-50/40",
      module: "lessons",
    },
    {
      href: `/${lang}/doctors/create`,
      icon: ShieldUser,
      labelKey: "quickDoctor",
      tone: "hover:border-emerald-300 hover:bg-emerald-50/40",
      module: "doctors",
    },
    {
      href: `/${lang}/cohorts/create`,
      icon: CalendarRange,
      labelKey: "quickCohort",
      tone: "hover:border-slate-300 hover:bg-slate-50",
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
        {visibleItems.map((item) => (
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
              "group flex flex-col items-start gap-3 rounded-2xl border border-slate-200/90 bg-white p-4",
              "shadow-sm ring-1 ring-slate-900/3 transition",
              item.tone,
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-200/80 transition group-hover:bg-white">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-slate-800 leading-snug">
              {t?.[item.labelKey]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
