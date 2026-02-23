"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import loginIcon from "@/public/assets/images/loginIcon.webp";
import LangUseParams from "@/translate/LangUseParams";

const LoginSkeleton = () => {
  const lang = LangUseParams();
  return (
    <div className="relative font-cairo" dir="rtl">
      <div className="grid lg:grid-cols-2 gap-4 items-center bgForm">
        {/* Form Skeleton */}
        <div className="my-10 h-screen md:h-auto" dir={`${lang === "ar" ? "rtl" : "ltr"}`}>
          {/* logo  */}
          <div className="flex justify-center mb-4">
            <Skeleton className="h-20 w-52" />
          </div>
          {/* Title */}
          <Skeleton className="h-8 w-52 mx-auto mb-8 " />

          <div className="p-4 w-[95%] md:w-[80%] mx-auto">
            {/* Email */}
            <div className="mb-4">
              <Skeleton className="h-4 w-24 mb-2" />

              <div className="relative">
                <Skeleton className="absolute inset-e-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>


            {/* Password */}
            <div className="mb-4">
              <Skeleton className="h-4 w-24 mb-2" />

              <div className="relative">
                {/* input */}
                <Skeleton className="h-10 w-full rounded-md" />
                {/* eye icon */}
                <Skeleton className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full" />
              </div>
            </div>

            {/* remember me + forget password */}
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-16" />
              </div>

              <Skeleton className="h-4 w-24" />
            </div>

            {/* Button */}
            <Skeleton className="h-12 w-[50%] mx-auto rounded-lg mt-5" />
          </div>
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

export default LoginSkeleton;
