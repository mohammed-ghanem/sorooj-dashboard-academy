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

  const { data: cohort, isLoading } = useGetCohortByIdQuery(Number(id), {
    skip: !sessionReady,
  });

  const [updateCohort, { isLoading: isUpdating }] =
    useUpdateCohortMutation();

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
    return <CohortFormSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold ">
            <div className="flex items-center gap-2 rounded-xl icon_bg">
              <CalendarRange className="w-5 h-5 " />
            </div>
            {translate?.pages.cohorts.editCohort.title}
          </CardTitle>
          <CardDescription className="mr-1 font-semibold">
            {translate?.pages.cohorts.editCohort.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.cohorts.editCohort.nameAr}
                </Label>
                <Input
                  className="focus-visible:ring-0 border-[#999]"
                  {...register("name_ar", { required: true })}
                />
              </div>
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.cohorts.editCohort.nameEn}
                </Label>
                <Input
                  className="focus-visible:ring-0 border-[#999]"
                  {...register("name_en", { required: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.cohorts.editCohort.startDate}
                </Label>
                <Input
                  type="date"
                  className="focus-visible:ring-0 border-[#999]"
                  {...register("start_date", { required: true })}
                />
                <div className="text-xs text-muted-foreground">
                  {formatGregorianDateAr(watchedStartDate)}{" "}
                  <span className="mx-1">—</span>{" "}
                  {formatHijriFromGregorianDateAr(watchedStartDate)}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.cohorts.editCohort.endDate}
                </Label>
                <Input
                  type="date"
                  className="focus-visible:ring-0 border-[#999]"
                  {...register("end_date", { required: true })}
                />
                <div className="text-xs text-muted-foreground">
                  {formatGregorianDateAr(watchedEndDate)}{" "}
                  <span className="mx-1">—</span>{" "}
                  {formatHijriFromGregorianDateAr(watchedEndDate)}
                </div>
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
                {translate?.pages.cohorts.editCohort.isActive}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isUpdating}
              className="w-content block mx-auto gap-2 bg-green-700 hover:bg-green-600 font-semibold cursor-pointer"
            >
              {isUpdating
                ? `${translate?.pages.cohorts.editCohort.processing}...`
                : `${translate?.pages.cohorts.editCohort.editBtn}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
