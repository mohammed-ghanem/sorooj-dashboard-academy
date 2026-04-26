"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Eye } from "lucide-react";

import { useGetStudentByIdQuery } from "@/store/students/studentsApi";
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
import ViewStudentSkeleton from "@/components/skeleton/ViewStudentSkeleton";
import type { IStudent } from "@/types/student";

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <Label className="font-semibold">{label}</Label>
      <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
        {value && String(value).trim() !== "" ? value : "—"}
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

  const t = translate?.pages.students;

  const { data: student, isLoading, isError } = useGetStudentByIdQuery(
    Number(id),
    { skip: !sessionReady || !id || Number.isNaN(Number(id)) }
  );

  if (!sessionReady || isLoading) {
    return <ViewStudentSkeleton />;
  }

  if (isError || !student) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center text-muted-foreground">
        {t?.viewStudent.notFound}
      </div>
    );
  }

  const s: IStudent = student;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl icon_bg">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              {t?.viewStudent.title}
              <CardDescription>
                {t?.viewStudent.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {s.avatar ? (
              <Image
                src="/assets/images/student.png"
                alt=""
                width={88}
                height={88}
                className="rounded-2xl object-cover border"
                unoptimized
              />
            ) : (
              <div className="h-[88px] w-[88px] rounded-2xl border bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                {s.name?.charAt(0)?.toUpperCase() ?? "—"}
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <p className="text-lg font-semibold truncate">{s.name}</p>
              <p className="text-sm text-muted-foreground truncate">{s.email}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t?.viewStudent.name ?? ""} value={s.name} />
            <Field label={t?.viewStudent.email ?? ""} value={s.email} />
            <Field label={t?.viewStudent.mobile ?? ""} value={s.mobile} />
            <Field
              label={t?.viewStudent.country ?? ""}
              value={s.country?.name}
            />
            <Field
              label={t?.viewStudent.dateOfBirth ?? ""}
              value={s.date_of_birth}
            />
            <Field
              label={t?.viewStudent.gender ?? ""}
              value={pickText(s.genderLabel, s.gender) ?? undefined}
            />
            <Field
              label={t?.viewStudent.educationLevel ?? ""}
              value={pickText(s.educationLevelLabel, s.educationLevel) ?? undefined}
            />
            <Field
              label={t?.viewStudent.joinPurpose ?? ""}
              value={pickText(s.joinPurposeLabel, s.joinPurpose) ?? undefined}
            />
            <Field
              label={t?.viewStudent.enrollment ?? ""}
              value={pickText(s.enrollmentStatusLabel, s.enrollmentStatus) ?? undefined}
            />
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <Label className="font-semibold">
              {t?.viewStudent.accountStatus}
            </Label>
            {s.is_active ? (
              <Badge className="bg-green-600 font-semibold">
                {translate?.pages.students.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold">
                {translate?.pages.students.inactive}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Label className="font-semibold">
              {t?.viewStudent.verification}
            </Label>
            {s.is_verified ? (
              <Badge className="bg-blue-600 font-semibold">
                {translate?.pages.students.verified}
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-semibold">
                {translate?.pages.students.notVerified}
              </Badge>
            )}
          </div>

          {s.created_at ? (
            <>
              <Separator />
              <Field
                label={t?.viewStudent.createdAt ?? ""}
                value={s.created_at}
              />
            </>
          ) : null}

          <Button
            type="button"
            className="block submitButton pt-1.5!"
            onClick={() => router.back()}
          >
            {t?.viewStudent.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
