"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import IndexListPage from "@/components/shared/IndexListPage";
import ContentGroupPicker from "@/components/swapOrder/ContentGroupPicker";
import SwapOrderList from "@/components/swapOrder/SwapOrderList";
import { useSessionReady } from "@/hooks/useSessionReady";
import { toSwapOrderItems } from "@/lib/toSwapOrderItems";
import { cn } from "@/lib/utils";
import type {
  ModuleReorderConfig,
  ReorderGroupingConfig,
  ReorderTabConfig,
} from "@/constants/reorderModules";
import type { SwapOrderItem } from "@/types/swapOrder";

type Props = {
  config: ModuleReorderConfig;
};

type ReorderGroup = {
  key: string;
  parentLabel: string;
  items: SwapOrderItem[];
};

function buildGroups<T extends { id: number }>(
  list: T[],
  groupConfig: ReorderGroupingConfig<T>,
  getLabel: (item: T, lang: "ar" | "en") => string,
  lang: "ar" | "en",
  uncategorizedLabel: string,
): ReorderGroup[] {
  const buckets = new Map<
    string,
    { parentId: string | number | null; parentLabel: string; items: SwapOrderItem[] }
  >();

  for (const item of list) {
    const parentId = groupConfig.getParentId(item);
    const key =
      parentId == null || parentId === "" ? "none" : String(parentId);

    const swapItem: SwapOrderItem = {
      id: item.id,
      label: getLabel(item, lang) || `#${item.id}`,
    };

    const existing = buckets.get(key);
    if (existing) {
      existing.items.push(swapItem);
      continue;
    }

    const label =
      groupConfig.getParentLabel?.(item, lang) ||
      (parentId == null || parentId === ""
        ? uncategorizedLabel
        : `#${parentId}`);

    buckets.set(key, {
      parentId: parentId ?? null,
      parentLabel: label,
      items: [swapItem],
    });
  }

  return [...buckets.values()]
    .sort((a, b) => {
      if (a.parentId == null) return 1;
      if (b.parentId == null) return -1;
      const numA = Number(a.parentId);
      const numB = Number(b.parentId);
      if (Number.isFinite(numA) && Number.isFinite(numB)) {
        return numA - numB;
      }
      return a.parentLabel.localeCompare(b.parentLabel, lang, { numeric: true });
    })
    .map((bucket) => ({
      key: `group-${bucket.parentId ?? "none"}`,
      parentLabel: bucket.parentLabel,
      items: bucket.items,
    }));
}

function ReorderTabPanel({
  tab,
  lang,
  t,
}: {
  tab: ReorderTabConfig;
  lang: "ar" | "en";
  t: Record<string, string> | undefined;
}) {
  const sessionReady = useSessionReady();
  const { data: list = [], isLoading } = tab.useGetListQuery(tab.queryArg, {
    skip: !sessionReady,
  });

  const [activeGroupKey, setActiveGroupKey] = useState<string>("");

  const hint = (tab.hintKey && t?.[tab.hintKey]) || t?.itemsHint || "";

  const listLabels = {
    emptyLabel: t?.emptyItems ?? "",
    positionLabel: t?.position ?? "",
    titleLabel: t?.itemTitle ?? "",
    actionsLabel: t?.actions ?? "",
    moveUpLabel: t?.moveUp ?? "",
    moveDownLabel: t?.moveDown ?? "",
    goToLabel: t?.goTo ?? "",
  };

  const uncategorizedDefault =
    lang === "ar" ? "بدون تصنيف" : "Uncategorized";

  const contentGroups = useMemo(() => {
    if (!tab.groupBy) return [];
    return buildGroups(
      list,
      tab.groupBy,
      tab.getLabel,
      lang,
      tab.groupBy.uncategorizedLabel ?? t?.uncategorized ?? uncategorizedDefault,
    );
  }, [list, tab.groupBy, tab.getLabel, lang, t?.uncategorized, uncategorizedDefault]);

  useEffect(() => {
    if (!contentGroups.length) {
      setActiveGroupKey("");
      return;
    }
    const stillValid = contentGroups.some((g) => g.key === activeGroupKey);
    if (!stillValid) {
      setActiveGroupKey(contentGroups[0].key);
    }
  }, [contentGroups, activeGroupKey]);

  const activeContentGroup =
    contentGroups.find((g) => g.key === activeGroupKey) ?? contentGroups[0];

  // Grouped mode (e.g. lessons grouped by subject)
  if (tab.groupBy) {
    if (!sessionReady || isLoading) {
      return (
        <SwapOrderList
          type={tab.swapType}
          items={[]}
          isLoading
          {...listLabels}
        />
      );
    }

    if (contentGroups.length === 0) {
      return (
        <p className="px-4 py-10 text-center text-sm text-slate-500">
          {t?.emptyItems}
        </p>
      );
    }

    return (
      <div className="space-y-4">
        <ContentGroupPicker
          title={tab.groupBy.groupTitle}
          groups={contentGroups}
          activeKey={activeContentGroup?.key}
          onChange={setActiveGroupKey}
          searchPlaceholder={t?.searchPlaceholder}
        />

        {hint ? <p className="text-sm text-slate-600">{hint}</p> : null}

        {activeContentGroup ? (
          <SwapOrderList
            key={activeContentGroup.key}
            type={tab.swapType}
            items={activeContentGroup.items}
            isLoading={false}
            {...listLabels}
          />
        ) : null}
      </div>
    );
  }

  // Flat mode (no grouping)
  const flatItems = toSwapOrderItems(list, (item) => tab.getLabel(item, lang));

  return (
    <div className="space-y-4">
      {hint ? <p className="text-sm text-slate-600">{hint}</p> : null}
      <SwapOrderList
        type={tab.swapType}
        items={flatItems}
        isLoading={!sessionReady || isLoading}
        {...listLabels}
      />
    </div>
  );
}

export default function ModuleReorder({ config }: Props) {
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const t = translate?.pages?.swapOrder as Record<string, string> | undefined;
  const sessionReady = useSessionReady();

  const defaultKey = config.defaultTabKey ?? config.tabs[0]?.key ?? "";
  const [tab, setTab] = useState(defaultKey);

  const activeTab = config.tabs.find((item) => item.key === tab) ?? config.tabs[0];

  return (
    <IndexListPage
      icon={ArrowUpDown}
      title={t?.title ?? ""}
      description={t?.description}
      createHref=""
      createLabel=""
      showCreate={false}
      showSkeleton={!sessionReady}
    >
      <div className="space-y-5 px-2 md:px-4">
        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50/80 p-1.5 ring-1 ring-slate-200/80">
          {config.tabs.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none",
                  active
                    ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-200/70"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        {activeTab ? (
          <ReorderTabPanel key={activeTab.key} tab={activeTab} lang={lang} t={t} />
        ) : null}
      </div>
    </IndexListPage>
  );
}
