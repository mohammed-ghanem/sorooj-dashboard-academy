"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";
import { Button } from "@/components/ui/button";
import {
  formatHijriYearOnlyFromGregorianDateAr,
  gregorianYearFromIsoDate,
  isoDateFromGregorianYear,
} from "@/utils/dateFormat";

const YEARS_PER_PAGE = 12;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function pageStartForYear(
  year: number,
  minYear: number,
  maxYear: number,
): number {
  if (!Number.isFinite(year)) {
    const mid = clamp(
      Math.floor((minYear + maxYear) / 2),
      minYear,
      maxYear,
    );
    const idx = Math.floor((mid - minYear) / YEARS_PER_PAGE);
    return minYear + idx * YEARS_PER_PAGE;
  }
  const y = clamp(year, minYear, maxYear);
  const idx = Math.floor((y - minYear) / YEARS_PER_PAGE);
  return minYear + idx * YEARS_PER_PAGE;
}

export type CohortYearGridPickerProps = {
  /** Stored as `YYYY-MM-DD` (typically `YYYY-01-01`). */
  value: string;
  onChange: (isoDate: string) => void;
  onBlur?: () => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
  /** Screen-reader / title for the panel. */
  ariaLabel?: string;
  /** Suffix after Hijri year, e.g. "هجري" / "Hijri". */
  hijriYearSuffix?: string;
};

export function CohortYearGridPicker({
  value,
  onChange,
  onBlur,
  id,
  disabled,
  className,
  minYear = 1980,
  maxYear = 2060,
  placeholder,
  ariaLabel,
  hijriYearSuffix,
}: CohortYearGridPickerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selectedYear = gregorianYearFromIsoDate(value);
  const hasValue = /^\d{4}$/.test(selectedYear);
  const displayIso = hasValue ? isoDateFromGregorianYear(selectedYear) : "";

  const [pageStart, setPageStart] = useState(() =>
    pageStartForYear(
      hasValue ? Number(selectedYear) : new Date().getFullYear(),
      minYear,
      maxYear,
    ),
  );

  useLayoutEffect(() => {
    if (!open) return;
    const y = hasValue ? Number(selectedYear) : new Date().getFullYear();
    setPageStart(pageStartForYear(y, minYear, maxYear));
  }, [open, hasValue, selectedYear, minYear, maxYear]);

  const close = useCallback(() => {
    setOpen(false);
    onBlur?.();
  }, [onBlur]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const pageEnd = pageStart + YEARS_PER_PAGE - 1;
  const canPrev = pageStart - YEARS_PER_PAGE >= minYear;
  const canNext = pageStart + YEARS_PER_PAGE <= maxYear;

  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i);

  const pickYear = (y: number) => {
    if (y < minYear || y > maxYear) return;
    onChange(isoDateFromGregorianYear(String(y)));
    setOpen(false);
    onBlur?.();
  };

  const hijriYear =
    hasValue && displayIso
      ? formatHijriYearOnlyFromGregorianDateAr(displayIso)
      : "";
  const suffix = (hijriYearSuffix ?? "").trim();
  const hijriLine = hijriYear
    ? suffix
      ? `${hijriYear} ${suffix}`
      : hijriYear
    : "—";

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          dash.select,
          "flex h-11 w-full items-center justify-between gap-2 rounded-md border px-3 text-start font-medium tabular-nums",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className={cn(!hasValue && "text-muted-foreground")}>
          {hasValue ? selectedYear : (placeholder ?? "—")}
        </span>
        <Calendar className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={ariaLabel}
          className="absolute z-50 mt-1 w-[min(100%,280px)] rounded-lg border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-slate-900/5 ltr"
          dir="ltr"
        >
          <div className="mb-2 flex items-center justify-between gap-1 px-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              disabled={!canPrev}
              aria-label="Previous years"
              onClick={() =>
                setPageStart((p) => Math.max(minYear, p - YEARS_PER_PAGE))
              }
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-0 flex-1 text-center text-sm font-semibold tabular-nums text-slate-800">
              {pageStart}-{pageEnd}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              disabled={!canNext}
              aria-label="Next years"
              onClick={() =>
                setPageStart((p) => p + YEARS_PER_PAGE)
              }
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {years.map((y) => {
              const out = y < minYear || y > maxYear;
              const sel = hasValue && y === Number(selectedYear);
              return (
                <button
                  key={y}
                  type="button"
                  disabled={out}
                  onClick={() => pickYear(y)}
                  className={cn(
                    "rounded-md py-2 text-center text-sm font-medium tabular-nums transition-colors",
                    out && "cursor-not-allowed text-slate-300",
                    !out && !sel && "text-slate-800 hover:bg-slate-100",
                    sel && "bg-blue-600 text-white hover:bg-blue-600",
                  )}
                >
                  {y}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
        {hijriLine}
      </div>
    </div>
  );
}
