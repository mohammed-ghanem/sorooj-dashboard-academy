/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./style.css";
import {
  Stethoscope,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  FileText,
  ShieldUser,
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const labelAlign = lang === "ar" ? "text-right" : "text-left";

  const { data: doctor, isLoading } = useGetDoctorByIdQuery(Number(id), {
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
    const withPlus = raw.startsWith("+") ? raw : raw ? `+${raw.replace(/\D/g, "")}` : "";
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
          messages.forEach((msg: string) => toast.error(msg))
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

  return (
    <div className="w-[75%] mx-auto py-10 px-4" dir="rtl">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold">
            <div className="flex items-center gap-2 rounded-xl icon_bg ">
              <ShieldUser className="w-5 h-5" />
            </div>
            {t?.title}
          </CardTitle>
          <CardDescription className={cn(lang === "ar" && "text-right")}>
            {t?.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className={cn("font-semibold mb-2 block", labelAlign)} htmlFor="doctor-edit-name">
                  {t?.name}
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="doctor-edit-name"
                    className="h-10 border-[#999] pl-10 focus-visible:ring-0"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoComplete="name"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className={cn("font-semibold mb-2 block", labelAlign)} htmlFor="doctor-edit-email">
                  {t?.email}
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="doctor-edit-email"
                    type="email"
                    className="h-10 border-[#999] pl-10 focus-visible:ring-0"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2" dir="ltr">
                <Label className={cn("font-semibold mb-2 block", labelAlign)} htmlFor="doctor-edit-mobile">
                  {t?.mobile}
                </Label>
                <PhoneInput
                  country="eg"
                  value={phoneDigits}
                  onChange={handlePhoneChange}
                  inputClass="!w-full !h-10 !pl-12 !border-[#999] !rounded-md"
                  containerClass="!w-full"
                  inputProps={{
                    id: "doctor-edit-mobile",
                    name: "mobile",
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label className={cn("font-semibold mb-2 block", labelAlign)} htmlFor="doctor-edit-position">
                  {t?.position}
                </Label>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="doctor-edit-position"
                    className="h-10 border-[#999] pl-10 focus-visible:ring-0"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label
                  className={cn("font-semibold mb-2 block", labelAlign)}
                  htmlFor="doctor-edit-specialization"
                >
                  {t?.specialization}
                </Label>
                <div className="relative">
                  <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="doctor-edit-specialization"
                    className="h-10 border-[#999] pl-10 focus-visible:ring-0"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className={cn("font-semibold mb-2 block", labelAlign)} htmlFor="doctor-edit-password">
                  {t?.password}
                </Label>
                <PasswordInputWithToggle
                  id="doctor-edit-password"
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1">
                <Label
                  className={cn("font-semibold mb-2 block", labelAlign)}
                  htmlFor="doctor-edit-password-confirm"
                >
                  {t?.confirmPassword}
                </Label>
                <PasswordInputWithToggle
                  id="doctor-edit-password-confirm"
                  value={form.password_confirmation}
                  onChange={(v) => setForm({ ...form, password_confirmation: v })}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className={cn("font-semibold mb-2 block", labelAlign)} htmlFor="doctor-edit-about">
                {t?.aboutDoctor}
              </Label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="doctor-edit-about"
                  className="min-h-[100px] border-[#999] pl-10 pt-2.5 focus-visible:ring-0"
                  value={form.about_doctor}
                  onChange={(e) => setForm({ ...form, about_doctor: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className={cn("font-semibold mb-2 block", labelAlign)}>{t?.avatar}</Label>
              <ImageDropzone
                file={form.avatar}
                existingImageUrl={doctor?.avatar ?? undefined}
                onFileChange={(file) => setForm({ ...form, avatar: file })}
              />
            </div>

            <Separator />

            <label
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition w-fit
                ${lang === "ar" ? "justify-end" : " flex-row-reverse justify-end"}
                ${
                  form.is_active
                    ? "border-green-500 bg-green-50 hover:bg-green-100"
                    : "hover:bg-muted"
                }`}
            >
              <span className="text-sm font-medium">{t?.isActive}</span>
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: Boolean(v) })}
              />
            </label>

            <Button
              type="submit"
              disabled={isUpdating}
              className="mx-auto block bg-green-700 hover:bg-green-600 font-semibold"
            >
              {isUpdating ? `${t?.processing}...` : `${t?.editBtn}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
