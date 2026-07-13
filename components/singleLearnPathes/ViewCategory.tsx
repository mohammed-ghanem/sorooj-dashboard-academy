"use client";

import { useParams, useRouter } from "next/navigation";
import { Eye, FolderTree } from "lucide-react";
import { useGetScientificTrackCategoryByIdQuery } from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
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
import ViewAcademicYearSkeleton from "@/components/skeleton/ViewAcademicYearSkeleton";

export default function ViewCategory() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const translate = TranslateHook();
  const t = translate?.pages.scientificTrackCategories.viewCategory;
  const pg = translate?.pages.scientificTrackCategories;

  const { data: category, isLoading, isError } =
    useGetScientificTrackCategoryByIdQuery(Number(id), {
      skip: !sessionReady || !id || Number.isNaN(Number(id)),
    });

  if (!sessionReady || isLoading) return <ViewAcademicYearSkeleton />;

  if (isError || !category) {
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
                <FolderTree className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t?.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label className="font-semibold text-slate-800">{t?.name}</Label>
                <div className={dash.viewFieldBox}>{category.name || "—"}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.aboutCategory}
                </Label>
                <div className={dash.viewFieldBox}>
                  {category.about_category || "—"}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">{t?.status}</Label>
            {category.is_active ? (
              <Badge className="bg-emerald-600 px-3 py-1 font-semibold hover:bg-emerald-600">
                {pg?.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1 font-semibold">
                {pg?.inactive}
              </Badge>
            )}
          </div>

          {category.created_at ? (
            <>
              <Separator />
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.createdAt}
                </Label>
                <div className={dash.viewFieldBox}>{category.created_at}</div>
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
