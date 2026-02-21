"use client";

import { Skeleton } from "@/components/ui/skeleton";
import LangUseParams from "@/translate/LangUseParams";

const ForgetPasswordSkeleton = () => {
  const lang = LangUseParams();

  return (
    <div className="relative grdianBK font-cairo" style={{ direction: "rtl" }}>
      <div className="grid lg:grid-cols-2 gap-4 items-center">

        {/* Form Skeleton */}
        <div className="my-10" style={{ direction: "ltr" }}>
          
          {/* Title */}
          <Skeleton className="h-7 md:h-8 w-48 mx-auto mb-6" />

          <div className="p-4 w-[95%] md:w-[80%] mx-auto relative">
            
            {/* Email */}
            <div className="mb-4">
              <Skeleton
                className={`h-4 w-24 mb-2 ${
                  lang === "ar" ? "ml-auto" : ""
                }`}
              />

              <div className="relative">
                {/* Icon placeholder */}
                <Skeleton className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full" />
                
                {/* Input */}
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>

            {/* Button */}
            <Skeleton className="h-12 w-[50%] mx-auto rounded-lg mt-8" />
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

export default ForgetPasswordSkeleton;
