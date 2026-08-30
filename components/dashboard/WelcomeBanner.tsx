"use client";

import { LayoutDashboard, Sparkles } from "lucide-react";
import TranslateHook from "@/translate/TranslateHook";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "./types";

type Props = {
  stats: DashboardStats;
};

export default function WelcomeBanner({ stats }: Props) {
  const translate = TranslateHook();
  const t = translate?.pages?.dashboard;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border border-slate-200/80",
        "bg-linear-to-br from-slate-50 via-white to-emerald-50/50",
        "shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4",
      )}
    >
      <div className="flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-10">
        <div className="flex min-w-0 items-start gap-4">
          <span className={dash.pageIconBox}>
            <LayoutDashboard className="h-6 w-6" />
          </span>
          <div className="min-w-0 space-y-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              {t?.welcomeTitle}
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              {t?.welcomeDescription}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-3 rounded-2xl px-4 py-3",
            "bg-linear-to-r from-emerald-700 to-teal-700 text-white",
            "shadow-lg shadow-emerald-900/20",
          )}
        >
          <Sparkles className="h-5 w-5 shrink-0 opacity-90" />
          <div className="leading-tight">
            <p className="text-xs text-white/80">{t?.totalContentLabel}</p>
            <p className="text-2xl font-bold tabular-nums">
              {stats.isLoading
                ? "—"
                : stats.totals.totalLearningItems.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
