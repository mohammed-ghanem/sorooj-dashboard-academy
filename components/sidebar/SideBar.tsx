/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import {
  Settings,
  ChevronDown,
  ShieldCheck,
  BookMarked,
  Route,
} from "lucide-react";
import { Fragment, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import SidebarSkeleton from "@/components/skeleton/SidebarSkeleton";
import {
  mainLinks,
  academicStudyLinks,
  independentTracksLinks,
  settingsLinks,
} from "./sidebarLinks";
import Image from "next/image";
import logo from "@/public/assets/images/logo.png";
import type { LucideIcon } from "lucide-react";

type SidebarLink = {
  href: string;
  icon?: LucideIcon;
  key: string;
};

const SideBar = () => {
  const lang = LangUseParams() as string;
  const translate = TranslateHook();
  const pathname = usePathname();

  const [openAcademicStudy, setOpenAcademicStudy] = useState(false);
  const [openIndependentTracks, setOpenIndependentTracks] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const pathWithoutLang = (pathname.replace(`/${lang}`, "") || "/").replace(
    /\/$/,
    "",
  ) || "/";

  const isActive = (href: string) => {
    const hrefWithoutLang =
      (href.replace(`/${lang}`, "") || "/").replace(/\/$/, "") || "/";

    return (
      pathWithoutLang === hrefWithoutLang ||
      pathWithoutLang.startsWith(`${hrefWithoutLang}/`)
    );
  };

  const isLinkGroupActive = (links: { href: string }[]) =>
    links.some((link) => isActive(link.href));

  const isAcademicStudyActive = () =>
    pathWithoutLang === "/academic-study" ||
    pathWithoutLang.startsWith("/academic-study/") ||
    isLinkGroupActive(academicStudyLinks(lang));

  const isIndependentTracksActive = () =>
    isLinkGroupActive(independentTracksLinks(lang));

  const isSettingsActive = () => isLinkGroupActive(settingsLinks(lang));

  useEffect(() => {
    if (isAcademicStudyActive()) {
      setOpenAcademicStudy(true);
    }
    if (isIndependentTracksActive()) {
      setOpenIndependentTracks(true);
    }
    if (isSettingsActive()) {
      setOpenSettings(true);
    }
  }, [pathname, lang]);

  const linkClass = (active: boolean) =>
    `group flex items-center justify-center md:justify-start
     gap-0 md:gap-2 p-2 rounded font-semibold transition
     ${
       active
         ? "activeLink text-white hover-mainColor rounded-e-4xl "
         : "scoundColor hover-mainColor rounded-l-4xl "
     }`;

  const groupButtonClass = (active: boolean) =>
    `w-full flex items-center justify-center md:justify-between
     p-2 rounded-md text-sm transition font-bold
     ${
       active
         ? "activeLink hover-mainColor"
         : "text-gray-600 hover:bg-gray-100"
     }`;

  const renderDropdown = ({
    open,
    setOpen,
    active,
    title,
    Icon,
    links,
  }: {
    open: boolean;
    setOpen: (value: boolean) => void;
    active: boolean;
    title: string;
    Icon: LucideIcon;
    links: SidebarLink[];
  }) => (
    <li>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={groupButtonClass(active)}
      >
        <span className="flex items-center gap-2">
          <Icon size={18} />
          <span className="hidden md:inline">{title}</span>
        </span>

        <ChevronDown
          size={16}
          className={`hidden md:inline transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`md:ms-6 mt-1 ms-3 space-y-1 overflow-hidden transition-all duration-300 
        ${open ? "opacity-100" : "max-h-0 opacity-0"}`}
      >
        {links.map((item) => {
          const ItemIcon = item.icon ?? ShieldCheck;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkClass(isActive(item.href))} text-[16px]`}
            >
              <ItemIcon size={16} />
              <span className="hidden md:inline">
                {translate.sidebar[item.key]}
              </span>
            </Link>
          );
        })}
      </div>
    </li>
  );

  if (!lang || !translate) return <SidebarSkeleton />;

  return (
    <aside
      className="
        fixed inset-y-0 inset-s-0 z-40
        h-screen w-14 md:w-60
        asideBg border-e flex flex-col
        overflow-y-scroll
      "
    >
      <div className="p-4 font-bold text-lg mainColor flex justify-center md:justify-start">
        <div className="flex justify-center mb-4 m-auto md:ms-0">
          <Image
            className=""
            src={logo}
            alt="login icon"
            width={130}
            height={75}
          />
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 p-2">
          {mainLinks(lang).map((link) => (
            <Fragment key={link.href}>
              <li>
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

              {link.key === "academicYears" ? (
                <>
                  {renderDropdown({
                    open: openAcademicStudy,
                    setOpen: setOpenAcademicStudy,
                    active: isAcademicStudyActive(),
                    title: translate.sidebar.academicStudy,
                    Icon: BookMarked,
                    links: academicStudyLinks(lang),
                  })}
                  {renderDropdown({
                    open: openIndependentTracks,
                    setOpen: setOpenIndependentTracks,
                    active: isIndependentTracksActive(),
                    title: translate.sidebar.independentTracks,
                    Icon: Route,
                    links: independentTracksLinks(lang),
                  })}
                </>
              ) : null}
            </Fragment>
          ))}

          {renderDropdown({
            open: openSettings,
            setOpen: setOpenSettings,
            active: isSettingsActive(),
            title: translate.sidebar.settings,
            Icon: Settings,
            links: settingsLinks(lang),
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
