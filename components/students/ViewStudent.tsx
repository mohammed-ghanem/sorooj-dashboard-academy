"use client";

import { useParams, useRouter } from "next/navigation";
import { Eye, Users } from "lucide-react";

import { useGetStudentByIdQuery } from "@/store/students/studentsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import TranslateHook from "@/translate/TranslateHook";
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
import ViewStudentSkeleton from "@/components/skeleton/ViewStudentSkeleton";
import type { IStudent } from "@/types/student";

function Field({
  label,
  value,
  dir,
}: {
  label: string;
  value: string | null | undefined;
  dir?: "ltr" | "rtl";
}) {
  const display =
    value && String(value).trim() !== "" ? String(value) : "—";
  return (
    <div>
      <Label className="font-semibold text-slate-800">{label}</Label>
      <div className={cn(dash.viewFieldBox)} dir={dir}>
        {display}
      </div>
    </div>
  );
}

function pickText(primary: string | null, fallback: string | null) {
  if (primary && String(primary).trim() !== "") return primary;
  if (fallback && String(fallback).trim() !== "") return fallback;
  return null;
}

export default function ViewStudent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const t = translate?.pages.students?.viewStudent;

  const { data: student, isLoading, isError } = useGetStudentByIdQuery(
    Number(id),
    { skip: !sessionReady || !id || Number.isNaN(Number(id)) }
  );

  if (!sessionReady || isLoading) {
    return <ViewStudentSkeleton />;
  }

  if (isError || !student) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {t?.notFound}
      </div>
    );
  }

  const s: IStudent = student;

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
                <Users className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {t?.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              {s.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.avatar}
                  alt=""
                  className="h-[88px] w-[88px] rounded-2xl object-cover border border-slate-200/90 shadow-sm ring-1 ring-slate-900/5"
                />
              ) : (
                <div className="h-[88px] w-[88px] rounded-2xl border border-slate-200/90 bg-slate-50 flex items-center justify-center text-2xl font-semibold text-slate-600 ring-1 ring-slate-900/5">
                  {s.name?.charAt(0)?.toUpperCase() ?? "—"}
                </div>
              )}
              <div className="space-y-1 min-w-0">
                <p className="text-lg font-semibold text-slate-900 truncate">
                  {s.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {s.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label={t?.name ?? ""} value={s.name} />
              <Field label={t?.email ?? ""} value={s.email} />
              <Field
                label={t?.mobile ?? ""}
                value={s.mobile}
                dir="ltr"
              />
              <Field
                label={t?.country ?? ""}
                value={s.country?.name}
              />
              <Field
                label={t?.dateOfBirth ?? ""}
                value={s.date_of_birth}
              />
              <Field
                label={t?.gender ?? ""}
                value={pickText(s.genderLabel, s.gender) ?? undefined}
              />
              <Field
                label={t?.educationLevel ?? ""}
                value={
                  pickText(s.educationLevelLabel, s.educationLevel) ??
                  undefined
                }
              />
              <Field
                label={t?.joinPurpose ?? ""}
                value={
                  pickText(s.joinPurposeLabel, s.joinPurpose) ?? undefined
                }
              />
              <Field
                label={t?.enrollment ?? ""}
                value={
                  pickText(s.enrollmentStatusLabel, s.enrollmentStatus) ??
                  undefined
                }
              />
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">
              {t?.accountStatus}
            </Label>
            {s.is_active ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 font-semibold px-3 py-1">
                {translate?.pages.students.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold px-3 py-1">
                {translate?.pages.students.inactive}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">
              {t?.verification}
            </Label>
            {s.is_verified ? (
              <Badge className="bg-sky-600 hover:bg-sky-600 font-semibold px-3 py-1">
                {translate?.pages.students.verified}
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-semibold px-3 py-1">
                {translate?.pages.students.notVerified}
              </Badge>
            )}
          </div>

          {s.created_at ? (
            <>
              <Separator />
              <Field
                label={t?.createdAt ?? ""}
                value={s.created_at}
              />
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
