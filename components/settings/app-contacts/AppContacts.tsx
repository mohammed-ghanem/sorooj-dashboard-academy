/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleCheckBig } from "lucide-react";

import { useSessionReady } from "@/hooks/useSessionReady";
import TranslateHook from "@/translate/TranslateHook";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

  if (!sessionReady) {
    return <AppContactsSkeleton />;
  }

  if (isLoading) {
    return <AppContactsSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-6 mx-4 my-10 bg-white rounded-2xl border text-center text-muted-foreground">
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
        (res as { message?: string })?.message ?? t?.successMessage
      );
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg))
        );
        return;
      }
      if (errorData?.message) {
        toast.error(errorData.message);
      }
    }
  };

  return (
    <div className="p-6 mx-4 my-10 space-y-6 bg-white rounded-2xl border border-solid border-[#ddd]">
      <h3 className="font-bold titleStyle cairo-font">{t?.title}</h3>

      <div className="space-y-4">
        <p className="titleDescription text-sm text-muted-foreground">
          {t?.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="app-contacts-mobile">{t?.mobile}</Label>
            <Input
              id="app-contacts-mobile"
              value={form.mobile}
              onChange={(e) => setField("mobile", e.target.value)}
              placeholder={t?.mobilePlaceholder}
              type="text"
              inputMode="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-contacts-whatsapp">{t?.whatsapp}</Label>
            <Input
              id="app-contacts-whatsapp"
              value={form.whatsapp}
              onChange={(e) => setField("whatsapp", e.target.value)}
              placeholder={t?.whatsappPlaceholder}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="app-contacts-email">{t?.email}</Label>
            <Input
              id="app-contacts-email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder={t?.emailPlaceholder}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t">
        <h4 className="font-semibold">{t?.socialTitle}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="app-contacts-facebook">{t?.facebook}</Label>
            <Input
              id="app-contacts-facebook"
              value={form.social.facebook}
              onChange={(e) => setSocial("facebook", e.target.value)}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-contacts-instagram">{t?.instagram}</Label>
            <Input
              id="app-contacts-instagram"
              value={form.social.instagram}
              onChange={(e) => setSocial("instagram", e.target.value)}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="app-contacts-x">{t?.x}</Label>
            <Input
              id="app-contacts-x"
              value={form.social.x}
              onChange={(e) => setSocial("x", e.target.value)}
              placeholder="https://"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        className="submitButton flex items-center gap-2"
        disabled={isSaving}
      >
        <CircleCheckBig className="h-4 w-4" />
        {isSaving ? t?.processing : t?.saveBtn}
      </button>
    </div>
  );
}
