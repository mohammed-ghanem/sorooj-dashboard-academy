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
import TranslateHook from "@/translate/TranslateHook";
import AdminFormSkeleton from "@/components/skeleton/AdminFormSkeleton";


/* ===================== TYPES ===================== */
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

  const { data: admin, isLoading } = useGetAdminByIdQuery(Number(id), {
    skip: !sessionReady,
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
        ? admin.roles_ids.map((id: number) => Number(id))
        : [],
      isActive: Boolean(admin.is_active),
    });
  }, [admin, reset]);

  const onSubmit = async (data: EditAdminForm) => {
    try {
      const res = await updateAdmin({
        id: Number(id),
        data: {
          name: data.name,
          email: data.email,
          mobile: data.phone,
          role_id: data.roles_ids,
          is_active: data.isActive,
        },
      }).unwrap();

      toast.success(res?.message);
      router.push("/admins");
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

  if (!sessionReady || isLoading || rolesLoading) {
    return  <AdminFormSkeleton />
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold ">
          <div className="flex items-center gap-2 rounded-xl icon_bg">
              <User className="w-5 h-5 " />
            </div>
            {translate?.pages.admins.editAdmin.title}
          </CardTitle>
          <CardDescription className="mr-1 font-semibold">
            {translate?.pages.admins.editAdmin.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.admins.editAdmin.name}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 focus-visible:ring-0 border-[#999]"
                    {...register("name", { required: true })}
                    placeholder="Admin name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.admins.editAdmin.email}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 focus-visible:ring-0 border-[#999]"
                    {...register("email", { required: true })}
                    placeholder="Email address"
                  />
                </div>
              </div>
            </div>

            {/* PHONE */}
            <div className="space-y-1">
                <Label className="font-semibold mb-2">
                {translate?.pages.admins.editAdmin.phone}
                </Label>
              <div dir="ltr" className="focus-visible:border-[#999] border-[#999]">
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
                      inputClass="!w-full !h-10 !pl-12 !text-sm rounded-md "
                    />
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* ROLES */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-bold">
              <div className="flex items-center gap-2 rounded-xl icon_bg">
                    <ShieldCheck className="w-4 h-4" />
                </div>
                {translate?.pages.admins.editAdmin.role}
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-lg p-4">
                {roles.map((role: any) => (
                  <label
                        key={role.id}
                        htmlFor={`role-${role.id}`}
                        className={`flex items-center gap-2 rounded-md 
                          px-2 py-2 cursor-pointer hover:bg-gray-50 border
                          ${selectedRoles.includes(role.id) 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200'
                          }`}
                      >  
                    <Checkbox
                        id={`role-${role.id}`}
                        className="border-stone-400"
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
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-3">
              <Checkbox
                className=" border-stone-400!"
                checked={watch("isActive")}
                onCheckedChange={(v) =>
                  setValue("isActive", Boolean(v))
                }
              />
              <span className="text-sm">
                {translate?.pages.admins.editAdmin.isActive}
              </span>
            </div>

            {/* ACTION */}
            <Button
              type="submit"
              disabled={isUpdating}
              className="w-content block mx-auto gap-2 bg-green-700 hover:bg-green-600 font-semibold cursor-pointer"
            >
              {isUpdating 
              ?
              `${translate?.pages.admins.editAdmin.processing}...`
              :
              `${translate?.pages.admins.editAdmin.editBtn}`
                }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}