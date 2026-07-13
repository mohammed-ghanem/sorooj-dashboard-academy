"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpenText, Eye } from "lucide-react";
import { useGetScientificTrackCategoriesQuery } from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
import { useGetScientificTrackSubjectByIdQuery } from "@/store/scientificTrackSubjects/scientificTrackSubjectsApi";
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

export default function ViewScientificTrackSubject() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const translate = TranslateHook();
  const t = translate?.pages.scientificTrackSubjects.viewSubject;
  const pg = translate?.pages.scientificTrackSubjects;

  const { data: categories = [] } = useGetScientificTrackCategoriesQuery(
    undefined,
    { skip: !sessionReady },
  );

  const { data: subject, isLoading, isError } =
    useGetScientificTrackSubjectByIdQuery(Number(id), {
      skip: !sessionReady || !id || Number.isNaN(Number(id)),
    });

  const displayCategory = useMemo(() => {
    if (!subject) return "—";
    if (subject.category?.name) return subject.category.name;
    const row = categories.find((c) => c.id === subject.category_id);
    return row?.name || (subject.category_id ? `#${subject.category_id}` : "—");
  }, [subject, categories]);

  if (!sessionReady || isLoading) return <ViewSubjectSkeleton />;

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
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl font-bold text-slate-900 md:text-2xl">
            <span className={dash.pageIconBox}>
              <Eye className="h-6 w-6" />
            </span>
            <div className="min-w-0 space-y-2">
              <span className="block leading-tight">{t?.title}</span>
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
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t?.description}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="font-semibold text-slate-800">{t?.name}</Label>
                <div className={dash.viewFieldBox}>{subject.name || "—"}</div>
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
                  {t?.category}
                </Label>
                <div className={dash.viewFieldBox}>{displayCategory}</div>
              </div>

              <div>
                <Label className="font-semibold text-slate-800">{t?.cover}</Label>
                <div className="mt-2">
                  {subject.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={subject.cover}
                      alt=""
                      className="h-40 w-40 rounded-2xl border border-slate-200/90 object-cover shadow-sm ring-1 ring-slate-900/5"
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
            <Label className="font-semibold text-slate-800">{t?.status}</Label>
            {subject.is_active ? (
              <Badge className="bg-emerald-600 px-3 py-1 font-semibold hover:bg-emerald-600">
                {pg?.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1 font-semibold">
                {pg?.inactive}
              </Badge>
            )}
          </div>

          {subject.created_at ? (
            <>
              <Separator />
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.createdAt}
                </Label>
                <div className={dash.viewFieldBox}>{subject.created_at}</div>
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
