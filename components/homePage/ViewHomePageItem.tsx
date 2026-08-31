"use client";

import { useParams, useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { useSessionReady } from "@/hooks/useSessionReady";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";
import { getHomePageSection } from "@/constants/homePageSections";
import { getHomePageSectionHooks } from "@/store/homePage/homePageApis";
import type { HomePageSectionKey } from "@/types/homePageSection";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ViewAcademicYearSkeleton from "@/components/skeleton/ViewAcademicYearSkeleton";

type Props = { sectionKey: HomePageSectionKey };

export default function ViewHomePageItem({ sectionKey }: Props) {
  const { id } = useParams<{ id: string }>();
  const section = getHomePageSection(sectionKey);
  const hooks = getHomePageSectionHooks(sectionKey);
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const translate = TranslateHook();
  const shared = translate?.pages?.homePageSections;
  const pg = shared?.[section.dictKey];
  const itemId = Number(id);
  const Icon = section.icon;

  const { data: item, isLoading, isError } = hooks.useGetItemByIdQuery(itemId, {
    skip: !sessionReady || !id || Number.isNaN(itemId),
    refetchOnMountOrArgChange: true,
  });

  if (!sessionReady || isLoading) return <ViewAcademicYearSkeleton />;

  if (isError || !item) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {shared?.notFound}
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
              <span className="block leading-tight">{pg?.viewTitle}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {pg?.formDescription}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 px-4 py-8 md:px-10 md:py-10">
          <section className={dash.sectionNeutral}>
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <span className={dash.sectionIconWrap}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {pg?.formDescription}
              </p>
            </div>

            {section.hasIcon || section.hasImage ? (
              <div className="mb-6 flex flex-wrap gap-6">
                {section.hasIcon ? (
                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-800">
                      {shared?.icon}
                    </Label>
                    {item.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.icon}
                        alt=""
                        className="h-20 w-20 rounded-2xl border border-slate-200/90 object-contain bg-white p-2 shadow-sm ring-1 ring-slate-900/5"
                      />
                    ) : (
                      <div className={dash.viewFieldBox}>—</div>
                    )}
                  </div>
                ) : null}
                {section.hasImage ? (
                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-800">
                      {shared?.image}
                    </Label>
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt=""
                        className="h-36 w-56 rounded-2xl border border-slate-200/90 object-cover shadow-sm ring-1 ring-slate-900/5"
                      />
                    ) : (
                      <div className={dash.viewFieldBox}>—</div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label className="font-semibold text-slate-800">
                  {shared?.title}
                </Label>
                <div className={dash.viewFieldBox}>{item.title || "—"}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {shared?.description}
                </Label>
                <div
                  className={cn(
                    dash.viewFieldBox,
                    "min-h-12 whitespace-pre-wrap",
                  )}
                >
                  {item.description || "—"}
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">
              {shared?.status}
            </Label>
            {item.is_active ? (
              <Badge className="bg-emerald-600 px-3 py-1 font-semibold hover:bg-emerald-600">
                {shared?.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1 font-semibold">
                {shared?.inactive}
              </Badge>
            )}
          </div>

          <Button
            type="button"
            className={dash.viewBackButton}
            onClick={() => router.push(`/${lang}/${section.basePath}`)}
          >
            {shared?.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
