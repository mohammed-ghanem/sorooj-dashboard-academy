/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarRange,
  Clock3,
  Eye,
  GraduationCap,
  Languages,
  Sparkles,
  Users,
} from "lucide-react";

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
import {
  formatGregorianDateAr,
  formatHijriFromGregorianDateAr,
  formatHijriYearOnlyFromGregorianUi,
  gregorianYearFromIsoDate,
} from "@/utils/dateFormat";

import "./style.css";

/** Matches create/edit helper line: Gregorian — Hijri */
function ViewGregorianHijriPair({ dateStr }: { dateStr?: string }) {
  const has = Boolean(String(dateStr ?? "").trim());
  return (
    <div className="space-y-2">
      <div className={dash.viewFieldBox}>
        {has ? formatGregorianDateAr(dateStr) : "—"}
      </div>
      <div className="text-xs text-muted-foreground leading-relaxed">
        {has ? (
          <>
            {formatGregorianDateAr(dateStr)} <span className="mx-1">—</span>{" "}
            {formatHijriFromGregorianDateAr(dateStr)}
          </>
        ) : (
          "—"
        )}
      </div>
    </div>
  );
}

/** Cohort span is year-only (1 Jan per year), same idea as create/edit year pickers. */
function ViewCohortSpanYear({
  iso,
  lang,
}: {
  iso?: string;
  lang?: string;
}) {
  const locale: "ar" | "en" = (lang ?? "ar") === "ar" ? "ar" : "en";
  const g = gregorianYearFromIsoDate(iso);
  const has = Boolean(g);
  const h = formatHijriYearOnlyFromGregorianUi(iso, locale);
  const line = has
    ? locale === "ar"
      ? `${g}\u00a0م — ${h || "—"}\u00a0هـ`
      : `${g}\u00a0CE — ${h || "—"}\u00a0AH`
    : "—";
  return (
    <div className="space-y-2">
      <div className={dash.viewFieldBox}>{line}</div>
    </div>
  );
}

const sectionRaised =
  "rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3";

export default function ViewCohort() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const translate = TranslateHook();
  const t = translate?.pages.cohorts.viewCohort;
  /** Section titles & field labels aligned with create/edit forms */
  const form = translate?.pages.cohorts.editCohort;

  const {
    data: cohort,
    isLoading,
    isError,
  } = useGetCohortByIdQuery(Number(id), {
    skip: !sessionReady || !id || Number.isNaN(Number(id)),
  });

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

        <CardContent
          className={cn(dash.formCardContent, "space-y-8 md:space-y-10")}
        >
          {/* Names + overview — same shell as edit intro */}
          <section className={dash.sectionNeutral}>
            <div className="mb-6 flex flex-wrap  gap-4">
              <span className={dash.sectionIconWrap}>
                <Languages className="h-5 w-5" strokeWidth={2} />
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {form?.nameAr ?? t?.nameAr}
                </Label>
                <div className={dash.viewFieldBox}>{cohort.name_ar || "—"}</div>
              </div>
             
            </div>

            <div className="space-y-3 my-6">
              <p className={dash.cohortSectionHeadingBadge}>
                <CalendarRange className="h-4 w-4 text-emerald-700 shrink-0" />
                {form?.cohortsDates}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800 flex items-center gap-2",
                    labelAlign,
                  )}
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-emerald-700" />
                  {form?.startYear ?? form?.startDate ?? t?.startDateGregorian}
                </Label>
                <ViewCohortSpanYear iso={cohort.start_date} lang={lang} />
              </div>
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800 flex items-center gap-2",
                    labelAlign,
                  )}
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-emerald-700" />
                  {form?.endYear ?? form?.endDate ?? t?.endDateGregorian}
                </Label>
                <ViewCohortSpanYear iso={cohort.end_date} lang={lang} />
              </div>
            </div>
          </section>

          <Separator />

          {/* Enrollment — same titles & card shell as form */}
          <section className={sectionRaised}>
            <div className="space-y-3 mb-5">
              <p className={dash.cohortSectionHeadingBadge}>
                <Users className="h-4 w-4 text-emerald-700 shrink-0" />
                {form?.enrollmentSectionTitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-base font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {form?.enrollmentStartDate}
                </Label>
                <ViewGregorianHijriPair
                  dateStr={cohort.enrollment_start_date}
                />
              </div>
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-base font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {form?.enrollmentEndDate}
                </Label>
                <ViewGregorianHijriPair dateStr={cohort.enrollment_end_date} />
              </div>
            </div>
          </section>

          <Separator />

          {/* Academic years */}
          <section className={sectionRaised}>
            <div className="space-y-3 mb-6">
              <p className={dash.cohortSectionHeadingBadge}>
                <GraduationCap className="h-4 w-4 text-emerald-700 shrink-0" />
                {form?.academicYearsTitle}
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 md:p-5 space-y-4">
                <p className="text-sm font-semibold text-slate-800">
                  {form?.academicYearFirstTitle}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <Label
                      className={cn(
                        "text-sm font-semibold text-slate-800",
                        labelAlign,
                      )}
                    >
                      {form?.periodStartDate}
                    </Label>
                    <ViewGregorianHijriPair
                      dateStr={cohort.academic_years?.[0]?.start_date}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      className={cn(
                        "text-sm font-semibold text-slate-800",
                        labelAlign,
                      )}
                    >
                      {form?.periodEndDate}
                    </Label>
                    <ViewGregorianHijriPair
                      dateStr={cohort.academic_years?.[0]?.end_date}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 md:p-5 space-y-4">
                <p className="text-sm font-semibold text-slate-800">
                  {form?.academicYearSecondTitle}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <Label
                      className={cn(
                        "text-sm font-semibold text-slate-800",
                        labelAlign,
                      )}
                    >
                      {form?.periodStartDate}
                    </Label>
                    <ViewGregorianHijriPair
                      dateStr={cohort.academic_years?.[1]?.start_date}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      className={cn(
                        "text-sm font-semibold text-slate-800",
                        labelAlign,
                      )}
                    >
                      {form?.periodEndDate}
                    </Label>
                    <ViewGregorianHijriPair
                      dateStr={cohort.academic_years?.[1]?.end_date}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Second session exams */}
          <section className={sectionRaised}>
            <div className="space-y-3 mb-6">
              <p className={dash.cohortSectionHeadingBadge}>
                <BookOpen className="h-4 w-4 text-emerald-700 shrink-0" />
                {form?.secondSessionExamsTitle}
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 md:p-5 space-y-4">
                <p className="text-sm font-semibold text-slate-800">
                  {form?.secondSessionForFirstYearTitle}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <Label
                      className={cn(
                        "text-sm font-semibold text-slate-800",
                        labelAlign,
                      )}
                    >
                      {form?.periodStartDate}
                    </Label>
                    <ViewGregorianHijriPair
                      dateStr={cohort.makeup_exam_periods?.[0]?.start_date}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      className={cn(
                        "text-sm font-semibold text-slate-800",
                        labelAlign,
                      )}
                    >
                      {form?.periodEndDate}
                    </Label>
                    <ViewGregorianHijriPair
                      dateStr={cohort.makeup_exam_periods?.[0]?.end_date}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 md:p-5 space-y-4">
                <p className="text-sm font-semibold text-slate-800">
                  {form?.secondSessionForSecondYearTitle}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <Label
                      className={cn(
                        "text-sm font-semibold text-slate-800",
                        labelAlign,
                      )}
                    >
                      {form?.periodStartDate}
                    </Label>
                    <ViewGregorianHijriPair
                      dateStr={cohort.makeup_exam_periods?.[1]?.start_date}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      className={cn(
                        "text-sm font-semibold text-slate-800",
                        labelAlign,
                      )}
                    >
                      {form?.periodEndDate}
                    </Label>
                    <ViewGregorianHijriPair
                      dateStr={cohort.makeup_exam_periods?.[1]?.end_date}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 md:px-6 shadow-sm ring-1 ring-slate-900/5">
            <Clock3 className="h-5 w-5 text-slate-600 shrink-0" />
            <Label className="font-semibold text-slate-800 mb-0">
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
              <div className="rounded-2xl border border-slate-200/90 bg-white/80 px-5 py-4 md:px-6 shadow-sm ring-1 ring-slate-900/5">
                <Label className="font-semibold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  {t?.createdAt}
                </Label>
                <div className={cn(dash.viewFieldBox, "mt-2")}>
                  {cohort.created_at}
                </div>
              </div>
            </>
          ) : null}

          <Button
            type="button"
            className={cn(dash.viewBackButton, "gap-2")}
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" />
            {t?.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
