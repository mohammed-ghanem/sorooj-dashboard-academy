"use client";

import type { LucideIcon } from "lucide-react";

import type { SwapOrderType } from "@/types/swapOrder";

export type ReorderTabConfig = {
  key: string;
  label: string;
  icon: LucideIcon;
  swapType: SwapOrderType;
  hintKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useGetListQuery: any;
  queryArg?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getLabel: (item: any, lang: "ar" | "en") => string;
};

export type ReorderHintKeys =
  | "subjectsHint"
  | "lessonsHint"
  | "categoriesHint"
  | "booksHint"
  | "homeFeaturesHint"
  | "homeGoalsHint"
  | "homeMethodologiesHint"
  | "homeStudyLevelsHint";

export type ModuleReorderConfig = {
  tabs: ReorderTabConfig[];
  defaultTabKey?: string;
};
