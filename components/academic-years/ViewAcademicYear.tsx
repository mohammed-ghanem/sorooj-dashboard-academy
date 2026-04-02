/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import { useGetAcademicYearByIdQuery } from "@/store/academicYears/academicYearsApi";
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
import ViewAcademicYearSkeleton from "./ViewAcademicYearSkeleton";

export default function ViewAcademicYear() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const translate = TranslateHook();

  const { data: academicYear, isLoading, isError } = useGetAcademicYearByIdQuery(
    Number(id),
    { skip: !sessionReady || !id || Number.isNaN(Number(id)) }
  );

  if (!sessionReady || isLoading) {
    return <ViewAcademicYearSkeleton />;
  }

  if (isError || !academicYear) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center text-muted-foreground">
        {translate?.pages.academicYears.viewAcademicYear.notFound}
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
              {translate?.pages.academicYears.viewAcademicYear.title}
              <CardDescription>
                {translate?.pages.academicYears.viewAcademicYear.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">
                {translate?.pages.academicYears.viewAcademicYear.nameAr}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {academicYear.name_ar || "—"}
              </div>
            </div>
            <div>
              <Label className="font-semibold">
                {translate?.pages.academicYears.viewAcademicYear.nameEn}
              </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {academicYear.name_en || "—"}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <Label className="font-semibold">
              {translate?.pages.academicYears.viewAcademicYear.status}
            </Label>
            {academicYear.is_active ? (
              <Badge className="bg-green-600 font-semibold">
                {translate?.pages.academicYears.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold">
                {translate?.pages.academicYears.inactive}
              </Badge>
            )}
          </div>

          {academicYear.created_at ? (
            <>
              <Separator />
              <div>
                <Label className="font-semibold">
                  {translate?.pages.academicYears.viewAcademicYear.createdAt}
                </Label>
                <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                  {academicYear.created_at}
                </div>
              </div>
            </>
          ) : null}

          <Button
            type="button"
            className="block submitButton pt-1.5!"
            onClick={() => router.back()}
          >
            {translate?.pages.academicYears.viewAcademicYear.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
