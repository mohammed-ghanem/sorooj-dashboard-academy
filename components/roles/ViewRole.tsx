/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { ShieldCheck, Eye } from "lucide-react";

import { useGetRoleByIdQuery } from "@/store/roles/rolesApi";
import { useSessionReady } from "@/hooks/useSessionReady";

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
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";
import ViewRoleSkeleton from "@/components/skeleton/ViewRoleSkeleton";

export default function ViewRole() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const t = translate?.pages.roles?.viewRole;

  const idNum = id != null ? Number(id) : NaN;
  const invalidId = id == null || Number.isNaN(idNum);

  const { data: role, isLoading, isError } = useGetRoleByIdQuery(
    { id: idNum, lang },
    {
      skip: !sessionReady || invalidId,
    },
  );

  if (!sessionReady || isLoading) {
    return <ViewRoleSkeleton />;
  }

  if (invalidId || isError || !role) {
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
    <div className={dash.formPageWide} dir={pageDir}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.nameAr}
                </Label>
                <div className={dash.viewFieldBox}>{role?.name_ar ?? "—"}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.nameEn}
                </Label>
                <div className={dash.viewFieldBox}>{role?.name_en ?? "—"}</div>
              </div>
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">
              {t?.status}
            </Label>
            {role.is_active ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 font-semibold px-3 py-1">
                {t?.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold px-3 py-1">
                {t?.inactive}
              </Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="flex flex-wrap items-center gap-3 font-semibold text-slate-900">
              <span className={dash.sectionIconWrap}>
                <ShieldCheck className="w-5 h-5" />
              </span>
              {t?.permissions}
            </Label>

            {role.permissions?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-2xl border border-slate-200/90 bg-white/70 p-4 ring-1 ring-slate-900/4">
                {role.permissions?.map((perm: any) => (
                  <div
                    key={perm.id}
                    className={cn(dash.viewFieldBox, "text-sm")}
                  >
                    {lang === "ar"
                      ? perm.name_ar ?? perm.name
                      : perm.name_en ?? perm.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {t?.noPermissions}
              </div>
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
