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

/* ===================== COMPONENT ===================== */
export default function ViewRole() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const lang = LangUseParams(); 


  const { data: role, isLoading } =
  useGetRoleByIdQuery(
    { id: Number(id), lang },
    { skip: !sessionReady }
  );



  if (!sessionReady || isLoading) {
    return null;
  }

  if (!role) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Role not found
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
                 {translate?.pages.roles.viewRole.title}
                <CardDescription>
                  {translate?.pages.roles.viewRole.description}
                </CardDescription>
            </div>
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">
          {/* ROLE NAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label className="font-semibold">
                    {translate?.pages.roles.viewRole.nameAr}
                </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {role?.name_ar}
              </div>
            </div>
            <div>
                <Label className="font-semibold">
                    {translate?.pages.roles.viewRole.nameEn}
                </Label>
              <div className="mt-1 text-sm border rounded-md px-3 py-2 bg-muted">
                {role?.name_en}
              </div>
            </div>
          </div>
          <Separator />
          {/* STATUS */}
          <div className="flex items-center gap-3">
            <Label className="font-semibold icon_bg">
              {translate?.pages.roles.viewRole.status}
            </Label>
            {role.is_active ? (
              <Badge className="bg-green-600 font-semibold">
                {translate?.pages.roles.viewRole.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-semibold">
                {translate?.pages.roles.viewRole.inactive}
              </Badge>
            )}
          </div>
          <Separator />

          {/* PERMISSIONS */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 font-semibold">
                <div className="icon_bg">
                <ShieldCheck className="w-4 h-4 " />
                </div>
                {translate?.pages.roles.viewRole.permissions}
            </Label>

            {role.permissions?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-lg p-4">
                {/* {role.permissions.map((perm: any) => (
                  <div
                    key={perm.id}
                    className="text-sm px-3 py-2 rounded-md bg-muted"
                  >
                    {perm.name}
                  </div>
                ))} */}

                {role?.permissions?.map((perm: any) => (
                <div
                    key={perm.id}
                    className="px-3 py-2 text-sm rounded-md bg-muted"
                >
                    {/* get the right lang from backend accept language header */}
                {lang === "ar" ? perm.name_ar ?? perm.name : perm.name_en ?? perm.name}
                    </div>
                ))}

              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {translate?.pages.roles.viewRole.noPermissions}
              </div>
            )}
          </div>

          {/* ACTION */}
          <Button
            className="block submitButton pt-1.5! "
            onClick={() => router.back()}
          >
            {translate?.pages.roles.viewRole.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
