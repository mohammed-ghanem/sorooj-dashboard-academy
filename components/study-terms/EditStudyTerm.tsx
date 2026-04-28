/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import "./style.css";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Layers } from "lucide-react";

import { useGetAcademicYearsQuery } from "@/store/academicYears/academicYearsApi";
import {
  useGetStudyTermByIdQuery,
  useUpdateStudyTermMutation,
} from "@/store/studyTerms/studyTermsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

import StudyTermFormSkeleton from "@/components/skeleton/StudyTermFormSkeleton";

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

import type { IAcademicYear } from "@/types/academicYear";

type EditStudyTermForm = {
  name_ar: string;
  name_en: string;
  about_term: string;
  academic_year_id: number;
  is_active: boolean;
};

export default function EditStudyTerm() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.studyTerms.editStudyTerm;

  const { data: academicYears = [], isLoading: loadingYears } =
    useGetAcademicYearsQuery(undefined, { skip: !sessionReady });

  const {
    data: studyTerm,
    isLoading,
    isError,
  } = useGetStudyTermByIdQuery(Number(id), {
    skip: !sessionReady || !id || Number.isNaN(Number(id)),
  });

  const [updateStudyTerm, { isLoading: isUpdating }] =
    useUpdateStudyTermMutation();

  const { register, handleSubmit, reset, control } =
    useForm<EditStudyTermForm>({
      defaultValues: {
        name_ar: "",
        name_en: "",
        about_term: "",
        academic_year_id: 0,
        is_active: true,
      },
    });

  useEffect(() => {
    if (!studyTerm) return;

    const yearId =
      studyTerm.academic_year_id || studyTerm.academic_year?.id || 0;

    reset({
      name_ar: studyTerm.name_ar ?? "",
      name_en: studyTerm.name_en ?? "",
      about_term: studyTerm.about_term ?? "",
      academic_year_id: Number(yearId) || 0,
      is_active: Boolean(studyTerm.is_active),
    });
  }, [studyTerm, reset]);

  const yearLabel = (y: IAcademicYear) =>
    lang === "ar" ? y.name_ar || y.name : y.name_en || y.name;

  const onSubmit = async (data: EditStudyTermForm) => {
    if (!data.academic_year_id) {
      toast.error(
        lang === "ar"
          ? "يرجى اختيار العام الدراسي"
          : "Please select an academic year",
      );
      return;
    }

    try {
      const res = await updateStudyTerm({
        id: Number(id),
        data: {
          name_ar: data.name_ar,
          name_en: data.name_en,
          about_term: data.about_term,
          academic_year_id: data.academic_year_id,
          is_active: data.is_active,
        },
      }).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/study-terms`);
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

  if (!sessionReady || isLoading || loadingYears) {
    return <StudyTermFormSkeleton />;
  }

  if (isError || !studyTerm) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {translate?.pages.studyTerms.viewStudyTerm.notFound}
      </div>
    );
  }

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <Layers className="w-6 h-6" />
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
                  <Layers className="h-5 w-5" strokeWidth={2} />
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

              <div className="mt-5 space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {t?.aboutTerm}
                </Label>
                <Input
                  className={cn("h-11", dash.input)}
                  {...register("about_term", { required: true })}
                />
              </div>

              <div className="mt-5 space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {t?.academicYear}
                </Label>
                <Controller
                  name="academic_year_id"
                  control={control}
                  rules={{ validate: (v) => v > 0 }}
                  render={({ field }) => (
                    <select
                      className={dash.select}
                      value={field.value > 0 ? String(field.value) : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? 0 : Number(v));
                      }}
                    >
                      <option value="">{t?.selectAcademicYear}</option>
                      {academicYears.map((y) => (
                        <option key={y.id} value={y.id}>
                          {yearLabel(y)}
                        </option>
                      ))}
                    </select>
                  )}
                />
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
                disabled={isUpdating || !academicYears.length}
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
