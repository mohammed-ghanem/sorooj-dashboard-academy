/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import "./style.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpenCheck } from "lucide-react";

import { useGetAcademicYearsQuery } from "@/store/academicYears/academicYearsApi";
import { useCreateStudyTermMutation } from "@/store/studyTerms/studyTermsApi";
import { useSessionReady } from "@/hooks/useSessionReady";

import StudyTermFormSkeleton from "./StudyTermFormSkeleton";

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
  academic_year_id: number | "";
  is_active: boolean;
};

export default function CreateStudyTerm() {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const { data: academicYears = [], isLoading: loadingYears } =
    useGetAcademicYearsQuery(undefined, { skip: !sessionReady });

  const [createStudyTerm, { isLoading: isCreating }] =
    useCreateStudyTermMutation();

  const [form, setForm] = useState<FormState>({
    name_ar: "",
    name_en: "",
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
          : "Please select an academic year"
      );
      return;
    }

    if (!academicYears.length) {
      toast.error(
        lang === "ar"
          ? "لا توجد أعوام دراسية متاحة. أضف عامًا دراسيًا أولًا."
          : "No academic years available. Create an academic year first."
      );
      return;
    }

    try {
      const res = await createStudyTerm({
        name_ar: form.name_ar,
        name_en: form.name_en,
        academic_year_id: Number(form.academic_year_id),
        is_active: form.is_active,
      }).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/study-terms`);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg))
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
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold">
            <div className="flex items-center gap-2 rounded-xl icon_bg">
              <BookOpenCheck className="w-5 h-5 " />
            </div>
            {translate?.pages.studyTerms.createStudyTerm.title}
          </CardTitle>
          <CardDescription>
            {translate?.pages.studyTerms.createStudyTerm.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.studyTerms.createStudyTerm.nameAr}
                </Label>
                <Input
                  className="focus-visible:ring-0 border-[#999]"
                  value={form.name_ar}
                  onChange={(e) =>
                    setForm({ ...form, name_ar: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.studyTerms.createStudyTerm.nameEn}
                </Label>
                <Input
                  className="focus-visible:ring-0 border-[#999]"
                  value={form.name_en}
                  onChange={(e) =>
                    setForm({ ...form, name_en: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-semibold mb-2">
                {translate?.pages.studyTerms.createStudyTerm.academicYear}
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-[#999] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
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
                <option value="">
                  {translate?.pages.studyTerms.createStudyTerm.selectAcademicYear}
                </option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {yearLabel(y)}
                  </option>
                ))}
              </select>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) =>
                  setForm({ ...form, is_active: Boolean(v) })
                }
              />
              <span className="text-sm">
                {translate?.pages.studyTerms.createStudyTerm.isActive}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isCreating || !academicYears.length}
              className="mx-auto block bg-green-700 hover:bg-green-600 font-semibold"
            >
              {isCreating
                ? `${translate?.pages.studyTerms.createStudyTerm.processing}...`
                : `${translate?.pages.studyTerms.createStudyTerm.createBtn}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
