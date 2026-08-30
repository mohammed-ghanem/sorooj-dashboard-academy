"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import IndexListPage from "@/components/shared/IndexListPage";
import SwapOrderList from "@/components/swapOrder/SwapOrderList";
import { useSessionReady } from "@/hooks/useSessionReady";
import { toSwapOrderItems } from "@/lib/toSwapOrderItems";
import { cn } from "@/lib/utils";
import type {
  ModuleReorderConfig,
  ReorderTabConfig,
} from "@/constants/reorderModules";

type Props = {
  config: ModuleReorderConfig;
};

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

  const items = useMemo(
    () => toSwapOrderItems(list, (item) => tab.getLabel(item, lang)),
    [list, lang, tab],
  );

  const hint =
    (tab.hintKey && t?.[tab.hintKey]) || t?.itemsHint || "";

  return (
    <div className="space-y-4">
      {hint ? <p className="text-sm text-slate-600">{hint}</p> : null}
      <SwapOrderList
        type={tab.swapType}
        items={items}
        isLoading={!sessionReady || isLoading}
        emptyLabel={t?.emptyItems ?? ""}
        positionLabel={t?.position ?? ""}
        titleLabel={t?.itemTitle ?? ""}
        actionsLabel={t?.actions ?? ""}
        moveUpLabel={t?.moveUp ?? ""}
        moveDownLabel={t?.moveDown ?? ""}
        goToLabel={t?.goTo ?? ""}
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
