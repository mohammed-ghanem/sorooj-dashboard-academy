/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import "./style.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarRange } from "lucide-react";

import { useCreateCohortMutation } from "@/store/cohorts/cohortsApi";
import { useSessionReady } from "@/hooks/useSessionReady";

import CohortFormSkeleton from "./CohortFormSkeleton";

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
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export default function CreateCohort() {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const [createCohort, { isLoading: isCreating }] =
    useCreateCohortMutation();

  const [form, setForm] = useState<FormState>({
    name_ar: "",
    name_en: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await createCohort({
        name_ar: form.name_ar,
        name_en: form.name_en,
        start_date: form.start_date,
        end_date: form.end_date,
        is_active: form.is_active,
      }).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/cohorts`);
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
    return <CohortFormSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold">
            <div className="flex items-center gap-2 rounded-xl icon_bg">
              <CalendarRange className="w-5 h-5 " />
            </div>
            {translate?.pages.cohorts.createCohort.title}
          </CardTitle>
          <CardDescription>
            {translate?.pages.cohorts.createCohort.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.cohorts.createCohort.nameAr}
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
                  {translate?.pages.cohorts.createCohort.nameEn}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.cohorts.createCohort.startDate}
                </Label>
                <Input
                  type="date"
                  className="focus-visible:ring-0 border-[#999]"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.cohorts.createCohort.endDate}
                </Label>
                <Input
                  type="date"
                  className="focus-visible:ring-0 border-[#999]"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
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
                {translate?.pages.cohorts.createCohort.isActive}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isCreating}
              className="mx-auto block bg-green-700 hover:bg-green-600 font-semibold"
            >
              {isCreating
                ? `${translate?.pages.cohorts.createCohort.processing}...`
                : `${translate?.pages.cohorts.createCohort.createBtn}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
