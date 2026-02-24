/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useLoginMutation } from "@/store/auth/authApi";
import { toast } from "sonner";
import { Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import loginIcon from "@/public/assets/images/loginIcon.webp";
import Image from "next/image";
import logo from "@/public/assets/images/logo.png";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import LoginSkeleton from "./LoginSkeleton";






const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const lang = LangUseParams();
  const translate = TranslateHook();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  if (!translate) {
    return <LoginSkeleton />;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await login(form).unwrap();
      toast.success(res?.message);
      router.replace(`/${lang}`);
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

  return (
    <div className="relative font-cairo " dir="rtl">
      <div className="grid lg:grid-cols-2 gap-4 items-center bgForm">
        {/* Form */}
        <div className="my-10 h-screen md:h-auto" dir="ltr">
          {/* logo  */}
          <div className="flex justify-center mb-4">
            <Image src={logo} alt="login icon" width={200} height={200} />
          </div>
          <h1 className="text-center font-bold text-xl md:text-2xl authTitle">
            {translate.pages.login.loginTitle}
          </h1>

          <form
            onSubmit={handleSubmit}
            className="p-4 w-[95%] md:w-[80%] mx-auto"
          >

            {/* email input */}
            <div className="mb-4">
              <label
                className={`block text-[13px] font-bold titleColor ${lang === "ar" ? "text-right!" : "text-left"
                  }`}
              >
                {translate.pages.login.email}
              </label>

              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400! w-5 h-5" />

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2  border rounded-md bg-white
                   focus-visible:ring-0! focus-visible:outline-none!"
                />
              </div>
            </div>

            {/* password input */}

            <div className="mb-4">
              <label
                className={`block text-[13px] font-bold titleColor ${lang === "ar" ? "text-right!" : "text-left"
                  }`}
              >
                {translate.pages.login.passwordName}
              </label>

              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 pr-10 border rounded-md bg-white
                  focus-visible:ring-0! focus-visible:outline-none!"
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


            {/* remember me  */}
            <div className="flex items-center justify-between mt-2 mb-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4"
                />
                {translate.pages.login.rememberMe}
              </label>
              {/* forget password */}
              <a
                href={`/${lang}/forget-password`}
                className="border-b border-regal-blue text-sm mainColor"
              >
                {translate.pages.login.forgetPassword}
              </a>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-[50%] mx-auto  bgTitleColor cursor-pointer text-white py-3 mt-8 rounded-lg flex justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {translate.pages.login.processing}
                </>
              ) : (
                translate.pages.login.loginButton
              )}
            </button>
          </form>
        </div>

        {/* Image */}

        <div className="relative hidden lg:flex h-screen items-center justify-center ">
          <div className="h-[70%]">
            <Image src={loginIcon} alt="bg" width={800} height={1000} />
          </div>
        </div>





      </div>
    </div>
  );
};

export default Login;