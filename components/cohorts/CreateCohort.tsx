/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import "./style.css";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { CalendarRange, Clock3, Languages, Sparkles } from "lucide-react";

import { useCreateCohortMutation } from "@/store/cohorts/cohortsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";
import type { ICreateCohortPayload } from "@/types/cohort";
import { defaultCohortFormPayload } from "@/types/cohort";
import { validateCohortFormDates } from "@/utils/cohortFormValidate";

import CohortFormSkeleton from "@/components/skeleton/CohortFormSkeleton";
import CohortEnrollmentPeriodsSection from "@/components/cohorts/CohortEnrollmentPeriodsSection";
import { CohortYearGridPicker } from "@/components/cohorts/CohortYearGridPicker";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";

export default function CreateCohort() {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.cohorts.createCohort;

  const [createCohort, { isLoading: isCreating }] = useCreateCohortMutation();

  const { register, handleSubmit, control, watch } =
    useForm<ICreateCohortPayload>({
      defaultValues: defaultCohortFormPayload(),
    });

  const onSubmit = async (data: ICreateCohortPayload) => {
    const msg = validateCohortFormDates(data, lang === "ar" ? "ar" : "en");
    if (msg) {
      toast.error(msg);
      return;
    }
    try {
      const res = await createCohort(data).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/cohorts`);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
        return;
      }
      if (errorData?.message) {
        toast.error(errorData.message);
        return;
      }
    }
  };

  if (!sessionReady) {
    return <CohortFormSkeleton />;
  }

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <CalendarRange className="w-6 h-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {t?.description}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 md:space-y-10"
          >
            <section
              aria-labelledby="cohort-create-main"
              className={dash.sectionNeutral}
            >
              <div className="space-y-3 mb-6">
                <p className={dash.cohortSectionHeadingBadge}>
                  <Languages className="h-4 w-4 text-emerald-700 shrink-0" />
                  {t?.languagesSectionTitle}
                </p>
                <p
                  id="cohort-create-main"
                  className="text-xs max-w-2xl leading-relaxed text-red-500 font-bold"
                >
                  {t?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.nameAr}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    {...register("name_ar", { required: true })}
                  />
                </div>
              </div>

              <div className="space-y-3 my-6">
                <p className={dash.cohortSectionHeadingBadge}>
                  <CalendarRange className="h-4 w-4 text-emerald-700 shrink-0" />
                  {t?.cohortsDates}
                </p>
                <p className="text-xs max-w-2xl leading-relaxed text-red-500 font-bold">
                  {t?.datesSectionHint}
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
                    {t?.startYear ?? t?.startDate}
                  </Label>
                  <Controller
                    name="start_date"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CohortYearGridPicker
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t?.pickYearPlaceholder}
                        ariaLabel={t?.startYear ?? t?.startDate}
                        hijriYearSuffix={t?.hijriYearSuffix}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800 flex items-center gap-2",
                      labelAlign,
                    )}
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-700" />
                    {t?.endYear ?? t?.endDate}
                  </Label>
                  <Controller
                    name="end_date"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CohortYearGridPicker
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t?.pickYearPlaceholder}
                        ariaLabel={t?.endYear ?? t?.endDate}
                        hijriYearSuffix={t?.hijriYearSuffix}
                      />
                    )}
                  />
                </div>
              </div>
            </section>

            <CohortEnrollmentPeriodsSection
              register={register}
              watch={watch}
              labelAlign={labelAlign}
              labels={{
                enrollmentSectionTitle: t?.enrollmentSectionTitle ?? "",
                enrollmentSectionHint: t?.enrollmentSectionHint,
                enrollmentStart: t?.enrollmentStartDate ?? "",
                enrollmentEnd: t?.enrollmentEndDate ?? "",
                academicYearsTitle: t?.academicYearsTitle ?? "",
                academicYearsHint: t?.academicYearsHint,
                academicYearFirstTitle: t?.academicYearFirstTitle ?? "",
                academicYearSecondTitle: t?.academicYearSecondTitle ?? "",
                secondSessionExamsTitle: t?.secondSessionExamsTitle ?? "",
                secondSessionExamsHint: t?.secondSessionExamsHint,
                secondSessionForFirstYearTitle:
                  t?.secondSessionForFirstYearTitle ?? "",
                secondSessionForSecondYearTitle:
                  t?.secondSessionForSecondYearTitle ?? "",
                periodStart: t?.periodStartDate ?? "",
                periodEnd: t?.periodEndDate ?? "",
              }}
            />

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Clock3 className="h-5 w-5 text-slate-600 shrink-0" />
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                    />
                  )}
                />
                <span className="text-sm font-medium text-slate-800">
                  {t?.isActive}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isCreating}
                className={dash.formSubmit}
              >
                {isCreating ? `${t?.processing}...` : `${t?.createBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
