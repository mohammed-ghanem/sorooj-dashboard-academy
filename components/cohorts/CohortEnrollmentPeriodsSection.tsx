"use client";

import type { UseFormRegister, UseFormWatch } from "react-hook-form";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ICreateCohortPayload } from "@/types/cohort";
import {
  formatGregorianDateAr,
  formatHijriFromGregorianDateAr,
} from "@/utils/dateFormat";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

export type CohortFormPayload = ICreateCohortPayload;

type Labels = {
  enrollmentSectionTitle: string;
  enrollmentSectionHint?: string;
  enrollmentStart: string;
  enrollmentEnd: string;
  academicYearsTitle: string;
  academicYearsHint?: string;
  academicYearFirstTitle: string;
  academicYearSecondTitle: string;
  secondSessionExamsTitle: string;
  secondSessionExamsHint?: string;
  secondSessionForFirstYearTitle: string;
  secondSessionForSecondYearTitle: string;
  periodStart: string;
  periodEnd: string;
};

type Props = {
  register: UseFormRegister<CohortFormPayload>;
  watch: UseFormWatch<CohortFormPayload>;
  labelAlign: string;
  labels: Labels;
};

const sectionShell =
  "rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3";

export default function CohortEnrollmentPeriodsSection({
  register,
  watch,
  labelAlign,
  labels,
}: Props) {
  const enrollmentStart = watch("enrollment_start_date");
  const enrollmentEnd = watch("enrollment_end_date");

  return (
    <>
      {/* Enrollment Periods Section */}
      <div className={sectionShell}>
        <div className="space-y-3">
          <p className={dash.cohortSectionHeadingBadge}>
            <Users className="h-4 w-4 text-emerald-700 shrink-0" />
            {labels.enrollmentSectionTitle}
          </p>
          {labels.enrollmentSectionHint ? (
            <p className="text-xs max-w-2xl leading-relaxed text-red-500 font-bold">
              {labels.enrollmentSectionHint}
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div className="space-y-2">
            <Label
              className={cn(
                "text-base font-semibold text-slate-800",
                labelAlign,
              )}
            >
              {labels.enrollmentStart}
            </Label>
            <Input
              type="date"
              className={cn("h-11", dash.input)}
              {...register("enrollment_start_date", { required: true })}
            />
            <div className="text-xs text-muted-foreground">
              {formatGregorianDateAr(enrollmentStart)}{" "}
              <span className="mx-1">—</span>{" "}
              {formatHijriFromGregorianDateAr(enrollmentStart)}
            </div>
          </div>
          <div className="space-y-2">
            <Label
              className={cn(
                "text-base font-semibold text-slate-800",
                labelAlign,
              )}
            >
              {labels.enrollmentEnd}
            </Label>
            <Input
              type="date"
              className={cn("h-11", dash.input)}
              {...register("enrollment_end_date", { required: true })}
            />
            <div className="text-xs text-muted-foreground">
              {formatGregorianDateAr(enrollmentEnd)}{" "}
              <span className="mx-1">—</span>{" "}
              {formatHijriFromGregorianDateAr(enrollmentEnd)}
            </div>
          </div>
        </div>
      </div>

      {/* Academic Years Section */}
      <div className={sectionShell}>
        <div className="space-y-6">
          <p className={cn(dash.cohortSectionHeadingBadge, "mb-0.5")}>
            <GraduationCap className="h-4 w-4 text-emerald-700 shrink-0" />
            {labels.academicYearsTitle}
          </p>
          {labels.academicYearsHint ? (
            <p className="text-xs max-w-2xl leading-relaxed text-red-500 my-3 font-bold">
              {labels.academicYearsHint}
            </p>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 md:p-5 space-y-4">
            <p className="text-sm font-semibold text-slate-800">
              {labels.academicYearFirstTitle}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {labels.periodStart}
                </Label>
                <Input
                  type="date"
                  className={cn("h-11", dash.input)}
                  {...register("academic_years.0.start_date")}
                />
                <div className="text-xs text-muted-foreground">
                  {formatGregorianDateAr(watch("academic_years.0.start_date"))}{" "}
                  <span className="mx-1">—</span>{" "}
                  {formatHijriFromGregorianDateAr(
                    watch("academic_years.0.start_date"),
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {labels.periodEnd}
                </Label>
                <Input
                  type="date"
                  className={cn("h-11", dash.input)}
                  {...register("academic_years.0.end_date")}
                />
                <div className="text-xs text-muted-foreground">
                  {formatGregorianDateAr(watch("academic_years.0.end_date"))}{" "}
                  <span className="mx-1">—</span>{" "}
                  {formatHijriFromGregorianDateAr(
                    watch("academic_years.0.end_date"),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 md:p-5 space-y-4">
            <p className="text-sm font-semibold text-slate-800">
              {labels.academicYearSecondTitle}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {labels.periodStart}
                </Label>
                <Input
                  type="date"
                  className={cn("h-11", dash.input)}
                  {...register("academic_years.1.start_date")}
                />
                <div className="text-xs text-muted-foreground">
                  {formatGregorianDateAr(watch("academic_years.1.start_date"))}{" "}
                  <span className="mx-1">—</span>{" "}
                  {formatHijriFromGregorianDateAr(
                    watch("academic_years.1.start_date"),
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {labels.periodEnd}
                </Label>
                <Input
                  type="date"
                  className={cn("h-11", dash.input)}
                  {...register("academic_years.1.end_date")}
                />
                <div className="text-xs text-muted-foreground">
                  {formatGregorianDateAr(watch("academic_years.1.end_date"))}{" "}
                  <span className="mx-1">—</span>{" "}
                  {formatHijriFromGregorianDateAr(
                    watch("academic_years.1.end_date"),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Session Exams Section */}
      <div className={sectionShell}>
        <div className="space-y-6">
          <p className={dash.cohortSectionHeadingBadge}>
            <BookOpen className="h-4 w-4 text-emerald-700 shrink-0" />
            {labels.secondSessionExamsTitle}
          </p>
          {labels.secondSessionExamsHint ? (
            <p className="text-xs max-w-2xl leading-relaxed text-red-500 my-3 font-bold">
              {labels.secondSessionExamsHint}
            </p>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 md:p-5 space-y-4">
            <p className="text-sm font-semibold text-slate-800">
              {labels.secondSessionForFirstYearTitle}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {labels.periodStart}
                </Label>
                <Input
                  type="date"
                  className={cn("h-11", dash.input)}
                  {...register("makeup_exam_periods.0.start_date")}
                />
                <div className="text-xs text-muted-foreground">
                  {formatGregorianDateAr(
                    watch("makeup_exam_periods.0.start_date"),
                  )}{" "}
                  <span className="mx-1">—</span>{" "}
                  {formatHijriFromGregorianDateAr(
                    watch("makeup_exam_periods.0.start_date"),
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {labels.periodEnd}
                </Label>
                <Input
                  type="date"
                  className={cn("h-11", dash.input)}
                  {...register("makeup_exam_periods.0.end_date")}
                />
                <div className="text-xs text-muted-foreground">
                  {formatGregorianDateAr(
                    watch("makeup_exam_periods.0.end_date"),
                  )}{" "}
                  <span className="mx-1">—</span>{" "}
                  {formatHijriFromGregorianDateAr(
                    watch("makeup_exam_periods.0.end_date"),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 md:p-5 space-y-4">
            <p className="text-sm font-semibold text-slate-800">
              {labels.secondSessionForSecondYearTitle}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {labels.periodStart}
                </Label>
                <Input
                  type="date"
                  className={cn("h-11", dash.input)}
                  {...register("makeup_exam_periods.1.start_date")}
                />
                <div className="text-xs text-muted-foreground">
                  {formatGregorianDateAr(
                    watch("makeup_exam_periods.1.start_date"),
                  )}{" "}
                  <span className="mx-1">—</span>{" "}
                  {formatHijriFromGregorianDateAr(
                    watch("makeup_exam_periods.1.start_date"),
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {labels.periodEnd}
                </Label>
                <Input
                  type="date"
                  className={cn("h-11", dash.input)}
                  {...register("makeup_exam_periods.1.end_date")}
                />
                <div className="text-xs text-muted-foreground">
                  {formatGregorianDateAr(
                    watch("makeup_exam_periods.1.end_date"),
                  )}{" "}
                  <span className="mx-1">—</span>{" "}
                  {formatHijriFromGregorianDateAr(
                    watch("makeup_exam_periods.1.end_date"),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
