"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, ChangeEvent, FormEvent } from "react";
import { useSendResetCodeMutation } from "@/store/auth/authApi";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { useRouter } from "next/navigation";
import Image from "next/image";
import forgetPass from "@/public/assets/images/forgetPass.webp";
import ForgetPasswordSkeleton from "./ForgetPasswordSkeleton";

const ForgetPassword = () => {
  const [sendResetCode, { isLoading }] = useSendResetCodeMutation();

  const lang = LangUseParams();
  const translate = TranslateHook();
  const router = useRouter();

  const [email, setEmail] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await sendResetCode({ email }).unwrap();

      toast.success(res?.message);

      router.push(
        `/${lang}/verify-code?email=${encodeURIComponent(email)}`
      );
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          }
        });
        return;
      }

      // Generic backend message
      if (errorData?.message) {
        toast.error(errorData.message);
        return;
      }
    }
  };

  if (!translate) {
    return <ForgetPasswordSkeleton />;
  }

  return (
    <div className="relative grdianBK font-cairo" style={{ direction: "rtl" }}>
      <div className="grid lg:grid-cols-2 gap-4 items-center">
        {/* Form */}
        <div className="my-10" style={{ direction: "ltr" }}>
          <h1 className="text-center font-bold text-xl md:text-2xl titleColor">
            {translate?.pages.forgetPassword?.title}
          </h1>

          <form
            onSubmit={handleSubmit}
            className="p-4 w-[95%] md:w-[80%] mx-auto z-30 relative"
          >
            <div className="mb-4">
              <label
                className={`block text-[13px] font-bold titleColor ${lang === "ar" ? "text-right!" : "text-left"
                  }`}
              >
                {translate?.pages.forgetPassword?.email}
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400! w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border bg-white border-gray-300 rounded-md shadow-sm outline-none"
                />
              </div>

            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-[50%] mx-auto  bgTitleColor cursor-pointer text-white py-3 mt-8 rounded-lg flex justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {translate?.pages.forgetPassword?.sending} ...
                  </>
                ) : (
                  translate?.pages.forgetPassword?.send)}
              </button>
            </div>
          </form>
        </div>

        {/* Image */}
        <div className="relative hidden lg:flex bkMainColor h-screen items-center justify-center">
          <div className="h-[50%]">
            <Image src={forgetPass} alt="bg" width={500} height={700} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;