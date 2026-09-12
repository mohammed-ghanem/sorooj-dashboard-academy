"use client";

import type { LucideIcon } from "lucide-react";

import type { SwapOrderType } from "@/types/swapOrder";

export type ReorderGroupingConfig<T = any> = {
  getParentId: (item: T) => number | string | null | undefined;
  getParentLabel?: (item: T, lang: "ar" | "en") => string | null | undefined;
  uncategorizedLabel?: string;
  groupTitle?: string;
};

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  groupBy?: ReorderGroupingConfig<any>;
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
