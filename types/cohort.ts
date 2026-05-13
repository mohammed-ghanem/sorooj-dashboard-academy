/** Single date range used for academic years and makeup exam periods (API + forms). */
export interface ICohortDateRange {
  start_date: string;
  end_date: string;
}

export interface ICohort {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  start_date: string;
  end_date: string;
  enrollment_start_date: string;
  enrollment_end_date: string;
  academic_years: ICohortDateRange[];
  makeup_exam_periods: ICohortDateRange[];
  start_date_hijri?: string;
  end_date_hijri?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ICreateCohortPayload {
  name_ar: string;
  name_en: string;
  start_date: string;
  end_date: string;
  enrollment_start_date: string;
  enrollment_end_date: string;
  academic_years: ICohortDateRange[];
  makeup_exam_periods: ICohortDateRange[];
  is_active: boolean;
}

export interface IUpdateCohortPayload {
  name_ar: string;
  name_en: string;
  start_date: string;
  end_date: string;
  enrollment_start_date: string;
  enrollment_end_date: string;
  academic_years: ICohortDateRange[];
  makeup_exam_periods: ICohortDateRange[];
  is_active: boolean;
}

export interface IApiMessageResponse {
  message: string;
}

export const EMPTY_COHORT_DATE_RANGE: ICohortDateRange = {
  start_date: "",
  end_date: "",
};

/** Two fixed slots for academic years and second-session exams (API indices 0 and 1). */
function padTwoRanges(
  list: ICohortDateRange[] | undefined,
  slice: (d: string | undefined) => string,
): ICohortDateRange[] {
  const mapped = (list ?? []).map((r) => ({
    start_date: slice(r.start_date),
    end_date: slice(r.end_date),
  }));
  const out = [...mapped];
  while (out.length < 2) out.push({ ...EMPTY_COHORT_DATE_RANGE });
  return out.slice(0, 2);
}

export function defaultCohortFormPayload(): ICreateCohortPayload {
  return {
    name_ar: "",
    name_en: "",
    start_date: "",
    end_date: "",
    enrollment_start_date: "",
    enrollment_end_date: "",
    is_active: true,
    academic_years: [
      { ...EMPTY_COHORT_DATE_RANGE },
      { ...EMPTY_COHORT_DATE_RANGE },
    ],
    makeup_exam_periods: [
      { ...EMPTY_COHORT_DATE_RANGE },
      { ...EMPTY_COHORT_DATE_RANGE },
    ],
  };
}

/** Cohort span is year-only in the UI: normalize any API date to 1 Jan of that year. */
function anchorCohortDate(iso: string): string {
  const s = String(iso).slice(0, 10);
  const y = s.slice(0, 4);
  if (/^\d{4}$/.test(y)) return `${y}-01-01`;
  return s;
}

/** Map API cohort to create/update form values for react-hook-form reset(). */
export function cohortToFormPayload(cohort: ICohort): ICreateCohortPayload {
  const slice = (d: string | undefined) => (d ? String(d).slice(0, 10) : "");

  return {
    name_ar: cohort.name_ar ?? "",
    name_en: cohort.name_en ?? "",
    start_date: anchorCohortDate(slice(cohort.start_date)),
    end_date: anchorCohortDate(slice(cohort.end_date)),
    enrollment_start_date: slice(cohort.enrollment_start_date),
    enrollment_end_date: slice(cohort.enrollment_end_date),
    is_active: Boolean(cohort.is_active),
    academic_years: padTwoRanges(cohort.academic_years, slice),
    makeup_exam_periods: padTwoRanges(cohort.makeup_exam_periods, slice),
  };
}
