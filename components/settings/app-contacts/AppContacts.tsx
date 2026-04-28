/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleCheckBig, Smartphone, Share2 } from "lucide-react";

import { useSessionReady } from "@/hooks/useSessionReady";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  useGetAppContactsQuery,
  useUpdateAppContactsMutation,
} from "@/store/settings/appContactsApi";
import {
  type IAppContactsValue,
  emptyAppContacts,
} from "@/types/appContacts";
import AppContactsSkeleton from "@/components/skeleton/AppContactsSkeleton";

export default function AppContacts() {
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.settings.appContacts;

  const { data, isLoading, isError } = useGetAppContactsQuery(undefined, {
    skip: !sessionReady,
    refetchOnMountOrArgChange: true,
  });

  const [updateAppContacts, { isLoading: isSaving }] =
    useUpdateAppContactsMutation();

  const [form, setForm] = useState<IAppContactsValue>(emptyAppContacts);

  useEffect(() => {
    if (data) {
      setForm({
        mobile: data.mobile ?? "",
        whatsapp: data.whatsapp ?? "",
        email: data.email ?? "",
        social: {
          facebook: data.social?.facebook ?? "",
          instagram: data.social?.instagram ?? "",
          x: data.social?.x ?? "",
        },
      });
    }
  }, [data]);

  if (!sessionReady || isLoading) {
    return <AppContactsSkeleton />;
  }

  if (isError) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {t?.errorMessage}
      </div>
    );
  }

  const setField = (path: "mobile" | "whatsapp" | "email", v: string) => {
    setForm((p) => ({ ...p, [path]: v }));
  };

  const setSocial = (key: keyof IAppContactsValue["social"], v: string) => {
    setForm((p) => ({
      ...p,
      social: { ...p.social, [key]: v },
    }));
  };

  const submit = async () => {
    try {
      const res = await updateAppContacts(form).unwrap();
      toast.success(
        (res as { message?: string })?.message ?? t?.successMessage,
      );
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
        return;
      }
      if (errorData?.message) {
        toast.error(errorData.message);
      }
    }
  };

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <Smartphone className="w-6 h-6" />
            </span>
            <div className="space-y-2 min-w-0">
              <span className="leading-tight block">{t?.title}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {t?.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <div className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <Smartphone className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {t?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="app-contacts-mobile"
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.mobile}
                  </Label>
                  <Input
                    id="app-contacts-mobile"
                    value={form.mobile}
                    onChange={(e) => setField("mobile", e.target.value)}
                    placeholder={t?.mobilePlaceholder}
                    type="text"
                    inputMode="tel"
                    className={cn("h-11", dash.input)}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="app-contacts-whatsapp"
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.whatsapp}
                  </Label>
                  <Input
                    id="app-contacts-whatsapp"
                    value={form.whatsapp}
                    onChange={(e) => setField("whatsapp", e.target.value)}
                    placeholder={t?.whatsappPlaceholder}
                    className={cn("h-11", dash.input)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="app-contacts-email"
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.email}
                  </Label>
                  <Input
                    id="app-contacts-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder={t?.emailPlaceholder}
                    className={cn("h-11", dash.input)}
                  />
                </div>
              </div>
            </section>

            <Separator />

            <section className={dash.sectionNeutral}>
              <Label className="flex flex-wrap items-center gap-3 font-semibold text-slate-900 mb-6">
                <span className={dash.sectionIconWrap}>
                  <Share2 className="h-5 w-5" strokeWidth={2} />
                </span>
                {t?.socialTitle}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="app-contacts-facebook"
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.facebook}
                  </Label>
                  <Input
                    id="app-contacts-facebook"
                    value={form.social.facebook}
                    onChange={(e) => setSocial("facebook", e.target.value)}
                    placeholder="https://"
                    className={cn("h-11", dash.input)}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="app-contacts-instagram"
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.instagram}
                  </Label>
                  <Input
                    id="app-contacts-instagram"
                    value={form.social.instagram}
                    onChange={(e) => setSocial("instagram", e.target.value)}
                    placeholder="https://"
                    className={cn("h-11", dash.input)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="app-contacts-x"
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.x}
                  </Label>
                  <Input
                    id="app-contacts-x"
                    value={form.social.x}
                    onChange={(e) => setSocial("x", e.target.value)}
                    placeholder="https://"
                    className={cn("h-11", dash.input)}
                  />
                </div>
              </div>
            </section>

            <div className={dash.formFooterBar}>
              <Button
                type="button"
                onClick={submit}
                disabled={isSaving}
                className={cn(dash.formSubmit, "gap-2")}
              >
                <CircleCheckBig className="h-5 w-5 shrink-0" />
                {isSaving ? t?.processing : t?.saveBtn}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
