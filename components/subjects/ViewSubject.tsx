/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpenText, Eye } from "lucide-react";

import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import { useGetSubjectByIdQuery } from "@/store/subjects/subjectsApi";
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
import ViewSubjectSkeleton from "@/components/skeleton/ViewSubjectSkeleton";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

export default function ViewSubject() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const translate = TranslateHook();
  const t = translate?.pages.subjects.viewSubject;

  const { data: studyTerms = [] } = useGetStudyTermsQuery(undefined, {
    skip: !sessionReady,
  });

  const { data: subject, isLoading, isError } = useGetSubjectByIdQuery(
    Number(id),
    { skip: !sessionReady || !id || Number.isNaN(Number(id)) },
  );

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
      <div
        className={cn(dash.formPageNarrow, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {t?.notFound}
      </div>
    );
  }

  return (
    <div className={dash.formPageNarrow} dir={pageDir}>
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
                <BookOpenText className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {t?.description}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.name}
                </Label>
                <div className={dash.viewFieldBox}>
                  {subject.name || subject.name_ar || subject.name_en || "—"}
                </div>
              </div>

              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.aboutSubject}
                </Label>
                <div className={dash.viewFieldBox}>
                  {subject.about_subject || "—"}
                </div>
              </div>

              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.studyTerm}
                </Label>
                <div className={dash.viewFieldBox}>{displayStudyTerm}</div>
              </div>

              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.cover}
                </Label>
                <div className="mt-2">
                  {subject.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={subject.cover}
                      alt=""
                      className="h-40 w-40 rounded-2xl object-cover border border-slate-200/90 shadow-sm ring-1 ring-slate-900/5"
                    />
                  ) : (
                    <div className={dash.viewFieldBox}>—</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">
              {t?.status}
            </Label>
            {subject.is_active ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 font-semibold px-3 py-1">
                {translate?.pages.subjects.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold px-3 py-1">
                {translate?.pages.subjects.inactive}
              </Badge>
            )}
          </div>

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
