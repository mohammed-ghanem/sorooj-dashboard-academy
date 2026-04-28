/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  useGetDoctorByIdQuery,
  useUpdateDoctorMutation,
} from "@/store/doctors/doctorsApi";
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

export default function EditDoctor() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const t = translate?.pages.doctors.editDoctor;
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";

  const {
    data: doctor,
    isLoading,
    isError,
  } = useGetDoctorByIdQuery(Number(id), {
    skip: !sessionReady || !id || Number.isNaN(Number(id)),
  });
  const [updateDoctor, { isLoading: isUpdating }] = useUpdateDoctorMutation();

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

  useEffect(() => {
    if (!doctor) return;
    const raw = String(doctor.mobile ?? "").trim();
    const withPlus = raw.startsWith("+")
      ? raw
      : raw
        ? `+${raw.replace(/\D/g, "")}`
        : "";
    setForm((prev) => ({
      ...prev,
      name: doctor.name ?? "",
      email: doctor.email ?? "",
      mobile: withPlus,
      is_active: Boolean(doctor.is_active),
      position: doctor.position ?? "",
      about_doctor: doctor.about_doctor ?? "",
      specialization: doctor.specialization ?? "",
    }));
  }, [doctor]);

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, mobile: `+${value}` }));
  };

  const phoneDigits = form.mobile ? form.mobile.replace(/\D/g, "") : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        is_active: form.is_active,
        position: form.position,
        about_doctor: form.about_doctor,
        specialization: form.specialization,
        avatar: form.avatar,
        ...(form.password ? { password: form.password } : {}),
        ...(form.password_confirmation
          ? { password_confirmation: form.password_confirmation }
          : {}),
      };

      const res = await updateDoctor({
        id: Number(id),
        data: payload,
      }).unwrap();

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

  if (!sessionReady || isLoading) {
    return <DoctorFormSkeleton />;
  }

  if (isError || !doctor) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {translate?.pages.doctors.viewDoctor.notFound}
      </div>
    );
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
            {t?.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-8 md:space-y-10">
            <section
              aria-labelledby="doctor-edit-profile"
              className={dash.sectionNeutral}
            >
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <User className="h-5 w-5" strokeWidth={2} />
                </span>
                <p
                  id="doctor-edit-profile"
                  className="text-sm text-muted-foreground leading-relaxed max-w-2xl"
                >
                  {t?.titleUpdate}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-edit-name"
                  >
                    {t?.name}
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="doctor-edit-name"
                      className={cn("h-11", inputIconPad, dash.input)}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      autoComplete="name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-edit-email"
                  >
                    {t?.email}
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="doctor-edit-email"
                      type="email"
                      className={cn("h-11", inputIconPad, dash.input)}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2" dir="ltr">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-edit-mobile"
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
                      id: "doctor-edit-mobile",
                      name: "mobile",
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-edit-position"
                  >
                    {t?.position}
                  </Label>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="doctor-edit-position"
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
                    htmlFor="doctor-edit-specialization"
                  >
                    {t?.specialization}
                  </Label>
                  <div className="relative">
                    <GraduationCap className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="doctor-edit-specialization"
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
                    htmlFor="doctor-edit-password"
                  >
                    {t?.password}
                  </Label>
                  <PasswordInputWithToggle
                    id="doctor-edit-password"
                    value={form.password}
                    onChange={(v) => setForm({ ...form, password: v })}
                    autoComplete="new-password"
                    inputClassName={cn("h-11", dash.input, "pl-10 pr-10")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className={cn("text-sm font-semibold text-slate-800", labelAlign)}
                    htmlFor="doctor-edit-password-confirm"
                  >
                    {t?.confirmPassword}
                  </Label>
                  <PasswordInputWithToggle
                    id="doctor-edit-password-confirm"
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
                  htmlFor="doctor-edit-about"
                >
                  {t?.aboutDoctor}
                </Label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="doctor-edit-about"
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
                  existingImageUrl={doctor?.avatar ?? undefined}
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
                disabled={isUpdating}
                className={dash.formSubmit}
              >
                {isUpdating ? `${t?.processing}...` : `${t?.editBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
