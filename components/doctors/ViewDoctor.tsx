/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import { useGetDoctorByIdQuery } from "@/store/doctors/doctorsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import TranslateHook from "@/translate/TranslateHook";

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
  const t = translate?.pages.doctors.viewDoctor;

  const { data: doctor, isLoading, isError } = useGetDoctorByIdQuery(Number(id), {
    skip: !sessionReady || !id || Number.isNaN(Number(id)),
  });

  if (!sessionReady || isLoading) {
    return <ViewDoctorSkeleton />;
  }

  if (isError || !doctor) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center text-muted-foreground">
        {t?.notFound}
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
              {t?.title}
              <CardDescription>{t?.description}</CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {doctor.avatar ? (
            <img
              src={doctor.avatar}
              alt="doctor avatar"
              className="h-24 w-24 rounded-xl object-cover border"
            />
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">{t?.name}</Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {doctor.name || "—"}
              </div>
            </div>
            <div>
              <Label className="font-semibold">{t?.email}</Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {doctor.email || "—"}
              </div>
            </div>
            <div>
              <Label className="font-semibold">{t?.mobile}</Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {doctor.mobile || "—"}
              </div>
            </div>
            <div>
              <Label className="font-semibold">{t?.position}</Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {doctor.position || "—"}
              </div>
            </div>
            <div>
              <Label className="font-semibold">{t?.specialization}</Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {doctor.specialization || "—"}
              </div>
            </div>
          </div>

          <div>
            <Label className="font-semibold">{t?.aboutDoctor}</Label>
            <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
              {doctor.about_doctor || "—"}
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <Label className="font-semibold">{t?.status}</Label>
            {doctor.is_active ? (
              <Badge className="bg-green-600 font-semibold">
                {translate?.pages.doctors.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold">
                {translate?.pages.doctors.inactive}
              </Badge>
            )}
          </div>

          <Button
            type="button"
            className="block submitButton pt-1.5!"
            onClick={() => router.back()}
          >
            {t?.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
