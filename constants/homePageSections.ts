import { BookOpenCheck, Layers, Sparkles, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { HomePageSectionKey } from "@/types/homePageSection";

export type HomePageSectionConfig = {
  key: HomePageSectionKey;
  endpoint: string;
  basePath: string;
  dictKey: "features" | "goals" | "methodologies" | "studyLevels";
  hasIcon: boolean;
  hasImage: boolean;
  icon: LucideIcon;
};

export const HOME_PAGE_SECTIONS: HomePageSectionConfig[] = [
  {
    key: "features",
    endpoint: "home-features",
    basePath: "settings/home-page/features",
    dictKey: "features",
    hasIcon: true,
    hasImage: false,
    icon: Sparkles,
  },
  {
    key: "goals",
    endpoint: "home-goals",
    basePath: "settings/home-page/goals",
    dictKey: "goals",
    hasIcon: true,
    hasImage: true,
    icon: Target,
  },
  {
    key: "methodologies",
    endpoint: "home-methodologies",
    basePath: "settings/home-page/methodologies",
    dictKey: "methodologies",
    hasIcon: true,
    hasImage: false,
    icon: BookOpenCheck,
  },
  {
    key: "study-levels",
    endpoint: "home-study-levels",
    basePath: "settings/home-page/study-levels",
    dictKey: "studyLevels",
    hasIcon: false,
    hasImage: true,
    icon: Layers,
  },
];

export function getHomePageSection(
  key: HomePageSectionKey,
): HomePageSectionConfig {
  const section = HOME_PAGE_SECTIONS.find((item) => item.key === key);
  if (!section) throw new Error(`Unknown home page section: ${key}`);
  return section;
}
