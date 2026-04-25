/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import "./style.css";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";

import {
  useGetAcademicYearByIdQuery,
  useUpdateAcademicYearMutation,
} from "@/store/academicYears/academicYearsApi";
import { useSessionReady } from "@/hooks/useSessionReady";

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

  const { data: academicYear, isLoading } = useGetAcademicYearByIdQuery(
    Number(id),
    {
      skip: !sessionReady,
    }
  );

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

  if (!sessionReady || isLoading) {
    return <AcademicYearFormSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold ">
            <div className="flex items-center gap-2 rounded-xl icon_bg">
              <GraduationCap className="w-5 h-5 " />
            </div>
            {translate?.pages.academicYears.editAcademicYear.title}
          </CardTitle>
          <CardDescription className="mr-1 font-semibold">
            {translate?.pages.academicYears.editAcademicYear.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.academicYears.editAcademicYear.nameAr}
                </Label>
                <Input
                  className="focus-visible:ring-0 border-[#999]"
                  {...register("name_ar", { required: true })}
                />
              </div>
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.academicYears.editAcademicYear.nameEn}
                </Label>
                <Input
                  className="focus-visible:ring-0 border-[#999]"
                  {...register("name_en", { required: true })}
                />
              </div>
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
                {translate?.pages.academicYears.editAcademicYear.isActive}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isUpdating}
              className="w-content block mx-auto gap-2 bg-green-700 hover:bg-green-600 font-semibold cursor-pointer"
            >
              {isUpdating
                ? `${translate?.pages.academicYears.editAcademicYear.processing}...`
                : `${translate?.pages.academicYears.editAcademicYear.editBtn}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
