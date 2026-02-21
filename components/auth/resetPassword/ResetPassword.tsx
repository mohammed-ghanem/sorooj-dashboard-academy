/* app/[lang]/reset-password/page.tsx */
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, FormEvent, useEffect } from "react";
import { useResetPasswordMutation } from "@/store/auth/authApi";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import restpass from "@/public/assets/images/restpass.webp";
import ResetPasswordSkeleton from "./ResetPasswordSkeleton";

const ResetPassword = () => {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const lang = LangUseParams();
  const translate = TranslateHook();
  const router = useRouter();
  const search = useSearchParams();

  const email = search.get("email") ?? "";
  const code = search.get("code") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Protect direct access
   */
  useEffect(() => {
    if (!email || !code) {
      router.replace(`/${lang}/forget-password`);
    }
  }, [email, code, lang, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error(
        translate?.pages.resetPassword?.passwordMismatch);
      return;
    }

    try {
      const res = await resetPassword({
        email,
        code,
        password,
        password_confirmation: confirm,
      }).unwrap();

      toast.success(
        res?.message ||
        translate?.pages.resetPassword?.success);

      router.replace(`/${lang}/login`);
    } catch (err: any) {
      const errorData = err?.data ?? err;

      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((msgs: any) =>
          Array.isArray(msgs) && msgs.forEach((m) => toast.error(m))
        );
        return;
      }
    }
  };

  if (!translate) {
    return <ResetPasswordSkeleton />;
  }

  return (
    <div className="relative grdianBK font-cairo" style={{ direction: "rtl" }}>
      <div className="grid lg:grid-cols-2 gap-4 items-center">
        <div className="my-10" style={{ direction: "ltr" }}>
          <h1 className="text-center font-bold text-xl md:text-2xl titleColor">
            {translate?.pages.resetPassword.title}
          </h1>

          <form
            onSubmit={handleSubmit}
            className="p-4 w-[95%] md:w-[80%] mx-auto"
          >
            {[
              {
                label: `${translate?.pages.resetPassword.password}`,
                value: password, set: setPassword
              },

              {
                label: `${translate?.pages.resetPassword.confirmPassword}`,
                value: confirm, set: setConfirm
              },

            ].map((f, i) => (
              <div key={i} className="mb-4" >
                <label
                  className={`block text-[13px] font-bold titleColor ${lang === "ar" ? "text-right!" : "text-left"
                    }`}
                >
                  {translate?.pages.resetPassword?.[f.label] || f.label}
                </label>
                <div className="relative">

                  <input
                    dir="ltr"
                    type={showPassword ? "text" : "password"}
                    required
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className={`mt-1 block w-full p-2 border bg-white rounded-md
                      focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-gray-400
                      `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                </div>

              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="w-[50%] mx-auto  bgTitleColor cursor-pointer text-white py-3 mt-8 rounded-lg flex justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {translate?.pages.resetPassword?.processing}
                </>
              ) : (
                translate?.pages.resetPassword?.confirmBtn)}
            </button>
          </form>
        </div>

        {/* Image */}
        <div className="relative hidden lg:flex bkMainColor h-screen items-center justify-center">
          <div className="h-[50%]">
            <Image src={restpass} alt="bg" width={500} height={700} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;