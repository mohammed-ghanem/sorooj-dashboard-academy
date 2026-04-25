/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { CalendarRange, Eye } from "lucide-react";

import { useGetCohortByIdQuery } from "@/store/cohorts/cohortsApi";
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
import TranslateHook from "@/translate/TranslateHook";
import ViewCohortSkeleton from "@/components/skeleton/ViewCohortSkeleton";
import { formatGregorianDateAr, formatHijriDateAr } from "@/utils/dateFormat";

export default function ViewCohort() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const translate = TranslateHook();

  const { data: cohort, isLoading, isError } = useGetCohortByIdQuery(
    Number(id),
    { skip: !sessionReady || !id || Number.isNaN(Number(id)) }
  );

  if (!sessionReady || isLoading) {
    return <ViewCohortSkeleton />;
  }

  if (isError || !cohort) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center text-muted-foreground">
        {translate?.pages.cohorts.viewCohort.notFound}
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
              {translate?.pages.cohorts.viewCohort.title}
              <CardDescription>
                {translate?.pages.cohorts.viewCohort.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">
                {translate?.pages.cohorts.viewCohort.nameAr}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {cohort.name_ar || "—"}
              </div>
            </div>
            <div>
              <Label className="font-semibold">
                {translate?.pages.cohorts.viewCohort.nameEn}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {cohort.name_en || "—"}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                {translate?.pages.cohorts.viewCohort.startDateGregorian}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {formatGregorianDateAr(cohort.start_date)}
              </div>
            </div>
            <div>
              <Label className="font-semibold flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                {translate?.pages.cohorts.viewCohort.endDateGregorian}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {formatGregorianDateAr(cohort.end_date)}
              </div>
            </div>
            <div>
              <Label className="font-semibold">
                <CalendarRange className="h-4 w-4" />
                {translate?.pages.cohorts.viewCohort.startDateHijri}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {formatHijriDateAr(cohort.start_date_hijri)}
              </div>
            </div>
            <div>
              <Label className="font-semibold">
                <CalendarRange className="h-4 w-4" />
                {translate?.pages.cohorts.viewCohort.endDateHijri}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {formatHijriDateAr(cohort.end_date_hijri)}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <Label className="font-semibold">
              {translate?.pages.cohorts.viewCohort.status}
            </Label>
            {cohort.is_active ? (
              <Badge className="bg-green-600 font-semibold">
                {translate?.pages.cohorts.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold">
                {translate?.pages.cohorts.inactive}
              </Badge>
            )}
          </div>

          {cohort.created_at ? (
            <>
              <Separator />
              <div>
                <Label className="font-semibold">
                  {translate?.pages.cohorts.viewCohort.createdAt}
                </Label>
                <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                  {cohort.created_at}
                </div>
              </div>
            </>
          ) : null}

          <Button
            type="button"
            className="block submitButton pt-1.5!"
            onClick={() => router.back()}
          >
            {translate?.pages.cohorts.viewCohort.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
