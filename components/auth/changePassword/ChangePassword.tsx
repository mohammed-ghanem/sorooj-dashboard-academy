/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useChangePasswordMutation } from "@/store/auth/authApi";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ChangePasswordSkeleton from "./ChangePasswordSkeleton";


const ChangePassword = () => {
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [form, setForm] = useState({
    old_password: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false, });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = (key: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!form.old_password.trim()) {
      errors.push(translate?.pages.changePassword.oldRequired);
    }
    if (!form.password.trim()) {
      errors.push(translate?.pages.changePassword.newRequired);
    } else if (form.password.length < 8) {
      errors.push(
        translate?.pages.changePassword.minLength);
    }
    if (form.password !== form.password_confirmation) {
      errors.push(
        translate?.pages.changePassword.notMatch);
    }
    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length) {
      errors.forEach(err => toast.error(err));
      return;
    }

    try {
      const res = await changePassword(form).unwrap();
      toast.success(res?.message);

      setForm({
        old_password: "",
        password: "",
        password_confirmation: "",
      });

      setTimeout(() => {
        router.push(`/${lang}`);
      }, 1000);
    } catch (err: any) {
      const errorData = err?.data ?? err;

      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg))
        );
        return;
      }
    }
  };

  if (!translate) {
    return <ChangePasswordSkeleton />;
  }

  return (
    <div className=" flex items-center justify-center bg-muted/40 px-4" dir="ltr">
      <Card className="w-full max-w-3xl shadow-lg rounded-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {translate?.pages.changePassword.title}
          </CardTitle>
          <CardDescription>
            {translate?.pages.changePassword.subtitle}
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Old Password */}
            <div className="space-y-2">
              <Label dir={`${lang === "ar" ? "rtl" : "ltr"}`}>
                {translate?.pages.changePassword.oldPassword}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword.old ? "text" : "password"}
                  name="old_password"
                  value={form.old_password}
                  onChange={handleChange}
                  className=" focus-visible:ring-0! focus-visible:[box-shadow:none]! focus-visible:border-gray-400 "

                />
                <button
                  type="button"
                  onClick={() => togglePassword("old")}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                >
                  {showPassword.old ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label dir={`${lang === "ar" ? "rtl" : "ltr"}`}>
                {translate?.pages.changePassword.password}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword.new ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className=" focus-visible:ring-0! focus-visible:[box-shadow:none]! focus-visible:border-gray-400 "
                />
                <button
                  type="button"
                  onClick={() => togglePassword("new")}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                >
                  {showPassword.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground" dir={`${lang === "ar" ? "rtl" : "ltr"}`}>
                {translate?.pages.changePassword.passCondition}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label dir={`${lang === "ar" ? "rtl" : "ltr"}`} >
                {translate?.pages.changePassword.confirmPassword}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword.confirm ? "text" : "password"}
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  className=" focus-visible:ring-0! focus-visible:[box-shadow:none]! focus-visible:border-gray-400 "

                />
                <button
                  type="button"
                  onClick={() => togglePassword("confirm")}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                >
                  {showPassword.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end justify-center! items-center! space-x-3 my-2">
              <Button
                type="submit"
                className=" greenBgIcon p-5!"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {translate?.pages.changePassword.confirmBtn}
              </Button>

              <Button
                type="button"
                variant="destructive"
                className="hover:bg-red-600 cursor-pointer p-5!"
                onClick={() => router.push(`/${lang}`)}
              >
                {translate?.pages.changePassword.cancelBtn}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;