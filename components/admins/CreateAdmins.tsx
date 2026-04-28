/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import "./style.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Mail, ShieldCheck } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { useCreateAdminMutation } from "@/store/admins/adminsApi";
import { useGetRolesQuery } from "@/store/roles/rolesApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

import AdminFormSkeleton from "@/components/skeleton/AdminFormSkeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import PasswordInputWithToggle from "@/components/shared/PasswordInputWithToggle";

type FormState = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  password_confirmation: string;
  role_id: number[];
  is_active: boolean;
};

export default function CreateAdmin() {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.admins?.createAdmin;

  const { data: rolesResponse, isLoading: rolesLoading } =
    useGetRolesQuery(undefined, { skip: !sessionReady });

  const roles = rolesResponse ?? [];

  const [createAdmin, { isLoading: isCreating }] =
    useCreateAdminMutation();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    password_confirmation: "",
    role_id: [],
    is_active: true,
  });

  const toggleRole = (roleId: number) => {
    setForm((prev) => ({
      ...prev,
      role_id: prev.role_id.includes(roleId)
        ? prev.role_id.filter((rid) => rid !== roleId)
        : [...prev.role_id, roleId],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await createAdmin({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        password_confirmation: form.password_confirmation,
        role_id: form.role_id,
        is_active: form.is_active,
      }).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/admins`);
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
        return;
      }
    }
  };

  if (!sessionReady || rolesLoading) {
    return <AdminFormSkeleton />;
  }

  const inputIconPad = "ps-10";

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <User className="w-6 h-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {t?.description}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral} aria-labelledby="admin-create-account">
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <User className="h-5 w-5" strokeWidth={2} />
                </span>
                <p
                  id="admin-create-account"
                  className="text-sm text-muted-foreground leading-relaxed max-w-2xl"
                >
                  {t?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.name}
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className={cn("h-11", inputIconPad, dash.input)}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.email}
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      className={cn("h-11", inputIconPad, dash.input)}
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2" dir="ltr">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.phone}
                  </Label>
                  <PhoneInput
                    country="eg"
                    value={form.mobile}
                    onChange={(v) => setForm({ ...form, mobile: v })}
                    containerClass="!w-full"
                    inputClass="!w-full !h-11 !ps-12 !rounded-xl !border-slate-200 !bg-white/95 !shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.password}
                  </Label>
                  <PasswordInputWithToggle
                    value={form.password}
                    onChange={(v) => setForm({ ...form, password: v })}
                    inputClassName={cn("h-11", dash.input, "pl-10 pr-10")}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.confirmPassword}
                  </Label>
                  <PasswordInputWithToggle
                    value={form.password_confirmation}
                    onChange={(v) =>
                      setForm({ ...form, password_confirmation: v })
                    }
                    inputClassName={cn("h-11", dash.input, "pl-10 pr-10")}
                  />
                </div>
              </div>
            </section>

            <Separator />

            <section className={dash.sectionNeutral}>
              <Label className="flex flex-wrap items-center gap-3 font-semibold text-slate-900 mb-4">
                <span className={dash.sectionIconWrap}>
                  <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                </span>
                {t?.roles}
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-slate-200/90 bg-white/60 p-4">
                {roles.map((role: any) => (
                  <label
                    key={role.id}
                    htmlFor={`role-${role.id}`}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition",
                      form.role_id.includes(role.id)
                        ? "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-200/60"
                        : "border-slate-200 hover:bg-slate-50/80",
                    )}
                  >
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={form.role_id.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <span className="text-sm">{role.name}</span>
                  </label>
                ))}
              </div>
            </section>

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(v) =>
                    setForm({ ...form, is_active: Boolean(v) })
                  }
                />
                <span className="text-sm text-slate-700">
                  {t?.isActive}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isCreating}
                className={dash.formSubmit}
              >
                {isCreating
                  ? `${t?.processing}...`
                  : `${t?.createBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
