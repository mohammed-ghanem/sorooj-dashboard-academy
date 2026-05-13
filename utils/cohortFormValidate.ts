import type { ICreateCohortPayload } from "@/types/cohort";

function head10(s: string | undefined): string {
  return String(s ?? "").trim().slice(0, 10);
}

/** True if both set and end is strictly before start (Gregorian YYYY-MM-DD). */
function rangeInverted(start: string | undefined, end: string | undefined): boolean {
  const a = head10(start);
  const b = head10(end);
  if (!a || !b) return false;
  return a > b;
}

/**
 * Client-side checks so Laravel rules match user intent (Arabic / English toasts).
 * Returns an error message or null if OK.
 */
export function validateCohortFormDates(
  data: ICreateCohortPayload,
  lang: "ar" | "en",
): string | null {
  if (rangeInverted(data.start_date, data.end_date)) {
    return lang === "ar"
      ? "سنة نهاية الدفعة (ميلادي) يجب أن تكون بعد سنة البداية أو تساويها."
      : "Cohort end year must be the same as or after the start year.";
  }

  if (rangeInverted(data.enrollment_start_date, data.enrollment_end_date)) {
    return lang === "ar"
      ? "تاريخ نهاية التسجيل يجب أن يكون بعد تاريخ بداية التسجيل."
      : "Enrollment end date must be on or after the enrollment start date.";
  }

  for (let i = 0; i < 2; i += 1) {
    const row = data.academic_years[i];
    if (rangeInverted(row?.start_date, row?.end_date)) {
      return lang === "ar"
        ? `في العام الدراسي ${i === 0 ? "الأول" : "الثاني"}: تاريخ النهاية يجب أن يكون بعد تاريخ البداية.`
        : `Academic year ${i + 1}: end date must be on or after the start date.`;
    }
  }

  for (let i = 0; i < 2; i += 1) {
    const row = data.makeup_exam_periods[i];
    if (rangeInverted(row?.start_date, row?.end_date)) {
      return lang === "ar"
        ? `في امتحانات الدور الثاني للعام ${i === 0 ? "الأول" : "الثاني"}: تاريخ النهاية يجب أن يكون بعد تاريخ البداية.`
        : `Second-session exams (year ${i + 1}): end date must be on or after the start date.`;
    }
  }

  return null;
}
