"use client";

import Image from "next/image";
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

  const { data: item, isLoading, isError } = hooks.useGetItemByIdQuery(itemId, {
    skip: !sessionReady || !id || Number.isNaN(itemId),
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
          <div className="flex flex-wrap gap-4">
            {item.icon ? (
              <Image
                src={item.icon}
                alt=""
                width={72}
                height={72}
                className="h-18 w-18 rounded-xl object-contain ring-1 ring-slate-200"
              />
            ) : null}
            {item.image ? (
              <Image
                src={item.image}
                alt=""
                width={220}
                height={140}
                className="h-35 w-55 rounded-xl object-cover ring-1 ring-slate-200"
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              {shared?.title}
            </Label>
            <div className={dash.viewFieldBox}>{item.title || "—"}</div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              {shared?.description}
            </Label>
            <div className={dash.viewFieldBox}>{item.description || "—"}</div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">
              {shared?.status}
            </Label>
            <Badge className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-900 ring-1 ring-emerald-200/70">
              {item.is_active ? shared?.active : shared?.inactive}
            </Badge>
          </div>

          <Button
            type="button"
            className={dash.viewBackButton}
            onClick={() => router.back()}
          >
            {shared?.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
