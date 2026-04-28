/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { CalendarRange, Eye } from "lucide-react";

import { useGetCohortByIdQuery } from "@/store/cohorts/cohortsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import LangUseParams from "@/translate/LangUseParams";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

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
import ViewCohortSkeleton from "@/components/skeleton/ViewCohortSkeleton";
import { formatGregorianDateAr, formatHijriDateAr } from "@/utils/dateFormat";

export default function ViewCohort() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const translate = TranslateHook();
  const t = translate?.pages.cohorts.viewCohort;

  const { data: cohort, isLoading, isError } = useGetCohortByIdQuery(
    Number(id),
    { skip: !sessionReady || !id || Number.isNaN(Number(id)) },
  );

  if (!sessionReady || isLoading) {
    return <ViewCohortSkeleton />;
  }

  if (isError || !cohort) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {t?.notFound}
      </div>
    );
  }

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <Eye className="w-6 h-6" />
            </span>
            <div className="space-y-2 min-w-0">
              <span className="leading-tight block">{t?.title}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {t?.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 px-4 py-8 md:px-10 md:py-10">
          <section className={dash.sectionNeutral}>
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <span className={dash.sectionIconWrap}>
                <CalendarRange className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {t?.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.nameAr}
                </Label>
                <div className={dash.viewFieldBox}>{cohort.name_ar || "—"}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.nameEn}
                </Label>
                <div className={dash.viewFieldBox}>{cohort.name_en || "—"}</div>
              </div>
            </div>
          </section>

          <Separator />

          <section className={dash.sectionNeutral}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 shrink-0" />
                  {t?.startDateGregorian}
                </Label>
                <div className={dash.viewFieldBox}>
                  {formatGregorianDateAr(cohort.start_date)}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 shrink-0" />
                  {t?.endDateGregorian}
                </Label>
                <div className={dash.viewFieldBox}>
                  {formatGregorianDateAr(cohort.end_date)}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 shrink-0" />
                  {t?.startDateHijri}
                </Label>
                <div className={dash.viewFieldBox}>
                  {formatHijriDateAr(cohort.start_date_hijri)}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 shrink-0" />
                  {t?.endDateHijri}
                </Label>
                <div className={dash.viewFieldBox}>
                  {formatHijriDateAr(cohort.end_date_hijri)}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">
              {t?.status}
            </Label>
            {cohort.is_active ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 font-semibold px-3 py-1">
                {translate?.pages.cohorts.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold px-3 py-1">
                {translate?.pages.cohorts.inactive}
              </Badge>
            )}
          </div>

          {cohort.created_at ? (
            <>
              <Separator />
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.createdAt}
                </Label>
                <div className={dash.viewFieldBox}>{cohort.created_at}</div>
              </div>
            </>
          ) : null}

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
