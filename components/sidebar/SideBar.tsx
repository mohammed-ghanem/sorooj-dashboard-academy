/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import {
  Settings,
  ChevronDown,
  ShieldCheck,
  BookMarked,
  Route,
  Library,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import SidebarSkeleton from "@/components/skeleton/SidebarSkeleton";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import {
  mainLinks,
  academicStudyLinks,
  independentTracksLinks,
  scientificLibraryLinks,
  settingsLinks,
  isNavHrefActive,
  isLinkGroupActive,
  type SidebarLinkItem,
} from "./sidebarLinks";
import Image from "next/image";
import logo from "@/public/assets/images/logo.png";
import type { LucideIcon } from "lucide-react";

const SideBar = () => {
  const lang = LangUseParams() as string;
  const translate = TranslateHook();
  const pathname = usePathname();

  const [openAcademicStudy, setOpenAcademicStudy] = useState(false);
  const [openIndependentTracks, setOpenIndependentTracks] = useState(false);
  const [openScientificLibrary, setOpenScientificLibrary] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const { hasModuleAccess, canAccessHref, isReady } = useUserPermissions();

  const canShowLink = (item: {
    always?: boolean;
    module?: string;
    href: string;
  }) => {
    if (item.always) return true;
    if (item.module) return hasModuleAccess(item.module);
    return canAccessHref(item.href, lang);
  };

  const visibleMainLinks = mainLinks(lang).filter((item) => canShowLink(item));
  const visibleAcademicStudyLinks = academicStudyLinks(lang).filter((item) =>
    canShowLink(item),
  );
  const visibleIndependentTracksLinks = independentTracksLinks(lang).filter(
    (item) => canShowLink(item),
  );
  const visibleScientificLibraryLinks = scientificLibraryLinks(lang).filter(
    (item) => canShowLink(item),
  );
  const visibleSettingsLinks = settingsLinks(lang).filter((link) =>
    canShowLink(link),
  );

  const isActive = (href: string) => isNavHrefActive(pathname, href, lang);

  const isAcademicStudyActive = () =>
    isLinkGroupActive(pathname, academicStudyLinks(lang), lang);
  const isIndependentTracksActive = () =>
    isLinkGroupActive(pathname, independentTracksLinks(lang), lang);
  const isScientificLibraryActive = () =>
    isLinkGroupActive(pathname, scientificLibraryLinks(lang), lang);
  const isSettingsActive = () =>
    isLinkGroupActive(pathname, settingsLinks(lang), lang);

  useEffect(() => {
    if (isAcademicStudyActive()) setOpenAcademicStudy(true);
    if (isIndependentTracksActive()) setOpenIndependentTracks(true);
    if (isScientificLibraryActive()) setOpenScientificLibrary(true);
    if (isSettingsActive()) setOpenSettings(true);
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
    links: SidebarLinkItem[];
  }) => {
    if (!links.length) return null;

    return (
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
  };

  if (!lang || !translate) return <SidebarSkeleton />;
  if (!isReady) return <SidebarSkeleton />;

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
          {visibleMainLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={linkClass(isActive(link.href))}>
                <link.icon size={18} />
                <span className="hidden md:inline">
                  {translate.sidebar[link.key]}
                </span>
              </Link>
            </li>
          ))}

          {renderDropdown({
            open: openAcademicStudy,
            setOpen: setOpenAcademicStudy,
            active: isAcademicStudyActive(),
            title: translate.sidebar.academicStudy,
            Icon: BookMarked,
            links: visibleAcademicStudyLinks,
          })}
          {renderDropdown({
            open: openIndependentTracks,
            setOpen: setOpenIndependentTracks,
            active: isIndependentTracksActive(),
            title: translate.sidebar.independentTracks,
            Icon: Route,
            links: visibleIndependentTracksLinks,
          })}
          {renderDropdown({
            open: openScientificLibrary,
            setOpen: setOpenScientificLibrary,
            active: isScientificLibraryActive(),
            title: translate.sidebar.scientificLibrary,
            Icon: Library,
            links: visibleScientificLibraryLinks,
          })}
          {renderDropdown({
            open: openSettings,
            setOpen: setOpenSettings,
            active: isSettingsActive(),
            title: translate.sidebar.settings,
            Icon: Settings,
            links: visibleSettingsLinks.map((link) => ({
              href: link.href,
              icon: ShieldCheck,
              key: link.key,
            })),
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
