"use client";

import { BookOpenCheck, Layers, Sparkles, Target } from "lucide-react";

import ModuleReorder from "@/components/swapOrder/ModuleReorder";
import {
  useGetHomeFeaturesQuery,
  useGetHomeGoalsQuery,
  useGetHomeMethodologiesQuery,
  useGetHomeStudyLevelsQuery,
} from "@/store/homePage/homePageApis";
import TranslateHook from "@/translate/TranslateHook";
import type { ModuleReorderConfig } from "@/constants/reorderModules";

export default function HomePageReorder() {
  const translate = TranslateHook();
  const sidebar = translate?.sidebar;

  const config: ModuleReorderConfig = {
    defaultTabKey: "features",
    tabs: [
      {
        key: "features",
        label: sidebar?.homeFeatures ?? "Features",
        icon: Sparkles,
        swapType: "home_features",
        hintKey: "homeFeaturesHint",
        useGetListQuery: useGetHomeFeaturesQuery,
        getLabel: (item) => item.title,
      },
      {
        key: "goals",
        label: sidebar?.homeGoals ?? "Goals",
        icon: Target,
        swapType: "home_goals",
        hintKey: "homeGoalsHint",
        useGetListQuery: useGetHomeGoalsQuery,
        getLabel: (item) => item.title,
      },
      {
        key: "methodologies",
        label: sidebar?.homeMethodologies ?? "Methodologies",
        icon: BookOpenCheck,
        swapType: "home_methodologies",
        hintKey: "homeMethodologiesHint",
        useGetListQuery: useGetHomeMethodologiesQuery,
        getLabel: (item) => item.title,
      },
      {
        key: "study-levels",
        label: sidebar?.homeStudyLevels ?? "Study levels",
        icon: Layers,
        swapType: "home_study_levels",
        hintKey: "homeStudyLevelsHint",
        useGetListQuery: useGetHomeStudyLevelsQuery,
        getLabel: (item) => item.title,
      },
    ],
  };

  return <ModuleReorder config={config} />;
}
