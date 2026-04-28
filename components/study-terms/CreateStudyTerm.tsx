/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import "./style.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Layers } from "lucide-react";

import { useGetAcademicYearsQuery } from "@/store/academicYears/academicYearsApi";
import { useCreateStudyTermMutation } from "@/store/studyTerms/studyTermsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

import StudyTermFormSkeleton from "@/components/skeleton/StudyTermFormSkeleton";

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
import { Separator } from "@/components/ui/separator";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";

import type { IAcademicYear } from "@/types/academicYear";

type FormState = {
  name_ar: string;
  name_en: string;
  about_term: string;
  academic_year_id: number | "";
  is_active: boolean;
};

export default function CreateStudyTerm() {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.studyTerms.createStudyTerm;

  const { data: academicYears = [], isLoading: loadingYears } =
    useGetAcademicYearsQuery(undefined, { skip: !sessionReady });

  const [createStudyTerm, { isLoading: isCreating }] =
    useCreateStudyTermMutation();

  const [form, setForm] = useState<FormState>({
    name_ar: "",
    name_en: "",
    about_term: "",
    academic_year_id: "",
    is_active: true,
  });

  const yearLabel = (y: IAcademicYear) =>
    lang === "ar" ? y.name_ar || y.name : y.name_en || y.name;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.academic_year_id === "" || Number(form.academic_year_id) <= 0) {
      toast.error(
        lang === "ar"
          ? "يرجى اختيار العام الدراسي"
          : "Please select an academic year",
      );
      return;
    }

    if (!academicYears.length) {
      toast.error(
        lang === "ar"
          ? "لا توجد أعوام دراسية متاحة. أضف عامًا دراسيًا أولًا."
          : "No academic years available. Create an academic year first.",
      );
      return;
    }

    try {
      const res = await createStudyTerm({
        name_ar: form.name_ar,
        name_en: form.name_en,
        about_term: form.about_term,
        academic_year_id: Number(form.academic_year_id),
        is_active: form.is_active,
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

  if (!sessionReady || loadingYears) {
    return <StudyTermFormSkeleton />;
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
            {t?.description}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <Layers className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
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
                    value={form.name_ar}
                    onChange={(e) =>
                      setForm({ ...form, name_ar: e.target.value })
                    }
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
                    value={form.name_en}
                    onChange={(e) =>
                      setForm({ ...form, name_en: e.target.value })
                    }
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
                  value={form.about_term}
                  onChange={(e) =>
                    setForm({ ...form, about_term: e.target.value })
                  }
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
                <select
                  className={dash.select}
                  value={
                    form.academic_year_id === ""
                      ? ""
                      : String(form.academic_year_id)
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      academic_year_id:
                        e.target.value === ""
                          ? ""
                          : Number(e.target.value),
                    })
                  }
                >
                  <option value="">{t?.selectAcademicYear}</option>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {yearLabel(y)}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <Separator />

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(v) =>
                    setForm({ ...form, is_active: Boolean(v) })
                  }
                />
                <span className="text-sm font-medium text-slate-800">
                  {t?.isActive}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isCreating || !academicYears.length}
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
