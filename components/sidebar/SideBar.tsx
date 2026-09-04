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
  LayoutDashboard,
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
  homePageSettingsLinks,
  settingsLinks,
  isNavHrefActive,
  isLinkGroupActive,
  pathWithoutLang,
  type SidebarLinkItem,
} from "./sidebarLinks";
import Image from "next/image";
import logo from "@/public/assets/images/logo.png";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDoctorPortal } from "@/lib/portal";
import { canDoctorAccessPath } from "@/lib/doctorAccess";

type ToneKey =
  | "emerald"
  | "teal"
  | "cyan"
  | "amber"
  | "sky"
  | "violet"
  | "slate";

const TONES: Record<
  ToneKey,
  { icon: string; hover: string; active: string; chip: string }
> = {
  emerald: {
    icon: "text-emerald-700",
    hover: "hover:bg-emerald-50 hover:text-emerald-900",
    active:
      "bg-linear-to-l from-emerald-700 to-teal-700 text-white shadow-sm shadow-emerald-900/15",
    chip: "bg-linear-to-br from-emerald-100 to-teal-50 text-emerald-800 ring-emerald-200/70",
  },
  teal: {
    icon: "text-teal-700",
    hover: "hover:bg-teal-50 hover:text-teal-900",
    active:
      "bg-linear-to-l from-teal-700 to-cyan-700 text-white shadow-sm shadow-teal-900/15",
    chip: "bg-linear-to-br from-teal-100 to-cyan-50 text-teal-800 ring-teal-200/70",
  },
  cyan: {
    icon: "text-cyan-700",
    hover: "hover:bg-cyan-50 hover:text-cyan-900",
    active:
      "bg-linear-to-l from-cyan-700 to-teal-700 text-white shadow-sm shadow-cyan-900/15",
    chip: "bg-linear-to-br from-cyan-100 to-sky-50 text-cyan-800 ring-cyan-200/70",
  },
  amber: {
    icon: "text-amber-700",
    hover: "hover:bg-amber-50 hover:text-amber-950",
    active:
      "bg-linear-to-l from-amber-600 to-orange-600 text-white shadow-sm shadow-amber-900/15",
    chip: "bg-linear-to-br from-amber-100 to-orange-50 text-amber-800 ring-amber-200/70",
  },
  sky: {
    icon: "text-sky-700",
    hover: "hover:bg-sky-50 hover:text-sky-900",
    active:
      "bg-linear-to-l from-sky-600 to-indigo-600 text-white shadow-sm shadow-sky-900/15",
    chip: "bg-linear-to-br from-sky-100 to-indigo-50 text-sky-800 ring-sky-200/70",
  },
  violet: {
    icon: "text-violet-700",
    hover: "hover:bg-violet-50 hover:text-violet-900",
    active:
      "bg-linear-to-l from-violet-700 to-indigo-700 text-white shadow-sm shadow-violet-900/15",
    chip: "bg-linear-to-br from-violet-100 to-fuchsia-50 text-violet-800 ring-violet-200/70",
  },
  slate: {
    icon: "text-slate-600",
    hover: "hover:bg-slate-100 hover:text-slate-900",
    active:
      "bg-linear-to-l from-slate-700 to-slate-800 text-white shadow-sm shadow-slate-900/15",
    chip: "bg-linear-to-br from-slate-100 to-emerald-50 text-slate-700 ring-slate-200/80",
  },
};

const MAIN_TONES: Record<string, ToneKey> = {
  dashboard: "emerald",
  doctors: "violet",
  cohorts: "sky",
  academicYears: "teal",
  students: "emerald",
  examArticleReviews: "amber",
  admins: "slate",
  roles: "violet",
};

const SETTINGS_TONES: Record<string, ToneKey> = {
  privacyPolicy: "slate",
  appContacts: "sky",
  termsAndConditions: "teal",
  deleteAccount: "amber",
  contactUs: "emerald",
  profile: "violet",
};

const HOME_PAGE_TONES: Record<string, ToneKey> = {
  homeFeatures: "teal",
  homeGoals: "amber",
  homeMethodologies: "emerald",
  homeStudyLevels: "cyan",
  changeOrder: "slate",
};

const SideBar = () => {
  const lang = LangUseParams() as string;
  const translate = TranslateHook();
  const pathname = usePathname();

  const [openAcademicStudy, setOpenAcademicStudy] = useState(false);
  const [openIndependentTracks, setOpenIndependentTracks] = useState(false);
  const [openScientificLibrary, setOpenScientificLibrary] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openHomePageSettings, setOpenHomePageSettings] = useState(false);

  const { hasModuleAccess, canAccessHref, isReady } = useUserPermissions();

  const canShowLink = (item: {
    always?: boolean;
    module?: string;
    href: string;
  }) => {
    if (isDoctorPortal() && !canDoctorAccessPath(pathWithoutLang(item.href, lang))) {
      return false;
    }
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
  const visibleHomePageSettingsLinks = homePageSettingsLinks(lang).filter(
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
  const isHomePageSettingsActive = () =>
    isLinkGroupActive(pathname, homePageSettingsLinks(lang), lang);
  const isSettingsActive = () =>
    isLinkGroupActive(pathname, settingsLinks(lang), lang);

  useEffect(() => {
    if (isAcademicStudyActive()) setOpenAcademicStudy(true);
    if (isIndependentTracksActive()) setOpenIndependentTracks(true);
    if (isScientificLibraryActive()) setOpenScientificLibrary(true);
    if (isSettingsActive()) setOpenSettings(true);
    if (isHomePageSettingsActive()) setOpenHomePageSettings(true);
  }, [pathname, lang]);

  const itemClass = (active: boolean, toneKey: ToneKey) => {
    const tone = TONES[toneKey];
    return cn(
      "group flex items-center justify-center gap-0 rounded-xl p-2 text-sm font-semibold transition md:justify-start md:gap-2 md:text-start",
      active ? cn("text-white", tone.active) : cn("text-slate-600", tone.hover),
    );
  };

  const groupButtonClass = (active: boolean, toneKey: ToneKey) => {
    const tone = TONES[toneKey];
    return cn(
      "flex w-full items-center justify-center gap-2 rounded-xl p-2 text-sm font-bold transition md:justify-between md:text-start",
      active ? cn("text-white", tone.active) : cn("text-slate-600", tone.hover),
    );
  };

  const iconChip = (active: boolean, toneKey: ToneKey) =>
    cn(
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1",
      active ? "bg-white/20 text-white ring-white/20" : TONES[toneKey].chip,
    );

  const renderDropdown = ({
    open,
    setOpen,
    active,
    title,
    Icon,
    links,
    tone,
    childTone,
    childTones,
  }: {
    open: boolean;
    setOpen: (value: boolean) => void;
    active: boolean;
    title: string;
    Icon: LucideIcon;
    links: SidebarLinkItem[];
    tone: ToneKey;
    childTone?: ToneKey;
    childTones?: Record<string, ToneKey>;
  }) => {
    if (!links.length) return null;

    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={groupButtonClass(active, tone)}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className={iconChip(active, tone)}>
              <Icon size={15} />
            </span>
            <span className="hidden min-w-0 flex-1 text-start leading-snug md:block">
              {title}
            </span>
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "hidden shrink-0 transition-transform md:inline",
              open ? "rotate-180" : "",
            )}
          />
        </button>

        <div
          className={cn(
            "ms-3 mt-1 space-y-1 overflow-hidden transition-all duration-300 md:ms-4",
            open ? "opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {links.map((item) => {
            const ItemIcon = item.icon ?? ShieldCheck;
            const itemTone = childTones?.[item.key] ?? childTone ?? tone;
            const activeItem = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={itemClass(activeItem, itemTone)}
              >
                <span className={iconChip(activeItem, itemTone)}>
                  <ItemIcon size={14} />
                </span>
                <span className="hidden min-w-0 flex-1 text-start leading-snug md:block">
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
        flex h-screen w-14 flex-col overflow-y-auto border-e border-emerald-100/80
        bg-white
        md:w-60
      "
    >
      <div className="border-b border-slate-100 p-4">
        <div className="flex justify-center">
          <Image
            src={logo}
            alt="login icon"
            width={130}
            height={75}
          />
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 p-2">
          {visibleMainLinks.map((link) => {
            const tone = MAIN_TONES[link.key] ?? "emerald";
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link href={link.href} className={itemClass(active, tone)}>
                  <span className={iconChip(active, tone)}>
                    <link.icon size={15} />
                  </span>
                  <span className="hidden min-w-0 flex-1 text-start leading-snug md:block">
                    {translate.sidebar[link.key]}
                  </span>
                </Link>
              </li>
            );
          })}

          {renderDropdown({
            open: openAcademicStudy,
            setOpen: setOpenAcademicStudy,
            active: isAcademicStudyActive(),
            title: translate.sidebar.academicStudy,
            Icon: BookMarked,
            links: visibleAcademicStudyLinks,
            tone: "emerald",
            childTone: "teal",
          })}
          {renderDropdown({
            open: openIndependentTracks,
            setOpen: setOpenIndependentTracks,
            active: isIndependentTracksActive(),
            title: translate.sidebar.independentTracks,
            Icon: Route,
            links: visibleIndependentTracksLinks,
            tone: "amber",
          })}
          {renderDropdown({
            open: openScientificLibrary,
            setOpen: setOpenScientificLibrary,
            active: isScientificLibraryActive(),
            title: translate.sidebar.scientificLibrary,
            Icon: Library,
            links: visibleScientificLibraryLinks,
            tone: "cyan",
          })}
          {renderDropdown({
            open: openHomePageSettings,
            setOpen: setOpenHomePageSettings,
            active: isHomePageSettingsActive(),
            title: translate.sidebar.homePageSettings,
            Icon: LayoutDashboard,
            links: visibleHomePageSettingsLinks,
            tone: "teal",
            childTones: HOME_PAGE_TONES,
          })}
          {visibleSettingsLinks.length ? (
            <li>
              <button
                type="button"
                onClick={() => setOpenSettings(!openSettings)}
                className={groupButtonClass(isSettingsActive(), "slate")}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className={iconChip(isSettingsActive(), "slate")}>
                    <Settings size={15} />
                  </span>
                  <span className="hidden min-w-0 flex-1 text-start leading-snug md:block">
                    {translate.sidebar.settings}
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "hidden shrink-0 transition-transform md:inline",
                    openSettings ? "rotate-180" : "",
                  )}
                />
              </button>

              <div
                className={cn(
                  "ms-3 mt-1 space-y-1 overflow-hidden transition-all duration-300 md:ms-4",
                  openSettings ? "opacity-100" : "max-h-0 opacity-0",
                )}
              >
                {visibleSettingsLinks.map((link) => {
                  const tone = SETTINGS_TONES[link.key] ?? "slate";
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={itemClass(active, tone)}
                    >
                      <span className={iconChip(active, tone)}>
                        <ShieldCheck size={14} />
                      </span>
                      <span className="hidden min-w-0 flex-1 text-start leading-snug md:block">
                        {translate.sidebar[link.key]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </li>
          ) : null}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
