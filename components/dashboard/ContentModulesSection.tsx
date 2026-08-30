"use client";

import {
  BookOpenCheck,
  BookOpenText,
  Film,
  FolderTree,
  type LucideIcon,
} from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import type { DashboardStats } from "./types";

type Props = {
  stats: DashboardStats;
};

const modulePermissionMap: Record<string, string> = {
  studyTerms: "study_terms",
  academicSubjects: "subjects",
  academicLessons: "lessons",
  trackCategories: "scientific_track_categories",
  trackSubjects: "scientific_track_subjects",
  trackLessons: "lessons",
};

const icons: Record<string, LucideIcon> = {
  studyTerms: BookOpenCheck,
  academicSubjects: BookOpenText,
  academicLessons: Film,
  trackCategories: FolderTree,
  trackSubjects: BookOpenText,
  trackLessons: Film,
};

const barTone: Record<string, string> = {
  emerald: "bg-emerald-600",
  teal: "bg-teal-600",
  cyan: "bg-cyan-600",
  sky: "bg-sky-600",
  amber: "bg-amber-500",
  lime: "bg-lime-600",
};

const softTone: Record<string, string> = {
  emerald: "from-emerald-50/80 to-white ring-emerald-100",
  teal: "from-teal-50/80 to-white ring-teal-100",
  cyan: "from-cyan-50/80 to-white ring-cyan-100",
  sky: "from-sky-50/80 to-white ring-sky-100",
  amber: "from-amber-50/80 to-white ring-amber-100",
  lime: "from-lime-50/80 to-white ring-lime-100",
};

export default function ContentModulesSection({ stats }: Props) {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const { hasModuleAccess, isReady } = useUserPermissions();

  const moduleLabels: Record<string, string | undefined> = {
    studyTerms: t?.moduleStudyTerms,
    academicSubjects: t?.moduleAcademicSubjects,
    academicLessons: t?.moduleAcademicLessons,
    trackCategories: t?.moduleTrackCategories,
    trackSubjects: t?.moduleTrackSubjects,
    trackLessons: t?.moduleTrackLessons,
  };

  const visibleModules = stats.modules.filter((mod) => {
    if (!isReady) return false;
    const permissionModule = modulePermissionMap[mod.key];
    return permissionModule ? hasModuleAccess(permissionModule) : true;
  });

  if (!isReady || visibleModules.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{t?.modulesTitle}</h2>
        <p className="text-sm text-slate-600">{t?.modulesDescription}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleModules.map((mod) => {
          const Icon = icons[mod.key] ?? BookOpenText;
          const activePct = mod.count
            ? Math.round((mod.active / mod.count) * 100)
            : 0;

          return (
            <article
              key={mod.key}
              className={cn(
                "rounded-2xl border border-slate-200/90 bg-linear-to-br p-5 shadow-sm ring-1",
                softTone[mod.color],
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/80">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="font-semibold text-slate-900">
                    {moduleLabels[mod.key]}
                  </p>
                </div>
                <p className="text-2xl font-bold tabular-nums text-slate-900">
                  {stats.isLoading ? "—" : mod.count}
                </p>
              </div>

              <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200/60">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    barTone[mod.color],
                  )}
                  style={{ width: stats.isLoading ? "0%" : `${activePct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  {t?.active}:{" "}
                  <strong className="text-emerald-700">
                    {stats.isLoading ? "—" : mod.active}
                  </strong>
                </span>
                <span>
                  {t?.inactive}:{" "}
                  <strong className="text-slate-700">
                    {stats.isLoading ? "—" : mod.inactive}
                  </strong>
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
