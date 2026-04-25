/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import { useGetSubjectByIdQuery } from "@/store/subjects/subjectsApi";
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
import ViewSubjectSkeleton from "@/components/skeleton/ViewSubjectSkeleton";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

export default function ViewSubject() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const { data: studyTerms = [] } = useGetStudyTermsQuery(undefined, {
    skip: !sessionReady,
  });

  const { data: subject, isLoading, isError } = useGetSubjectByIdQuery(Number(id), {
    skip: !sessionReady || !id || Number.isNaN(Number(id)),
  });

  const displayStudyTerm = useMemo(() => {
    if (!subject) return "—";
    const nested = subject.study_term;
    if (nested) {
      const loc = parseLocalizedNameFromModel(nested);
      return lang === "ar"
        ? loc.name_ar || loc.name || loc.name_en || "—"
        : loc.name_en || loc.name || loc.name_ar || "—";
    }
    const row = studyTerms.find((a) => a.id === subject.study_term_id);
    if (row) {
      const loc = parseLocalizedNameFromModel(row);
      return lang === "ar" ? loc.name_ar || loc.name : loc.name_en || loc.name;
    }
    return subject.study_term_id ? `#${subject.study_term_id}` : "—";
  }, [subject, studyTerms, lang]);

  if (!sessionReady || isLoading) {
    return <ViewSubjectSkeleton />;
  }

  if (isError || !subject) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center text-muted-foreground">
        {translate?.pages.subjects.viewSubject.notFound}
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
              {translate?.pages.subjects.viewSubject.title}
              <CardDescription>
                {translate?.pages.subjects.viewSubject.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="font-semibold">
                {translate?.pages.subjects.viewSubject.name}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {subject.name || subject.name_ar || subject.name_en || "—"}
              </div>
            </div>
          </div>

          <div>
            <Label className="font-semibold">
              {translate?.pages.subjects.viewSubject.aboutSubject}
            </Label>
            <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
              {subject.about_subject || "—"}
            </div>
          </div>

          <div>
            <Label className="font-semibold">
              {translate?.pages.subjects.viewSubject.studyTerm}
            </Label>
            <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
              {displayStudyTerm}
            </div>
          </div>

          <div>
            <Label className="font-semibold">
              {translate?.pages.subjects.viewSubject.cover}
            </Label>
            <div className="mt-2">
              {subject.cover ? (
                <img
                  src={subject.cover}
                  alt="subject cover"
                  className="h-40 w-40 rounded-md object-cover border"
                />
              ) : (
                <div className="text-sm border rounded-md px-3 py-2 bg-muted">—</div>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <Label className="font-semibold">
              {translate?.pages.subjects.viewSubject.status}
            </Label>
            {subject.is_active ? (
              <Badge className="bg-green-600 font-semibold">
                {translate?.pages.subjects.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold">
                {translate?.pages.subjects.inactive}
              </Badge>
            )}
          </div>

          <Button
            type="button"
            className="block submitButton pt-1.5!"
            onClick={() => router.back()}
          >
            {translate?.pages.subjects.viewSubject.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
