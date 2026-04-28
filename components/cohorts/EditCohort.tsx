/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import "./style.css";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { CalendarRange } from "lucide-react";

import {
  useGetCohortByIdQuery,
  useUpdateCohortMutation,
} from "@/store/cohorts/cohortsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

import CohortFormSkeleton from "@/components/skeleton/CohortFormSkeleton";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import {
  formatGregorianDateAr,
  formatHijriFromGregorianDateAr,
} from "@/utils/dateFormat";

type EditCohortForm = {
  name_ar: string;
  name_en: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export default function EditCohort() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.cohorts.editCohort;

  const {
    data: cohort,
    isLoading,
    isError,
  } = useGetCohortByIdQuery(Number(id), {
    skip:
      !sessionReady || !id || Number.isNaN(Number(id)),
  });

  const [updateCohort, { isLoading: isUpdating }] = useUpdateCohortMutation();

  const { register, handleSubmit, reset, control, watch } =
    useForm<EditCohortForm>({
      defaultValues: {
        name_ar: "",
        name_en: "",
        start_date: "",
        end_date: "",
        is_active: true,
      },
    });

  const watchedStartDate = watch("start_date");
  const watchedEndDate = watch("end_date");

  useEffect(() => {
    if (!cohort) return;

    reset({
      name_ar: cohort.name_ar ?? "",
      name_en: cohort.name_en ?? "",
      start_date: cohort.start_date?.slice(0, 10) ?? "",
      end_date: cohort.end_date?.slice(0, 10) ?? "",
      is_active: Boolean(cohort.is_active),
    });
  }, [cohort, reset]);

  const onSubmit = async (data: EditCohortForm) => {
    try {
      const res = await updateCohort({
        id: Number(id),
        data: {
          name_ar: data.name_ar,
          name_en: data.name_en,
          start_date: data.start_date,
          end_date: data.end_date,
          is_active: data.is_active,
        },
      }).unwrap();

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

  if (!sessionReady || isLoading) {
    return <CohortFormSkeleton />;
  }

  if (isError || !cohort) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {translate?.pages.cohorts.viewCohort.notFound}
      </div>
    );
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
            {t?.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <CalendarRange className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {t?.titleUpdate}
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
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.nameEn}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    {...register("name_en", { required: true })}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.startDate}
                  </Label>
                  <Input
                    type="date"
                    className={cn("h-11", dash.input)}
                    {...register("start_date", { required: true })}
                  />
                  <div className="text-xs text-muted-foreground">
                    {formatGregorianDateAr(watchedStartDate)}{" "}
                    <span className="mx-1">—</span>{" "}
                    {formatHijriFromGregorianDateAr(watchedStartDate)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.endDate}
                  </Label>
                  <Input
                    type="date"
                    className={cn("h-11", dash.input)}
                    {...register("end_date", { required: true })}
                  />
                  <div className="text-xs text-muted-foreground">
                    {formatGregorianDateAr(watchedEndDate)}{" "}
                    <span className="mx-1">—</span>{" "}
                    {formatHijriFromGregorianDateAr(watchedEndDate)}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
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
                disabled={isUpdating}
                className={dash.formSubmit}
              >
                {isUpdating ? `${t?.processing}...` : `${t?.editBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
