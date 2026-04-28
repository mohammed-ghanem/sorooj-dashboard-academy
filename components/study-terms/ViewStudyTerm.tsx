/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { Eye, Layers } from "lucide-react";

import { useGetAcademicYearsQuery } from "@/store/academicYears/academicYearsApi";
import { useGetStudyTermByIdQuery } from "@/store/studyTerms/studyTermsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import LangUseParams from "@/translate/LangUseParams";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import TranslateHook from "@/translate/TranslateHook";
import ViewStudyTermSkeleton from "@/components/skeleton/ViewStudyTermSkeleton";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

export default function ViewStudyTerm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const translate = TranslateHook();
  const t = translate?.pages.studyTerms.viewStudyTerm;

  const { data: academicYears = [] } = useGetAcademicYearsQuery(undefined, {
    skip: !sessionReady,
  });

  const { data: studyTerm, isLoading, isError } = useGetStudyTermByIdQuery(
    Number(id),
    { skip: !sessionReady || !id || Number.isNaN(Number(id)) },
  );

  const displayAcademicYear = () => {
    if (!studyTerm) return "—";
    const nested = studyTerm.academic_year;
    if (nested) {
      const loc = parseLocalizedNameFromModel(nested);
      return lang === "ar"
        ? loc.name_ar || loc.name || loc.name_en || "—"
        : loc.name_en || loc.name || loc.name_ar || "—";
    }
    const y = academicYears.find((a) => a.id === studyTerm.academic_year_id);
    if (y) {
      const loc = parseLocalizedNameFromModel(y);
      return lang === "ar"
        ? loc.name_ar || loc.name
        : loc.name_en || loc.name;
    }
    return studyTerm.academic_year_id
      ? `#${studyTerm.academic_year_id}`
      : "—";
  };

  if (!sessionReady || isLoading) {
    return <ViewStudyTermSkeleton />;
  }

  if (isError || !studyTerm) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {t?.notFound}
      </div>
    );
  }

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <Eye className="w-6 h-6" />
            </span>
            <div className="space-y-2 min-w-0">
              <span className="leading-tight block">{t?.title}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {t?.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 px-4 py-8 md:px-10 md:py-10">
          <section className={dash.sectionNeutral}>
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <span className={dash.sectionIconWrap}>
                <Layers className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {t?.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.nameAr}
                </Label>
                <div className={dash.viewFieldBox}>
                  {studyTerm.name_ar || "—"}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.nameEn}
                </Label>
                <div className={dash.viewFieldBox}>
                  {studyTerm.name_en || "—"}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label className="font-semibold text-slate-800">
                {t?.aboutTerm}
              </Label>
              <div
                className={cn(
                  dash.viewFieldBox,
                  "whitespace-pre-wrap min-h-12",
                )}
              >
                {studyTerm.about_term || "—"}
              </div>
            </div>

            <div className="mt-6">
              <Label className="font-semibold text-slate-800">
                {t?.academicYear}
              </Label>
              <div className={dash.viewFieldBox}>{displayAcademicYear()}</div>
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">
              {t?.status}
            </Label>
            {studyTerm.is_active ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 font-semibold px-3 py-1">
                {translate?.pages.studyTerms.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold px-3 py-1">
                {translate?.pages.studyTerms.inactive}
              </Badge>
            )}
          </div>

          {studyTerm.created_at ? (
            <>
              <Separator />
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.createdAt}
                </Label>
                <div className={dash.viewFieldBox}>{studyTerm.created_at}</div>
              </div>
            </>
          ) : null}

          <Button
            type="button"
            className={dash.viewBackButton}
            onClick={() => router.back()}
          >
            {t?.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
