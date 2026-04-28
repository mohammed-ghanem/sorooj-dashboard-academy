/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./style.css";
import {
  ShieldUser,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useCreateDoctorMutation } from "@/store/doctors/doctorsApi";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ImageDropzone from "@/components/shared/ImageDropzone";
import PasswordInputWithToggle from "@/components/shared/PasswordInputWithToggle";
import DoctorFormSkeleton from "@/components/skeleton/DoctorFormSkeleton";

type FormState = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  password_confirmation: string;
  avatar: File | null;
  is_active: boolean;
  position: string;
  about_doctor: string;
  specialization: string;
};

export default function CreateDoctor() {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const t = translate?.pages.doctors.createDoctor;
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";

  const [createDoctor, { isLoading: isCreating }] = useCreateDoctorMutation();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    password_confirmation: "",
    avatar: null,
    is_active: true,
    position: "",
    about_doctor: "",
    specialization: "",
  });

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, mobile: `+${value}` }));
  };

  const phoneDigits = form.mobile ? form.mobile.replace(/\D/g, "") : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createDoctor(form).unwrap();
      toast.success(res?.message);
      router.push(`/${lang}/doctors`);
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

  if (!sessionReady) {
    return <DoctorFormSkeleton />;
  }

  const inputIconPad = "ps-10";

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <ShieldUser className="w-6 h-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {t?.description}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-8 md:space-y-10">
            <section
              aria-labelledby="doctor-create-profile"
              className={dash.sectionNeutral}
            >
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <User className="h-5 w-5" strokeWidth={2} />
                </span>
                <p
                  id="doctor-create-profile"
                  className="text-sm text-muted-foreground leading-relaxed max-w-2xl"
                >
                  {t?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-create-name"
                  >
                    {t?.name}
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="doctor-create-name"
                      className={cn("h-11", inputIconPad, dash.input)}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      autoComplete="name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-create-email"
                  >
                    {t?.email}
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="doctor-create-email"
                      type="email"
                      className={cn("h-11", inputIconPad, dash.input)}
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2" dir="ltr">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-create-mobile"
                  >
                    {t?.mobile}
                  </Label>
                  <PhoneInput
                    country="eg"
                    value={phoneDigits}
                    onChange={handlePhoneChange}
                    inputClass="!w-full !h-11 !ps-12 !rounded-xl !border-slate-200 !bg-white/95 !shadow-sm"
                    containerClass="!w-full"
                    inputProps={{
                      id: "doctor-create-mobile",
                      name: "mobile",
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-create-position"
                  >
                    {t?.position}
                  </Label>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="doctor-create-position"
                      className={cn("h-11", inputIconPad, dash.input)}
                      value={form.position}
                      onChange={(e) =>
                        setForm({ ...form, position: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-create-specialization"
                  >
                    {t?.specialization}
                  </Label>
                  <div className="relative">
                    <GraduationCap className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="doctor-create-specialization"
                      className={cn("h-11", inputIconPad, dash.input)}
                      value={form.specialization}
                      onChange={(e) =>
                        setForm({ ...form, specialization: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-create-password"
                  >
                    {t?.password}
                  </Label>
                  <PasswordInputWithToggle
                    id="doctor-create-password"
                    value={form.password}
                    onChange={(v) => setForm({ ...form, password: v })}
                    autoComplete="new-password"
                    inputClassName={cn("h-11", dash.input, "pl-10 pr-10")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-create-password-confirm"
                  >
                    {t?.confirmPassword}
                  </Label>
                  <PasswordInputWithToggle
                    id="doctor-create-password-confirm"
                    value={form.password_confirmation}
                    onChange={(v) =>
                      setForm({ ...form, password_confirmation: v })
                    }
                    autoComplete="new-password"
                    inputClassName={cn("h-11", dash.input, "pl-10 pr-10")}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Label
                  className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                  htmlFor="doctor-create-about"
                >
                  {t?.aboutDoctor}
                </Label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute inset-s-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="doctor-create-about"
                    className={cn("min-h-[120px] pt-2.5", inputIconPad, dash.input)}
                    value={form.about_doctor}
                    onChange={(e) =>
                      setForm({ ...form, about_doctor: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Label
                  className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                >
                  {t?.avatar}
                </Label>
                <ImageDropzone
                  file={form.avatar}
                  onFileChange={(file) => setForm({ ...form, avatar: file })}
                />
              </div>
            </section>

            <Separator />

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(v) =>
                    setForm({ ...form, is_active: Boolean(v) })
                  }
                />
                <span className="text-sm font-medium text-slate-800">
                  {t?.isActive}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isCreating}
                className={dash.formSubmit}
              >
                {isCreating ? `${t?.processing}...` : `${t?.createBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
