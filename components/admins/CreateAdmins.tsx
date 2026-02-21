/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import "./style.css" 
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { useCreateAdminMutation } from "@/store/admins/adminsApi";
import { useGetRolesQuery } from "@/store/roles/rolesApi";
import { useSessionReady } from "@/hooks/useSessionReady";

import AdminFormSkeleton from "./AdminFormSkeleton";

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
import TranslateHook from "@/translate/TranslateHook";

/* ===================== TYPES ===================== */
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

  /* ===================== DATA ===================== */
  const { data: rolesResponse, isLoading: rolesLoading } =
    useGetRolesQuery(undefined, { skip: !sessionReady });

  const roles = rolesResponse ?? [];

  const [createAdmin, { isLoading: isCreating }] =
    useCreateAdminMutation();

  const translate = TranslateHook();


  /* ===================== FORM STATE ===================== */
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    password_confirmation: "",
    role_id: [],
    is_active: true,
  });

  /* ===================== HELPERS ===================== */
  const toggleRole = (roleId: number) => {
    setForm((prev) => ({
      ...prev,
      role_id: prev.role_id.includes(roleId)
        ? prev.role_id.filter((id) => id !== roleId)
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

      toast.success(res?.message );
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

  /* ===================== LOADING ===================== */
  if (!sessionReady || rolesLoading) {
    return <AdminFormSkeleton />;
  }



  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold">
            <div className="flex items-center gap-2 rounded-xl icon_bg">
              <User className="w-5 h-5 " />
            </div>
            
            {translate?.pages.admins.createAdmin.title}
          </CardTitle>
          <CardDescription>
            {translate?.pages.admins.createAdmin.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            {/* BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.admins.createAdmin.name}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 focus-visible:ring-0 border-[#999]"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.admins.createAdmin.email}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 focus-visible:ring-0 border-[#999]"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* PHONE */}
            <div className="space-y-1">
              <Label className="font-semibold mb-2">
                {translate?.pages.admins.createAdmin.phone}
              </Label>
              <div dir="ltr">
                <PhoneInput
                  country="eg"
                  value={form.mobile}
                  onChange={(v) =>
                    setForm({ ...form, mobile: v })
                  }
                  containerClass="!w-full"
                  inputClass="!w-full !h-10 !pl-12 !text-sm rounded-md"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.admins.createAdmin.password}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 focus-visible:ring-0 border-[#999]"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.admins.createAdmin.confirmPassword}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 focus-visible:ring-0 border-[#999]"
                    type="password"
                    value={form.password_confirmation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password_confirmation: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* ROLES */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-bold">
                <div className="flex items-center gap-2 rounded-xl icon_bg">
                    <ShieldCheck className="w-4 h-4" />
                </div>
                {translate?.pages.admins.createAdmin.roles}
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-lg p-4">
                  {roles.map((role: any) => (
                     <label
                     key={role.id}
                     htmlFor={`role-${role.id}`}
                     className={`flex items-center gap-2 rounded-md 
                     px-2 py-2 cursor-pointer hover:bg-gray-50 border 
                     ${form.role_id.includes(role.id) 
                       ? 'border-green-500 bg-green-50' 
                       : 'border-gray-200'
                     }`}
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
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-3">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) =>
                  setForm({ ...form, is_active: Boolean(v) })
                }
              />
              <span className="text-sm">
                {translate?.pages.admins.createAdmin.isActive}
              </span>
            </div>

            {/* ACTION */}
            <Button
              type="submit"
              disabled={isCreating}
              className="mx-auto block bg-green-700 hover:bg-green-600 font-semibold"
            >
               {isCreating
              ?
              `${translate?.pages.admins.createAdmin.processing}...`
              :
              `${translate?.pages.admins.createAdmin.createBtn}`
                }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}