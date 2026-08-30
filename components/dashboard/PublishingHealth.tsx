"use client";

import { Activity, CircleDashed, CircleCheckBig } from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "./types";

type Props = {
  stats: DashboardStats;
};

export default function PublishingHealth({ stats }: Props) {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;
  const { active, inactive, publishedThisWeek } = stats.publishing;
  const total = active + inactive || 1;
  const activePct = Math.round((active / total) * 100);

  return (
    <section
      className={cn(
        "rounded-3xl border border-emerald-200/80 p-6 md:p-8",
        "bg-linear-to-br from-emerald-50/40 via-white to-teal-50/30",
        "shadow-md shadow-emerald-950/5 ring-1 ring-emerald-900/5",
      )}
    >
      <header className="mb-6 flex flex-wrap items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100">
          <Activity className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">{t?.healthTitle}</h2>
          <p className="text-sm text-slate-600">{t?.healthDescription}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm">
          <div
            className="relative flex h-40 w-40 items-center justify-center rounded-full"
            style={{
              background: stats.isLoading
                ? "#e2e8f0"
                : `conic-gradient(#059669 ${activePct}%, #e2e8f0 0)`,
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <span className="text-3xl font-bold tabular-nums text-slate-900">
                {stats.isLoading ? "—" : `${activePct}%`}
              </span>
              <span className="text-xs text-slate-500">{t?.active}</span>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-slate-600">
            {t?.healthRingHint}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-emerald-800">
              <CircleCheckBig className="h-4 w-4" />
              <span className="text-sm font-semibold">{t?.active}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-slate-900">
              {stats.isLoading ? "—" : active}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-slate-600">
              <CircleDashed className="h-4 w-4" />
              <span className="text-sm font-semibold">{t?.inactive}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-slate-900">
              {stats.isLoading ? "—" : inactive}
            </p>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-white/90 p-4 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-slate-600">{t?.publishedThisWeek}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-teal-800">
              {stats.isLoading ? "—" : publishedThisWeek}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
