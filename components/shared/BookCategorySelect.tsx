"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, FolderTree, Search } from "lucide-react";

import type { IBookCategory } from "@/types/bookCategory";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type BookCategorySelectProps = {
  categories: IBookCategory[];
  lang: "ar" | "en";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
  selectedLabel?: string;
  collapseLabel?: string;
  expandLabel?: string;
  defaultOpen?: boolean;
};

function filterCategories(
  categories: IBookCategory[],
  query: string,
): IBookCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;

  return categories.filter((category) => {
    const name = category.name.toLowerCase();
    const about = (category.about_category ?? "").toLowerCase();
    return name.includes(q) || about.includes(q);
  });
}

export default function BookCategorySelect({
  categories,
  lang,
  value,
  onChange,
  placeholder,
  className,
  disabled,
  searchPlaceholder,
  emptyLabel,
  selectedLabel,
  collapseLabel,
  expandLabel,
  defaultOpen = false,
}: BookCategorySelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const filtered = useMemo(
    () => filterCategories(categories, search),
    [categories, search],
  );

  const selectedId = value ? Number(value) : null;
  const selectedCategory = categories.find((c) => c.id === selectedId);

  const handleSelect = (id: number) => {
    if (disabled) return;
    if (selectedId === id) {
      onChange("");
      return;
    }
    onChange(String(id));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className={cn(
            "inline-flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 text-sm",
            selectedCategory
              ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80"
              : "bg-slate-50 text-slate-500 ring-1 ring-slate-200/80",
          )}
        >
          <Check className="h-4 w-4 shrink-0 opacity-80" />
          <span className="truncate">
            {selectedCategory
              ? `${selectedLabel ? `${selectedLabel} ` : ""}${selectedCategory.name}`
              : placeholder}
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 rounded-xl border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {collapseLabel ?? (lang === "ar" ? "إغلاق" : "Collapse")}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {expandLabel ?? (lang === "ar" ? "فتح" : "Expand")}
            </>
          )}
        </Button>
      </div>

      {isOpen ? (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute top-1/2 inset-s-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder || placeholder}
              disabled={disabled}
              className="h-10 rounded-xl border-slate-200 bg-white ps-9 shadow-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-slate-500">
              {emptyLabel || placeholder}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((category) => {
                const checked = selectedId === category.id;

                return (
                  <article
                    key={category.id}
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-linear-to-br from-white via-slate-50/40 to-emerald-50/30 shadow-sm transition-all",
                      checked
                        ? "border-emerald-300 ring-2 ring-emerald-500/15 shadow-emerald-900/5"
                        : "border-slate-200/90 ring-1 ring-slate-900/4",
                    )}
                  >
                    <header className="flex items-center gap-2.5 border-b border-emerald-100/80 bg-linear-to-r from-emerald-700 to-teal-700 px-4 py-3 text-white">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                        <FolderTree className="h-4 w-4" />
                      </span>
                      <h4 className="min-w-0 truncate font-bold leading-tight">
                        {category.name}
                      </h4>
                    </header>

                    <div className="p-3 md:p-4">
                      <label
                        className={cn(
                          "group flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-all",
                          checked
                            ? "border-emerald-400 bg-emerald-50/90 shadow-sm ring-1 ring-emerald-500/20"
                            : "border-transparent bg-white/80 hover:border-emerald-200 hover:bg-emerald-50/40",
                          disabled && "pointer-events-none opacity-50",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={() => handleSelect(category.id)}
                          className="mt-0.5 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                        />
                        <span className="min-w-0 flex-1 space-y-1">
                          <span
                            className={cn(
                              "block text-sm font-medium",
                              checked ? "text-emerald-950" : "text-slate-800",
                            )}
                          >
                            {category.name}
                          </span>
                          {category.about_category ? (
                            <span className="block text-xs leading-relaxed text-slate-500">
                              {category.about_category}
                            </span>
                          ) : null}
                        </span>
                        {checked ? (
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </span>
                        ) : null}
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
