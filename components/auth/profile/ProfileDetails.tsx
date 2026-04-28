"use client";

import { useGetProfileQuery } from "@/store/auth/authApi";
import Link from "next/link";
import { SquarePen, User, Mail, Phone, Eye } from "lucide-react";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import ProfileSkeleton from "@/components/skeleton/ProfileSkeleton";

function ProfileDetails() {
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const t = translate?.pages.profile;

  const { data, isLoading } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const user = data?.data || data?.user || data;

  if (isLoading) return <ProfileSkeleton />;
  if (!user) return null;

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <Eye className="w-6 h-6" />
            </span>
            <div className="space-y-2 min-w-0 text-start">
              <span className="leading-tight block">{t?.title?.trim()}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {t?.titleUpdate?.trim()}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className={cn(dash.formCardContent, "space-y-8")}>
          <div className="flex flex-col items-center gap-4 pb-2 md:flex-row md:items-start md:gap-8">
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200/90 bg-linear-to-br from-emerald-50 to-teal-50 shadow-inner ring-2 ring-white">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-emerald-800" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2 text-center md:text-start">
              <p className="text-xl font-semibold text-slate-900">{user.name}</p>
              <Badge className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-900 ring-1 ring-emerald-200/70">
                {user.roles || t?.member}
              </Badge>
            </div>
          </div>

          <section className={dash.sectionNeutral}>
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <span className={dash.sectionIconWrap}>
                <User className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {t?.personalDetails}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="font-semibold text-slate-800">{t?.name}</Label>
                <div className={cn(dash.viewFieldBox, "mt-1 flex items-start gap-3")}>
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <span>{user.name}</span>
                </div>
              </div>

              <div>
                <Label className="font-semibold text-slate-800">{t?.email}</Label>
                <div className={cn(dash.viewFieldBox, "mt-1 flex items-start gap-3")}>
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <span className="break-all">{user.email}</span>
                </div>
              </div>

              {user.mobile ? (
                <div>
                  <Label className="font-semibold text-slate-800">
                    {t?.phone}
                  </Label>
                  <div
                    className={cn(dash.viewFieldBox, "mt-1 flex items-start gap-3")}
                    dir="ltr"
                  >
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{user.mobile}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <Button
            asChild
            className={cn(dash.formSubmit, "mx-auto flex w-full max-w-xs gap-2")}
          >
            <Link href={`/${lang}/update-profile`}>
              <SquarePen className="h-4 w-4 shrink-0" />
              {t?.editProfile}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileDetails;
