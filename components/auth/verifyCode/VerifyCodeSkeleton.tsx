"use client";

import { Skeleton } from "@/components/ui/skeleton";
import LangUseParams from "@/translate/LangUseParams";

const CODE_LENGTH = 4;

const VerifyCodeSkeleton = () => {
  const lang = LangUseParams();

  return (
    <div className="relative grdianBK font-cairo" style={{ direction: "rtl" }}>
      <div className="grid lg:grid-cols-2 gap-4 items-center">

        {/* Form Skeleton */}
        <div className="my-10" style={{ direction: "ltr" }}>
          
          {/* Title */}
          <Skeleton className="h-7 md:h-8 w-56 mx-auto mb-6" />

          <div className="p-4 w-[95%] md:w-[80%] mx-auto">

            {/* Email */}
            <div className="mb-6">
              <Skeleton
                className={`h-4 w-28 mb-3 ${
                  lang === "ar" ? "ml-auto" : ""
                }`}
              />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>

            {/* OTP */}
            <div className="mb-6">
              <Skeleton
                className={`h-4 w-24 mb-3 ${
                  lang === "ar" ? "ml-auto" : ""
                }`}
              />

              <div className="flex gap-3 justify-center">
                {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="w-14 h-14 rounded-md"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Skeleton className="h-12 w-[50%] mx-auto rounded-lg mt-8" />

            {/* Resend */}
            <Skeleton className="h-4 w-32 mx-auto mt-5" />
          </div>
        </div>

        {/* Image Skeleton */}
        <div className="relative hidden lg:flex bkMainColor h-screen items-center justify-center">
          <div className="h-[50%] w-[60%]">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyCodeSkeleton;
