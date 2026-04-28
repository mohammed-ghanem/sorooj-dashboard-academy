/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import "./style.css";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { User, Mail, ShieldCheck } from "lucide-react";

import {
  useGetAdminByIdQuery,
  useUpdateAdminMutation,
} from "@/store/admins/adminsApi";
import { useGetRolesQuery } from "@/store/roles/rolesApi";
import { useSessionReady } from "@/hooks/useSessionReady";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import AdminFormSkeleton from "@/components/skeleton/AdminFormSkeleton";

type EditAdminForm = {
  name: string;
  email: string;
  phone: string;
  roles_ids: number[];
  isActive: boolean;
};

export default function EditAdmin() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const translate = TranslateHook();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.admins?.editAdmin;

  const idNum = id != null ? Number(id) : NaN;
  const invalidId = id == null || Number.isNaN(idNum);

  const { data: admin, isLoading, isError } = useGetAdminByIdQuery(idNum, {
    skip: !sessionReady || invalidId,
  });

  const { data: rolesResponse, isLoading: rolesLoading } =
    useGetRolesQuery(undefined, { skip: !sessionReady });

  const roles = rolesResponse ?? [];

  const [updateAdmin, { isLoading: isUpdating }] =
    useUpdateAdminMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
  } = useForm<EditAdminForm>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roles_ids: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (!admin) return;

    reset({
      name: admin.name ?? "",
      email: admin.email ?? "",
      phone: admin.mobile ?? "",
      roles_ids: Array.isArray(admin.roles_ids)
        ? admin.roles_ids.map((rid: number) => Number(rid))
        : [],
      isActive: Boolean(admin.is_active),
    });
  }, [admin, reset]);

  const onSubmit = async (data: EditAdminForm) => {
    try {
      const res = await updateAdmin({
        id: idNum,
        data: {
          name: data.name,
          email: data.email,
          mobile: data.phone,
          role_id: data.roles_ids,
          is_active: data.isActive,
        },
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

  const selectedRoles = watch("roles_ids") ?? [];
  const inputIconPad = "ps-10";

  if (!sessionReady || rolesLoading) {
    return <AdminFormSkeleton />;
  }

  if (invalidId) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {t?.notFound}
      </div>
    );
  }

  if (isLoading) {
    return <AdminFormSkeleton />;
  }

  if (isError || !admin) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {t?.notFound}
      </div>
    );
  }

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
            {t?.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 md:space-y-10"
          >
            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <User className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {t?.titleUpdate}
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
                    <User className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className={cn("h-11", inputIconPad, dash.input)}
                      {...register("name", { required: true })}
                      placeholder="Admin name"
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
                    <Mail className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className={cn("h-11", inputIconPad, dash.input)}
                      {...register("email", { required: true })}
                      placeholder="Email address"
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
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <PhoneInput
                        country="eg"
                        value={field.value}
                        onChange={field.onChange}
                        containerClass="!w-full"
                        inputClass="!w-full !h-11 !ps-12 !rounded-xl !border-slate-200 !bg-white/95 !shadow-sm"
                      />
                    )}
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
                {t?.role}
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-slate-200/90 bg-white/60 p-4">
                {roles.map((role: any) => (
                  <label
                    key={role.id}
                    htmlFor={`role-${role.id}`}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition",
                      selectedRoles.includes(role.id)
                        ? "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-200/60"
                        : "border-slate-200 hover:bg-slate-50/80",
                    )}
                  >
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) => {
                        const newRoles = checked
                          ? [...selectedRoles, role.id]
                          : selectedRoles.filter((rid) => rid !== role.id);

                        setValue("roles_ids", newRoles, {
                          shouldDirty: true,
                        });
                      }}
                    />
                    <span className="text-sm">{role.name}</span>
                  </label>
                ))}
              </div>
            </section>

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={watch("isActive")}
                  onCheckedChange={(v) =>
                    setValue("isActive", Boolean(v))
                  }
                />
                <span className="text-sm text-slate-700">
                  {t?.isActive}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isUpdating}
                className={dash.formSubmit}
              >
                {isUpdating
                  ? `${t?.processing}...`
                  : `${t?.editBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
