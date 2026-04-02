/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import { useGetAcademicYearsQuery } from "@/store/academicYears/academicYearsApi";
import { useGetStudyTermByIdQuery } from "@/store/studyTerms/studyTermsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import LangUseParams from "@/translate/LangUseParams";

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
import ViewStudyTermSkeleton from "./ViewStudyTermSkeleton";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

export default function ViewStudyTerm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const { data: academicYears = [] } = useGetAcademicYearsQuery(undefined, {
    skip: !sessionReady,
  });

  const { data: studyTerm, isLoading, isError } = useGetStudyTermByIdQuery(
    Number(id),
    { skip: !sessionReady || !id || Number.isNaN(Number(id)) }
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
      <div className="max-w-5xl mx-auto py-10 px-4 text-center text-muted-foreground">
        {translate?.pages.studyTerms.viewStudyTerm.notFound}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl icon_bg">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              {translate?.pages.studyTerms.viewStudyTerm.title}
              <CardDescription>
                {translate?.pages.studyTerms.viewStudyTerm.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">
                {translate?.pages.studyTerms.viewStudyTerm.nameAr}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {studyTerm.name_ar || "—"}
              </div>
            </div>
            <div>
              <Label className="font-semibold">
                {translate?.pages.studyTerms.viewStudyTerm.nameEn}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {studyTerm.name_en || "—"}
              </div>
            </div>
          </div>

          <div>
            <Label className="font-semibold">
              {translate?.pages.studyTerms.viewStudyTerm.academicYear}
            </Label>
            <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
              {displayAcademicYear()}
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <Label className="font-semibold">
              {translate?.pages.studyTerms.viewStudyTerm.status}
            </Label>
            {studyTerm.is_active ? (
              <Badge className="bg-green-600 font-semibold">
                {translate?.pages.studyTerms.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold">
                {translate?.pages.studyTerms.inactive}
              </Badge>
            )}
          </div>

          {studyTerm.created_at ? (
            <>
              <Separator />
              <div>
                <Label className="font-semibold">
                  {translate?.pages.studyTerms.viewStudyTerm.createdAt}
                </Label>
                <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                  {studyTerm.created_at}
                </div>
              </div>
            </>
          ) : null}

          <Button
            type="button"
            className="block submitButton pt-1.5!"
            onClick={() => router.back()}
          >
            {translate?.pages.studyTerms.viewStudyTerm.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
