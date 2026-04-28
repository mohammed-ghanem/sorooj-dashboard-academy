/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { Eye, User } from "lucide-react";

import { useGetDoctorByIdQuery } from "@/store/doctors/doctorsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ViewDoctorSkeleton from "@/components/skeleton/ViewDoctorSkeleton";

export default function ViewDoctor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const t = translate?.pages.doctors.viewDoctor;

  const { data: doctor, isLoading, isError } = useGetDoctorByIdQuery(
    Number(id),
    {
      skip: !sessionReady || !id || Number.isNaN(Number(id)),
    },
  );

  if (!sessionReady || isLoading) {
    return <ViewDoctorSkeleton />;
  }

  if (isError || !doctor) {
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
                <User className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {t?.description}
              </p>
            </div>

            {doctor.avatar ? (
              <div className="mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={doctor.avatar}
                  alt=""
                  className="h-28 w-28 rounded-2xl object-cover border border-slate-200/90 shadow-sm ring-1 ring-slate-900/5"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.name}
                </Label>
                <div className={dash.viewFieldBox}>{doctor.name || "—"}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.email}
                </Label>
                <div className={dash.viewFieldBox}>{doctor.email || "—"}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.mobile}
                </Label>
                <div className={dash.viewFieldBox} dir="ltr">
                  {doctor.mobile || "—"}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.position}
                </Label>
                <div className={dash.viewFieldBox}>
                  {doctor.position || "—"}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.specialization}
                </Label>
                <div className={dash.viewFieldBox}>
                  {doctor.specialization || "—"}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label className="font-semibold text-slate-800">
                {t?.aboutDoctor}
              </Label>
              <div
                className={cn(
                  dash.viewFieldBox,
                  "whitespace-pre-wrap min-h-12",
                )}
              >
                {doctor.about_doctor || "—"}
              </div>
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">
              {t?.status}
            </Label>
            {doctor.is_active ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 font-semibold px-3 py-1">
                {translate?.pages.doctors.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold px-3 py-1">
                {translate?.pages.doctors.inactive}
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
