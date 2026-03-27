/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import {
  Settings,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import SidebarSkeleton from "./SidebarSkeleton";
import { mainLinks, settingsLinks } from "./sidebarLinks";
import Image from "next/image";
import logo from "@/public/assets/images/logo.png";
const SideBar = () => {
  const lang = LangUseParams() as string;
  const translate = TranslateHook();
  const pathname = usePathname();

  const [openSettings, setOpenSettings] = useState(false);

  const isActive = (href: string) => {
    const pathWithoutLang = pathname.replace(`/${lang}`, "") || "/";
    const hrefWithoutLang = href.replace(`/${lang}`, "") || "/";

    return pathWithoutLang === hrefWithoutLang;
  };

  const isSettingsActive = () => {
    return settingsLinks(lang).some(link => isActive(link.href));
  };


  useEffect(() => {
    if (isSettingsActive()) {
      setOpenSettings(true);
    }
  }, [pathname, lang]);

  const linkClass = (active: boolean) =>
    `group flex items-center justify-center md:justify-start
     gap-0 md:gap-2 p-2 rounded font-semibold transition
     ${active
      ? "activeLink text-white hover-mainColor rounded-e-4xl "
      : "scoundColor hover-mainColor rounded-l-4xl "}`;

  if (!lang || !translate) return <SidebarSkeleton />;

  return (
    <aside
      className="
        fixed inset-y-0 inset-s-0 z-40
        h-screen w-14 md:w-60
        asideBg border-e flex flex-col
      "
    >
      <div className="p-4 font-bold text-lg mainColor flex justify-center md:justify-start">
        {/* logo  */}
        <div className="flex justify-center mb-4 m-auto md:ms-0">
          <Image className="" src={logo} alt="login icon" width={130} height={75} />
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 p-2">
          {mainLinks(lang).map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={linkClass(isActive(link.href))}
              >
                <link.icon size={18} />
                <span className="hidden md:inline">
                  {translate.sidebar[link.key]}
                </span>
              </Link>
            </li>
          ))}

          {/* Settings */}
          <li>
            <button
              onClick={() => setOpenSettings(!openSettings)}
              className={`
                w-full flex items-center justify-center md:justify-between
                p-2 rounded-md text-sm
                transition font-bold
                ${isSettingsActive()
                  ? "activeLink hover-mainColor"
                  : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <Settings size={18} />
                <span className="hidden md:inline">
                  {translate.sidebar.settings}
                </span>
              </span>

              <ChevronDown
                size={16}
                className={`hidden md:inline transition-transform ${openSettings ? "rotate-180" : ""
                  }`}
              />
            </button>

            <div
              className={`md:ms-6 mt-1 ms-3 space-y-1 overflow-hidden transition-all duration-300 
              ${openSettings ? " opacity-100" : "max-h-0 opacity-0"}`}
            >
              {settingsLinks(lang).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${linkClass(
                    isActive(link.href)
                  )} text-[16px]`}
                >
                  <ShieldCheck size={16} />
                  <span className="hidden md:inline">
                    {translate.sidebar[link.key]}
                  </span>
                </Link>
              ))}
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;