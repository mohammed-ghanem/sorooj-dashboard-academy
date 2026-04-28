/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import "./style.css";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

import {
  useGetAcademicYearByIdQuery,
  useUpdateAcademicYearMutation,
} from "@/store/academicYears/academicYearsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

import AcademicYearFormSkeleton from "@/components/skeleton/AcademicYearFormSkeleton";

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

type EditAcademicYearForm = {
  name_ar: string;
  name_en: string;
  is_active: boolean;
};

export default function EditAcademicYear() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.academicYears.editAcademicYear;

  const {
    data: academicYear,
    isLoading,
    isError,
  } = useGetAcademicYearByIdQuery(Number(id), {
    skip:
      !sessionReady || !id || Number.isNaN(Number(id)),
  });

  const [updateAcademicYear, { isLoading: isUpdating }] =
    useUpdateAcademicYearMutation();

  const { register, handleSubmit, reset, control } =
    useForm<EditAcademicYearForm>({
      defaultValues: {
        name_ar: "",
        name_en: "",
        is_active: true,
      },
    });

  useEffect(() => {
    if (!academicYear) return;

    reset({
      name_ar: academicYear.name_ar ?? "",
      name_en: academicYear.name_en ?? "",
      is_active: Boolean(academicYear.is_active),
    });
  }, [academicYear, reset]);

  const onSubmit = async (data: EditAcademicYearForm) => {
    try {
      const res = await updateAcademicYear({
        id: Number(id),
        data: {
          name_ar: data.name_ar,
          name_en: data.name_en,
          is_active: data.is_active,
        },
      }).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/academic-years`);
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
    return <AcademicYearFormSkeleton />;
  }

  if (isError || !academicYear) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {translate?.pages.academicYears.viewAcademicYear.notFound}
      </div>
    );
  }

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <CalendarDays className="w-6 h-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {t?.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 md:space-y-10"
          >
            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <CalendarDays className="h-5 w-5" strokeWidth={2} />
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
