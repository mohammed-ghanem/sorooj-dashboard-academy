"use client";

import { useParams, useRouter } from "next/navigation";
import { Eye, History } from "lucide-react";

import ViewActivityLogSkeleton from "@/components/skeleton/ViewActivityLogSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { dash } from "@/constants/dashboardUi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { cn } from "@/lib/utils";
import { useGetActivityLogByIdQuery } from "@/store/activityLogs/activityLogsApi";
import type { ActivityLogChangeValue } from "@/types/activityLogs";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";

function formatValue(value: ActivityLogChangeValue | undefined) {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export default function ViewActivityLog() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const lang = LangUseParams();
  const t = translate?.pages?.activityLogs?.view;

  const idNum = id != null ? Number(id) : NaN;
  const invalidId = id == null || Number.isNaN(idNum);

  const { data: log, isLoading, isError } = useGetActivityLogByIdQuery(idNum, {
    skip: !sessionReady || invalidId,
  });

  if (!sessionReady || isLoading) {
    return <ViewActivityLogSkeleton />;
  }

  if (invalidId || isError || !log) {
    return (
      <div className={cn(dash.formPage, "text-center text-muted-foreground")}>
        {t?.notFound}
      </div>
    );
  }

  const changes = log.properties?.changes
    ? Object.entries(log.properties.changes)
    : [];

  return (
    <div className={dash.formPageWide}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl font-bold text-slate-900 md:text-2xl">
            <span className={dash.pageIconBox}>
              <Eye className="h-6 w-6" />
            </span>
            <div className="min-w-0 space-y-2">
              <span className="block leading-tight">{t?.title}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {t?.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 px-4 py-8 md:px-10 md:py-10">
          <section className={dash.sectionNeutral}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.descriptionLabel}
                </Label>
                <div className={dash.viewFieldBox}>
                  {log.description || "—"}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.date}
                </Label>
                <div className={dash.viewFieldBox}>
                  {log.created_at || "—"}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.module}
                </Label>
                <div className={dash.viewFieldBox}>
                  {log.module || log.subject?.type_name || "—"}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.action}
                </Label>
                <div className="mt-2">
                  <Badge className="bg-amber-600 px-3 py-1 font-semibold hover:bg-amber-600">
                    {log.action || log.event || "—"}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <Label className="flex flex-wrap items-center gap-3 font-semibold text-slate-900">
              <span className={dash.sectionIconWrap}>
                <History className="h-5 w-5" />
              </span>
              {t?.causer}
            </Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label className="text-sm text-slate-600">{t?.causerName}</Label>
                <div className={dash.viewFieldBox}>
                  {log.causer?.name || "—"}
                </div>
              </div>
              <div>
                <Label className="text-sm text-slate-600">{t?.causerEmail}</Label>
                <div className={dash.viewFieldBox}>
                  {log.causer?.email || "—"}
                </div>
              </div>
              <div>
                <Label className="text-sm text-slate-600">{t?.causerType}</Label>
                <div className={dash.viewFieldBox}>
                  {log.causer?.type || "—"}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <Label className="font-semibold text-slate-900">{t?.subject}</Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm text-slate-600">{t?.subjectType}</Label>
                <div className={dash.viewFieldBox}>
                  {log.subject?.type_name || log.subject?.type || "—"}
                </div>
              </div>
              <div>
                <Label className="text-sm text-slate-600">{t?.subjectLabel}</Label>
                <div className={dash.viewFieldBox}>
                  {log.subject?.label || "—"}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <Label className="font-semibold text-slate-900">{t?.changes}</Label>
            {changes.length ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/70 ring-1 ring-slate-900/4">
                <div className="grid grid-cols-3 gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-600">
                  <span>{t?.changeField}</span>
                  <span>{t?.changeOld}</span>
                  <span>{t?.changeNew}</span>
                </div>
                {changes.map(([field, change]) => (
                  <div
                    key={field}
                    className="grid grid-cols-3 gap-2 border-b border-slate-100 px-4 py-3 text-sm text-slate-800 last:border-b-0"
                  >
                    <span className="font-medium">{field}</span>
                    <span className="wrap-break-word text-slate-600">
                      {formatValue(change?.old)}
                    </span>
                    <span className="wrap-break-word text-emerald-800">
                      {formatValue(change?.new)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {t?.noChanges}
              </div>
            )}
          </section>

          <Button
            type="button"
            className={dash.viewBackButton}
            onClick={() => router.back()}
          >
            {t?.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
