/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import "./style.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";

import { useCreateAcademicYearMutation } from "@/store/academicYears/academicYearsApi";
import { useSessionReady } from "@/hooks/useSessionReady";

import AcademicYearFormSkeleton from "@/components/skeleton/AcademicYearFormSkeleton";

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

type FormState = {
  name_ar: string;
  name_en: string;
  is_active: boolean;
};

export default function CreateAcademicYear() {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const [createAcademicYear, { isLoading: isCreating }] =
    useCreateAcademicYearMutation();

  const [form, setForm] = useState<FormState>({
    name_ar: "",
    name_en: "",
    is_active: true,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await createAcademicYear({
        name_ar: form.name_ar,
        name_en: form.name_en,
        is_active: form.is_active,
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

  if (!sessionReady) {
    return <AcademicYearFormSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold">
            <div className="flex items-center gap-2 rounded-xl icon_bg">
              <GraduationCap className="w-5 h-5 " />
            </div>
            {translate?.pages.academicYears.createAcademicYear.title}
          </CardTitle>
          <CardDescription>
            {translate?.pages.academicYears.createAcademicYear.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.academicYears.createAcademicYear.nameAr}
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
                  {translate?.pages.academicYears.createAcademicYear.nameEn}
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

            <Separator />

            <div className="flex items-center gap-3">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) =>
                  setForm({ ...form, is_active: Boolean(v) })
                }
              />
              <span className="text-sm">
                {translate?.pages.academicYears.createAcademicYear.isActive}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isCreating}
              className="mx-auto block bg-green-700 hover:bg-green-600 font-semibold"
            >
              {isCreating
                ? `${translate?.pages.academicYears.createAcademicYear.processing}...`
                : `${translate?.pages.academicYears.createAcademicYear.createBtn}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
