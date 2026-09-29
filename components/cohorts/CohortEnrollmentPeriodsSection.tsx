"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type UseFormWatch,
} from "react-hook-form";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import DatePickerField from "@/components/shared/DatePickerField";
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
  control: Control<CohortFormPayload>;
  watch: UseFormWatch<CohortFormPayload>;
  labelAlign: string;
  labels: Labels;
};

type DateFieldName = FieldPath<CohortFormPayload>;

const sectionShell =
  "rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3";

const periodCard =
  "rounded-xl border border-slate-200 bg-slate-50/40 p-4 md:p-5 space-y-4";

function DateField({
  control,
  name,
  label,
  labelClassName,
  labelAlign,
  required,
  minDate,
  maxDate,
}: {
  control: Control<CohortFormPayload>;
  name: DateFieldName;
  label: string;
  labelClassName: string;
  labelAlign: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: true } : undefined}
      render={({ field, fieldState }) => {
        const value = typeof field.value === "string" ? field.value : "";
        return (
          <div className="space-y-2">
            <Label
              htmlFor={name}
              className={cn(labelClassName, "text-slate-800", labelAlign)}
            >
              {label}
            </Label>
            <DatePickerField
              id={name}
              value={value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              minDate={minDate}
              maxDate={maxDate}
              invalid={!!fieldState.error}
              placeholder={label}
            />
            {value ? (
              <div className="text-xs text-muted-foreground">
                {formatGregorianDateAr(value)}{" "}
                <span className="mx-1">—</span>{" "}
                {formatHijriFromGregorianDateAr(value)}
              </div>
            ) : null}
          </div>
        );
      }}
    />
  );
}

function PeriodRange({
  control,
  watch,
  startName,
  endName,
  labels,
  labelAlign,
  required,
  labelClassName = "text-sm font-semibold",
}: {
  control: Control<CohortFormPayload>;
  watch: UseFormWatch<CohortFormPayload>;
  startName: DateFieldName;
  endName: DateFieldName;
  labels: { start: string; end: string };
  labelAlign: string;
  required?: boolean;
  labelClassName?: string;
}) {
  const start = watch(startName);
  const end = watch(endName);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      <DateField
        control={control}
        name={startName}
        label={labels.start}
        labelClassName={labelClassName}
        labelAlign={labelAlign}
        required={required}
        maxDate={typeof end === "string" && end ? end : undefined}
      />
      <DateField
        control={control}
        name={endName}
        label={labels.end}
        labelClassName={labelClassName}
        labelAlign={labelAlign}
        required={required}
        minDate={typeof start === "string" && start ? start : undefined}
      />
    </div>
  );
}

export default function CohortEnrollmentPeriodsSection({
  control,
  watch,
  labelAlign,
  labels,
}: Props) {
  const periodLabels = { start: labels.periodStart, end: labels.periodEnd };

  return (
    <>
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

        <div className="mt-5">
          <PeriodRange
            control={control}
            watch={watch}
            startName="enrollment_start_date"
            endName="enrollment_end_date"
            labels={{
              start: labels.enrollmentStart,
              end: labels.enrollmentEnd,
            }}
            labelAlign={labelAlign}
            labelClassName="text-base font-semibold"
            required
          />
        </div>
      </div>

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

          <div className={periodCard}>
            <p className="text-sm font-semibold text-slate-800">
              {labels.academicYearFirstTitle}
            </p>
            <PeriodRange
              control={control}
              watch={watch}
              startName="academic_years.0.start_date"
              endName="academic_years.0.end_date"
              labels={periodLabels}
              labelAlign={labelAlign}
            />
          </div>

          <div className={periodCard}>
            <p className="text-sm font-semibold text-slate-800">
              {labels.academicYearSecondTitle}
            </p>
            <PeriodRange
              control={control}
              watch={watch}
              startName="academic_years.1.start_date"
              endName="academic_years.1.end_date"
              labels={periodLabels}
              labelAlign={labelAlign}
            />
          </div>
        </div>
      </div>

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

          <div className={periodCard}>
            <p className="text-sm font-semibold text-slate-800">
              {labels.secondSessionForFirstYearTitle}
            </p>
            <PeriodRange
              control={control}
              watch={watch}
              startName="makeup_exam_periods.0.start_date"
              endName="makeup_exam_periods.0.end_date"
              labels={periodLabels}
              labelAlign={labelAlign}
            />
          </div>

          <div className={periodCard}>
            <p className="text-sm font-semibold text-slate-800">
              {labels.secondSessionForSecondYearTitle}
            </p>
            <PeriodRange
              control={control}
              watch={watch}
              startName="makeup_exam_periods.1.start_date"
              endName="makeup_exam_periods.1.end_date"
              labels={periodLabels}
              labelAlign={labelAlign}
            />
          </div>
        </div>
      </div>
    </>
  );
}
