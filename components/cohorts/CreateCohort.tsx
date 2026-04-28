/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import "./style.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarRange } from "lucide-react";

import { useCreateCohortMutation } from "@/store/cohorts/cohortsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

import CohortFormSkeleton from "@/components/skeleton/CohortFormSkeleton";

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
import {
  formatGregorianDateAr,
  formatHijriFromGregorianDateAr,
} from "@/utils/dateFormat";

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
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.cohorts.createCohort;

  const [createCohort, { isLoading: isCreating }] = useCreateCohortMutation();

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

  if (!sessionReady) {
    return <CohortFormSkeleton />;
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
            {t?.description}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-8 md:space-y-10">
            <section
              aria-labelledby="cohort-create-main"
              className={dash.sectionNeutral}
            >
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <CalendarRange className="h-5 w-5" strokeWidth={2} />
                </span>
                <p
                  id="cohort-create-main"
                  className="text-sm text-muted-foreground leading-relaxed max-w-2xl"
                >
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
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                  />
                  <div className="text-xs text-muted-foreground">
                    {formatGregorianDateAr(form.start_date)}{" "}
                    <span className="mx-1">—</span>{" "}
                    {formatHijriFromGregorianDateAr(form.start_date)}
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
                    value={form.end_date}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                  />
                  <div className="text-xs text-muted-foreground">
                    {formatGregorianDateAr(form.end_date)}{" "}
                    <span className="mx-1">—</span>{" "}
                    {formatHijriFromGregorianDateAr(form.end_date)}
                  </div>
                </div>
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
                disabled={isCreating}
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
