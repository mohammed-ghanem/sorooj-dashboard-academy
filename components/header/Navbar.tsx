"use client";

import { useEffect, useState } from "react";
import LangUseParams from "@/translate/LangUseParams";
import GlobeBtn from "./GlobeBtn";
import UserDropdown from "./UserDropdown";

const Navbar = () => {
  const lang = LangUseParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // wait for lang to be set
    if (lang) {
      setLoading(false);
    }
  }, [lang]);

  const IconSkeleton = ({ className }: { className?: string }) => (
    <div
      className={`w-8 h-8 rounded-full bg-gray-300 animate-pulse me-2 ${className || ""}`}
      aria-hidden="true"
    />
  );

  const ButtonSkeleton = () => (
    <div className="w-28 h-8 me-2 rounded-md bg-gray-300 animate-pulse" />
  );

  return (
    <nav className="top-0 z-20 " dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 ms-10 md:ms-0">
          {/* Desktop Navigation */}
          <div className="hidden md:block" />

          {/* Icons & Mobile Menu Button */}
          <div className="flex items-center space-x-4 ltr:space-x-4 rtl:space-x-reverse relative">
            {/* Loading Skeletons */}
            {loading ? (
              <>
                <IconSkeleton />
                <ButtonSkeleton />
              </>
            ) : (
              <>
                <GlobeBtn />
                <UserDropdown />
              </>
            )}


          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;