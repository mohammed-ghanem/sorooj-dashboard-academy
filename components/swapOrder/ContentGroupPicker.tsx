"use client";

import { useMemo, useState } from "react";
import { FolderTree, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SwapOrderItem } from "@/types/swapOrder";

export type ContentGroupOption = {
  key: string;
  parentLabel?: string;
  items: SwapOrderItem[];
};

type Props = {
  title?: string;
  groups: ContentGroupOption[];
  activeKey?: string;
  onChange: (key: string) => void;
  searchPlaceholder?: string;
};

export default function ContentGroupPicker({
  title,
  groups,
  activeKey,
  onChange,
  searchPlaceholder,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.trim().toLowerCase();
    return groups.filter((group) =>
      (group.parentLabel ?? group.key).toLowerCase().includes(q),
    );
  }, [groups, search]);

  if (!groups.length) return null;

  return (
    <div className="space-y-3 rounded-2xl bg-white p-2.5 ring-1 ring-slate-200/80 sm:p-3">
      {title ? (
        <div className="flex items-center gap-1.5 px-0.5 text-xs font-semibold text-slate-600">
          <FolderTree className="h-3.5 w-3.5 text-slate-400" />
          <span>{title}</span>
        </div>
      ) : null}

      {groups.length > 6 ? (
        <div className="relative">
          <Search className="pointer-events-none absolute inset-y-0 inset-s-3 my-auto h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder || "بحث..."}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 ps-9 pe-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      ) : null}

      {filteredGroups.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">
          {searchPlaceholder ? `${searchPlaceholder}...` : "لا توجد نتائج"}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => {
            const active = group.key === activeKey;
            const label = group.parentLabel ?? group.key;

            return (
              <button
                key={group.key}
                type="button"
                title={label}
                onClick={() => onChange(group.key)}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-start transition-colors",
                  active
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 ring-1 ring-slate-200/70 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {label}
                </span>
                <span
                  className={cn(
                    "inline-flex shrink-0 min-w-5 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums",
                    active
                      ? "bg-white/15 text-white"
                      : "bg-white text-slate-500 ring-1 ring-slate-200/80",
                  )}
                >
                  {group.items.length}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
