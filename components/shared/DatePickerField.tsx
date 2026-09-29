"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import LangUseParams from "@/translate/LangUseParams";

const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS_AR = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
const WEEKDAYS_EN = ["S", "M", "T", "W", "T", "F", "S"];

type YMD = { year: number; monthIndex: number; day: number };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISO(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function parseISO(value: string | null | undefined): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, monthIndex, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return null;
  }
  return { year, monthIndex, day };
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function dayValue(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day).getTime();
}

function monthStart(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).getTime();
}

function monthEnd(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getTime();
}

type DatePickerFieldProps = {
  value: string | null | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** ISO `YYYY-MM-DD`; days before it are disabled. */
  minDate?: string | null;
  /** ISO `YYYY-MM-DD`; days after it are disabled. */
  maxDate?: string | null;
  /** Year range offsets from the current year when no min/max is given. */
  yearsBack?: number;
  yearsForward?: number;
  clearable?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export default function DatePickerField({
  value,
  onChange,
  onBlur,
  placeholder,
  minDate,
  maxDate,
  yearsBack = 5,
  yearsForward = 10,
  clearable = true,
  invalid,
  disabled,
  className,
  id,
}: DatePickerFieldProps) {
  const lang = LangUseParams() ?? "ar";
  const isArabic = lang === "ar";

  const today = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  }, []);

  const parsedValue = parseISO(value);
  const min = parseISO(minDate);
  const max = parseISO(maxDate);

  const minYear = Math.min(
    min?.year ?? today.year - yearsBack,
    parsedValue?.year ?? Infinity,
  );
  const maxYear = Math.max(
    max?.year ?? today.year + yearsForward,
    parsedValue?.year ?? -Infinity,
  );
  const minTime = min ? dayValue(min.year, min.monthIndex, min.day) : null;
  const maxTime = max ? dayValue(max.year, max.monthIndex, max.day) : null;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"calendar" | "year">("calendar");
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.monthIndex);
  const [draftDay, setDraftDay] = useState<number | null>(null);
  const selectedYearRef = useRef<HTMLButtonElement>(null);

  const months = isArabic ? MONTHS_AR : MONTHS_EN;
  const weekdays = isArabic ? WEEKDAYS_AR : WEEKDAYS_EN;
  const cancelLabel = isArabic ? "إلغاء" : "Cancel";
  const okLabel = isArabic ? "تأكيد" : "OK";
  const todayLabel = isArabic ? "اليوم" : "Today";
  const resolvedPlaceholder =
    placeholder ?? (isArabic ? "اختر التاريخ" : "Select date");

  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = maxYear; year >= minYear; year -= 1) list.push(year);
    return list;
  }, [maxYear, minYear]);

  const displayValue = parsedValue
    ? isArabic
      ? `${parsedValue.day} ${MONTHS_AR[parsedValue.monthIndex]} ${parsedValue.year}`
      : `${MONTHS_EN[parsedValue.monthIndex]} ${parsedValue.day}, ${parsedValue.year}`
    : "";

  const isDayDisabled = (day: number) => {
    const time = dayValue(viewYear, viewMonth, day);
    if (minTime != null && time < minTime) return true;
    if (maxTime != null && time > maxTime) return true;
    return false;
  };

  const isMonthDisabled = (year: number, monthIndex: number) => {
    if (minTime != null && monthEnd(year, monthIndex) < minTime) return true;
    if (maxTime != null && monthStart(year, monthIndex) > maxTime) return true;
    return false;
  };

  const canGoPrevMonth =
    (viewYear > minYear || (viewYear === minYear && viewMonth > 0)) &&
    !isMonthDisabled(
      viewMonth === 0 ? viewYear - 1 : viewYear,
      viewMonth === 0 ? 11 : viewMonth - 1,
    );
  const canGoNextMonth =
    (viewYear < maxYear || (viewYear === maxYear && viewMonth < 11)) &&
    !isMonthDisabled(
      viewMonth === 11 ? viewYear + 1 : viewYear,
      viewMonth === 11 ? 0 : viewMonth + 1,
    );
  const canGoPrevYear = viewYear > minYear;
  const canGoNextYear = viewYear < maxYear;

  const calendarCells = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const total = daysInMonth(viewYear, viewMonth);
    const cells: Array<number | null> = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= total; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const applyView = (year: number, monthIndex: number) => {
    let nextYear = year;
    let nextMonth = monthIndex;
    if (nextMonth < 0) {
      nextYear -= 1;
      nextMonth = 11;
    } else if (nextMonth > 11) {
      nextYear += 1;
      nextMonth = 0;
    }
    nextYear = Math.min(maxYear, Math.max(minYear, nextYear));
    if (min && monthEnd(nextYear, nextMonth) < (minTime ?? 0)) {
      nextYear = min.year;
      nextMonth = min.monthIndex;
    }
    if (max && monthStart(nextYear, nextMonth) > (maxTime ?? Infinity)) {
      nextYear = max.year;
      nextMonth = max.monthIndex;
    }
    setViewYear(nextYear);
    setViewMonth(nextMonth);
    setDraftDay((day) =>
      day == null ? day : Math.min(day, daysInMonth(nextYear, nextMonth)),
    );
  };

  const resetDraftFromValue = () => {
    setMode("calendar");
    if (parsedValue) {
      setViewYear(parsedValue.year);
      setViewMonth(parsedValue.monthIndex);
      setDraftDay(parsedValue.day);
      return;
    }
    const anchor = min ?? { year: today.year, monthIndex: today.monthIndex };
    setViewYear(anchor.year);
    setViewMonth(anchor.monthIndex);
    setDraftDay(null);
  };

  const openPicker = () => {
    if (disabled) return;
    resetDraftFromValue();
    setOpen(true);
  };

  const closePicker = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDraftFromValue();
      onBlur?.();
    }
    setOpen(nextOpen);
  };

  const confirmDate = () => {
    if (draftDay == null) return;
    onChange(toISO(viewYear, viewMonth, draftDay));
    setOpen(false);
    onBlur?.();
  };

  const jumpToToday = () => {
    const now = new Date();
    applyView(now.getFullYear(), now.getMonth());
    setMode("calendar");
  };

  useLayoutEffect(() => {
    if (mode !== "year") return;
    const frame = requestAnimationFrame(() => {
      selectedYearRef.current?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [mode, viewYear]);

  const navBtn =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800 disabled:pointer-events-none disabled:opacity-30";

  return (
    <>
      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={openPicker}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex h-11 w-full items-center gap-2 rounded-md border border-slate-200 bg-white/90 px-3 text-start text-sm shadow-sm transition",
            "outline-none focus-visible:border-emerald-400/60 focus-visible:ring-2 focus-visible:ring-emerald-500/30",
            "hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-60",
            invalid && "border-rose-400 ring-2 ring-rose-100",
            value && clearable && "pe-9",
            className,
          )}
          dir={isArabic ? "rtl" : "ltr"}
        >
          <Calendar className="size-4 shrink-0 text-emerald-700" />
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              displayValue ? "font-medium text-slate-800" : "text-slate-400",
            )}
          >
            {displayValue || resolvedPlaceholder}
          </span>
        </button>
        {value && clearable && !disabled ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onBlur?.();
            }}
            className="absolute inset-y-0 inset-e-2 my-auto flex size-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={isArabic ? "مسح التاريخ" : "Clear date"}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={closePicker}>
        <DialogContent
          showCloseButton={false}
          className="w-[min(100%,22rem)] gap-3 overflow-hidden rounded-2xl border-slate-200 bg-white p-4 shadow-xl sm:max-w-88"
        >
          <DialogTitle className="sr-only">{resolvedPlaceholder}</DialogTitle>

          <div className="flex items-center justify-between gap-2" dir="ltr">
            <div className="flex min-w-0 flex-1 items-center">
              <button
                type="button"
                onClick={() => applyView(viewYear, viewMonth - 1)}
                disabled={!canGoPrevMonth}
                className={navBtn}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4.5" />
              </button>
              <div className="relative min-w-0 flex-1">
                <select
                  value={viewMonth}
                  onChange={(e) => applyView(viewYear, Number(e.target.value))}
                  className="w-full cursor-pointer appearance-none bg-transparent py-1 pe-5 text-center text-sm font-semibold text-slate-800 outline-none"
                  aria-label="Month"
                >
                  {months.map((month, index) => (
                    <option
                      key={month}
                      value={index}
                      disabled={isMonthDisabled(viewYear, index)}
                    >
                      {isArabic ? month : month.slice(0, 3)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-0 size-3.5 -translate-y-1/2 text-slate-500" />
              </div>
              <button
                type="button"
                onClick={() => applyView(viewYear, viewMonth + 1)}
                disabled={!canGoNextMonth}
                className={navBtn}
                aria-label="Next month"
              >
                <ChevronRight className="size-4.5" />
              </button>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => applyView(viewYear - 1, viewMonth)}
                disabled={!canGoPrevYear}
                className={navBtn}
                aria-label="Previous year"
              >
                <ChevronLeft className="size-4.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setMode((current) =>
                    current === "year" ? "calendar" : "year",
                  )
                }
                className="flex min-w-20 items-center justify-center gap-1 rounded-lg py-1 text-sm font-semibold tabular-nums text-slate-800 transition hover:bg-emerald-50"
                aria-label="Choose year"
                aria-expanded={mode === "year"}
              >
                {viewYear}
                <ChevronDown
                  className={cn(
                    "size-3.5 text-slate-500 transition-transform",
                    mode === "year" && "rotate-180",
                  )}
                />
              </button>
              <button
                type="button"
                onClick={() => applyView(viewYear + 1, viewMonth)}
                disabled={!canGoNextYear}
                className={navBtn}
                aria-label="Next year"
              >
                <ChevronRight className="size-4.5" />
              </button>
            </div>
          </div>

          {mode === "year" ? (
            <div
              className="grid max-h-72 grid-cols-3 gap-1 overflow-y-auto py-1 [scrollbar-width:thin] [scrollbar-color:#047857_transparent]"
              dir="ltr"
            >
              {years.map((year) => {
                const selected = year === viewYear;
                return (
                  <button
                    key={year}
                    type="button"
                    ref={selected ? selectedYearRef : undefined}
                    onClick={() => {
                      applyView(year, viewMonth);
                      setMode("calendar");
                    }}
                    className={cn(
                      "rounded-full py-2 text-sm tabular-nums transition",
                      selected
                        ? "bg-emerald-700 font-semibold text-white"
                        : year === today.year
                          ? "font-semibold text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-50"
                          : "text-slate-700 hover:bg-emerald-50",
                    )}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          ) : (
            <div dir="ltr">
              <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-400">
                {weekdays.map((day, index) => (
                  <span key={`${day}-${index}`} className="py-2">
                    {day}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 text-center">
                {calendarCells.map((day, index) => {
                  if (day == null) {
                    return <span key={`empty-${index}`} className="h-10" />;
                  }
                  const selected = draftDay === day;
                  const dayDisabled = isDayDisabled(day);
                  const isToday =
                    new Date().toDateString() ===
                    new Date(viewYear, viewMonth, day).toDateString();
                  return (
                    <button
                      key={`${viewYear}-${viewMonth}-${day}`}
                      type="button"
                      disabled={dayDisabled}
                      onClick={() => setDraftDay(day)}
                      className={cn(
                        "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm tabular-nums transition",
                        dayDisabled && "cursor-not-allowed text-slate-300",
                        !dayDisabled &&
                          !selected &&
                          "text-slate-700 hover:bg-emerald-50",
                        !dayDisabled &&
                          !selected &&
                          isToday &&
                          "font-semibold text-emerald-800 ring-1 ring-emerald-300",
                        selected && "bg-emerald-700 font-semibold text-white",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div
            className="mt-1 flex items-center justify-between gap-4 border-t border-slate-100 px-1 pt-3"
            dir="ltr"
          >
            <button
              type="button"
              onClick={jumpToToday}
              className="text-sm font-medium text-slate-500 transition hover:text-emerald-800"
            >
              {todayLabel}
            </button>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => closePicker(false)}
                className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={confirmDate}
                disabled={draftDay == null}
                className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-900 disabled:opacity-40"
              >
                {okLabel}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
