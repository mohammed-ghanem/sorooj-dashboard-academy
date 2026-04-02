/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import "./style.css";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { BookOpenCheck } from "lucide-react";

import { useGetAcademicYearsQuery } from "@/store/academicYears/academicYearsApi";
import {
  useGetStudyTermByIdQuery,
  useUpdateStudyTermMutation,
} from "@/store/studyTerms/studyTermsApi";
import { useSessionReady } from "@/hooks/useSessionReady";

import StudyTermFormSkeleton from "./StudyTermFormSkeleton";

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
  academic_year_id: number;
  is_active: boolean;
};

export default function EditStudyTerm() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const { data: academicYears = [], isLoading: loadingYears } =
    useGetAcademicYearsQuery(undefined, { skip: !sessionReady });

  const { data: studyTerm, isLoading } = useGetStudyTermByIdQuery(Number(id), {
    skip: !sessionReady,
  });

  const [updateStudyTerm, { isLoading: isUpdating }] =
    useUpdateStudyTermMutation();

  const { register, handleSubmit, reset, control } =
    useForm<EditStudyTermForm>({
      defaultValues: {
        name_ar: "",
        name_en: "",
        academic_year_id: 0,
        is_active: true,
      },
    });

  useEffect(() => {
    if (!studyTerm) return;

    const yearId =
      studyTerm.academic_year_id ||
      studyTerm.academic_year?.id ||
      0;

    reset({
      name_ar: studyTerm.name_ar ?? "",
      name_en: studyTerm.name_en ?? "",
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
          : "Please select an academic year"
      );
      return;
    }

    try {
      const res = await updateStudyTerm({
        id: Number(id),
        data: {
          name_ar: data.name_ar,
          name_en: data.name_en,
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

  if (!sessionReady || isLoading || loadingYears) {
    return <StudyTermFormSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold ">
            <div className="flex items-center gap-2 rounded-xl icon_bg">
              <BookOpenCheck className="w-5 h-5 " />
            </div>
            {translate?.pages.studyTerms.editStudyTerm.title}
          </CardTitle>
          <CardDescription className="mr-1 font-semibold">
            {translate?.pages.studyTerms.editStudyTerm.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.studyTerms.editStudyTerm.nameAr}
                </Label>
                <Input
                  className="focus-visible:ring-0 border-[#999]"
                  {...register("name_ar", { required: true })}
                />
              </div>
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.studyTerms.editStudyTerm.nameEn}
                </Label>
                <Input
                  className="focus-visible:ring-0 border-[#999]"
                  {...register("name_en", { required: true })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-semibold mb-2">
                {translate?.pages.studyTerms.editStudyTerm.academicYear}
              </Label>
              <Controller
                name="academic_year_id"
                control={control}
                rules={{ validate: (v) => v > 0 }}
                render={({ field }) => (
                  <select
                    className="flex h-10 w-full rounded-md border border-[#999] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
                    value={field.value > 0 ? String(field.value) : ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? 0 : Number(v));
                    }}
                  >
                    <option value="">
                      {translate?.pages.studyTerms.editStudyTerm.selectAcademicYear}
                    </option>
                    {academicYears.map((y) => (
                      <option key={y.id} value={y.id}>
                        {yearLabel(y)}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <Separator />

            <div className="flex items-center gap-3">
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
              <span className="text-sm">
                {translate?.pages.studyTerms.editStudyTerm.isActive}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isUpdating || !academicYears.length}
              className="w-content block mx-auto gap-2 bg-green-700 hover:bg-green-600 font-semibold cursor-pointer"
            >
              {isUpdating
                ? `${translate?.pages.studyTerms.editStudyTerm.processing}...`
                : `${translate?.pages.studyTerms.editStudyTerm.editBtn}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
