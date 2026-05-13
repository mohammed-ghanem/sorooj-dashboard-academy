/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  ICohort,
  ICohortDateRange,
  ICreateCohortPayload,
  IUpdateCohortPayload,
  IApiMessageResponse,
} from "@/types/cohort";

function toIsoDateString(v: unknown): string {
  if (v == null || v === "") return "";
  if (typeof v === "number" && Number.isFinite(v)) {
    const ms = v < 1e12 ? v * 1000 : v;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  }
  const s = String(v).trim();
  if (!s) return "";
  const ymd = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (ymd) return ymd[1];
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return s.length >= 10 ? s.slice(0, 10) : "";
}

function firstDefined(...vals: unknown[]): unknown {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

/** API cohort span uses `start_year` / `end_year` (YYYY). */
function toYearString(v: unknown): string {
  if (v == null || v === "") return "";
  if (typeof v === "number" && Number.isFinite(v)) {
    const n = Math.trunc(v);
    if (n >= 1000 && n <= 9999) return String(n);
  }
  const s = String(v).trim();
  const y4 = s.match(/^(\d{4})(?:\D|$)/);
  if (y4) return y4[1];
  const iso = toIsoDateString(v);
  if (iso.length >= 4) return iso.slice(0, 4);
  return "";
}

/** Form stores `YYYY-01-01` in start_date/end_date; API expects four-digit years. */
function yearFromCohortFormDate(iso: string | undefined): string {
  return toYearString(iso);
}

/** JSON:API / Laravel: fields sometimes live under `attributes`. */
function isEmptyNestedList(v: unknown): boolean {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("data" in o) {
      const d = o.data;
      if (d == null) return true;
      if (Array.isArray(d)) return d.length === 0;
    }
    const keys = Object.keys(o);
    if (keys.length === 0) return true;
    if (keys.every((k) => /^\d+$/.test(k))) return false;
  }
  return false;
}

/** Restore nested arrays from `attributes` when top-level keys are empty stubs (common on index). */
function preferAttrsWhenRowEmpty(
  merged: Record<string, unknown>,
  attrs: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const fromAttrs = attrs[key];
    if (fromAttrs == null) continue;
    if (!isEmptyNestedList(fromAttrs) && isEmptyNestedList(merged[key])) {
      merged[key] = fromAttrs;
    }
  }
}

function flattenCohortRow(row: any): any {
  if (!row || typeof row !== "object") return row;
  const attrs = row.attributes;
  if (attrs && typeof attrs === "object") {
    const merged: Record<string, unknown> = {
      ...attrs,
      ...row,
      id: row.id ?? attrs.id,
    };
    preferAttrsWhenRowEmpty(merged, attrs as Record<string, unknown>, [
      "academic_years",
      "academicYears",
      "AcademicYears",
      "makeup_exam_periods",
      "makeupExamPeriods",
      "MakeupExamPeriods",
    ]);
    return merged;
  }
  return row;
}

/** Index rows may wrap the model (`data`, `cohort`, `record`). */
function unwrapListRow(row: any): any {
  if (!row || typeof row !== "object") return row;
  const inner =
    row.cohort ??
    row.Cohort ??
    row.record ??
    row.model ??
    row.item ??
    row.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner;
  }
  return row;
}

/** Main cohort period: backend may use various keys; fallback to academic year bounds. */
function pickMainStartDate(
  item: any,
  academicYears: ICohortDateRange[],
): string {
  const raw = firstDefined(
    item?.start_date,
    item?.startDate,
    item?.cohort_start_date,
    item?.cohort_start,
    item?.general_start_date,
    item?.period_start_date,
    item?.period_start,
    item?.main_start_date,
    item?.batch_start_date,
    item?.cohort_period?.start_date,
    item?.cohort_period?.startDate,
    item?.period?.start_date,
    item?.period?.startDate,
  );
  const fromFields = toIsoDateString(raw);
  if (fromFields) return fromFields;
  if (academicYears[0]?.start_date) return academicYears[0].start_date;
  return "";
}

function pickMainEndDate(item: any, academicYears: ICohortDateRange[]): string {
  const raw = firstDefined(
    item?.end_date,
    item?.endDate,
    item?.cohort_end_date,
    item?.cohort_end,
    item?.general_end_date,
    item?.period_end_date,
    item?.period_end,
    item?.main_end_date,
    item?.batch_end_date,
    item?.cohort_period?.end_date,
    item?.cohort_period?.endDate,
    item?.period?.end_date,
    item?.period?.endDate,
  );
  const fromFields = toIsoDateString(raw);
  if (fromFields) return fromFields;
  const last = academicYears[academicYears.length - 1];
  if (last?.end_date) return last.end_date;
  return "";
}

function normalizeDateRange(item: any): ICohortDateRange {
  const flat = flattenCohortRow(item ?? {});
  return {
    start_date: toIsoDateString(
      firstDefined(
        flat?.start_date,
        flat?.startDate,
        flat?.start,
        flat?.from,
        flat?.date_start,
        flat?.dateStart,
        flat?.begin_date,
        flat?.beginDate,
        flat?.starts_at,
        flat?.startsAt,
      ),
    ),
    end_date: toIsoDateString(
      firstDefined(
        flat?.end_date,
        flat?.endDate,
        flat?.end,
        flat?.to,
        flat?.date_end,
        flat?.dateEnd,
        flat?.finish_date,
        flat?.finishDate,
        flat?.ends_at,
        flat?.endsAt,
      ),
    ),
  };
}

/** PHP may JSON-encode list-like maps as objects with numeric keys; also JSON strings. */
function coerceArrayish(raw: unknown): unknown[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    try {
      const p = JSON.parse(t);
      if (Array.isArray(p)) return p;
      if (p && typeof p === "object") return coerceArrayish(p);
    } catch {
      return [];
    }
    return [];
  }
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const nested = o.data;
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === "object") return coerceArrayish(nested);
    const keys = Object.keys(o);
    if (keys.length === 0) return [];
    const allNumeric = keys.every((k) => /^\d+$/.test(k));
    if (allNumeric) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => o[k]);
    }
  }
  return [];
}

function scoreDateRanges(ranges: ICohortDateRange[]): number {
  return ranges.filter((r) => r.start_date || r.end_date).length;
}

/** Pick whichever API field actually carries academic year rows (index payloads vary). */
function pickAcademicYearsSource(item: any): unknown[] {
  const keys = [
    "academic_years",
    "academicYears",
    "AcademicYears",
    "academic_year_ranges",
    "academicYearRanges",
    "cohort_academic_years",
    "cohortAcademicYears",
    "academic_year_periods",
    "academicYearPeriods",
    "academic_years_data",
    "academicYearsData",
  ];
  let best: unknown[] = [];
  let bestScore = -1;
  for (const k of keys) {
    const coerced = coerceArrayish(item?.[k]);
    const normalized = coerced.map((row) =>
      normalizeDateRange(flattenCohortRow(row)),
    );
    const sc = scoreDateRanges(normalized);
    if (sc > bestScore) {
      bestScore = sc;
      best = coerced;
    }
  }
  return best;
}

/** Some APIs expose two academic years as sibling objects instead of an array. */
function tryStructuredAcademicYears(item: any): ICohortDateRange[] | null {
  const pairs: [unknown, unknown][] = [
    [item?.first_academic_year, item?.second_academic_year],
    [item?.academic_year_first, item?.academic_year_second],
    [item?.year_one, item?.year_two],
    [item?.firstYear, item?.secondYear],
    [item?.academicYearOne, item?.academicYearTwo],
  ];
  for (const [a, b] of pairs) {
    if (!a && !b) continue;
    const r0 = normalizeDateRange(flattenCohortRow(a));
    const r1 = normalizeDateRange(flattenCohortRow(b));
    if (
      r0.start_date ||
      r0.end_date ||
      r1.start_date ||
      r1.end_date
    ) {
      return [r0, r1];
    }
  }
  return null;
}

function normalizeDateRangeArray(raw: unknown): ICohortDateRange[] {
  const rows = coerceArrayish(raw);
  return rows.map((row) => normalizeDateRange(flattenCohortRow(row)));
}

function normalizeCohort(raw: any): ICohort {
  const item = flattenCohortRow(raw);

  let academic_years = normalizeDateRangeArray(pickAcademicYearsSource(item));
  if (scoreDateRanges(academic_years) === 0) {
    const structured = tryStructuredAcademicYears(item);
    if (structured) academic_years = structured;
  }
  const makeupRaw =
    item?.makeup_exam_periods ??
    item?.makeupExamPeriods ??
    item?.MakeupExamPeriods ??
    [];
  const makeup_exam_periods = normalizeDateRangeArray(makeupRaw);

  const startYearApi = toYearString(
    firstDefined(item?.start_year, item?.startYear, item?.cohort_start_year),
  );
  const endYearApi = toYearString(
    firstDefined(item?.end_year, item?.endYear, item?.cohort_end_year),
  );

  const start_date = startYearApi
    ? `${startYearApi}-01-01`
    : pickMainStartDate(item, academic_years);
  const end_date = endYearApi
    ? `${endYearApi}-01-01`
    : pickMainEndDate(item, academic_years);

  return {
    id: Number(item?.id) || 0,
    name: String(
      (firstDefined(
        typeof item?.name === "string" ? item.name : undefined,
        item?.name_ar,
        item?.name?.ar,
        item?.name?.en,
        item?.name_en,
      ) as string | undefined) ?? "",
    ).trim(),
    name_ar:
      (firstDefined(
        item?.name_ar,
        item?.name?.ar,
        typeof item?.name === "string" ? item.name : undefined,
      ) as string | undefined) ?? "",
    name_en:
      (firstDefined(item?.name_en, item?.name?.en) as string | undefined) ?? "",
    start_date,
    end_date,
    enrollment_start_date: toIsoDateString(
      firstDefined(
        item?.enrollment_start_date,
        item?.enrollment_start,
        item?.enrollmentStartDate,
      ),
    ),
    enrollment_end_date: toIsoDateString(
      firstDefined(
        item?.enrollment_end_date,
        item?.enrollment_end,
        item?.enrollmentEndDate,
      ),
    ),
    academic_years,
    makeup_exam_periods,
    start_date_hijri: firstDefined(
      item?.start_date_hijri,
      item?.startDateHijri,
    ) as string | undefined,
    end_date_hijri: firstDefined(item?.end_date_hijri, item?.endDateHijri) as
      | string
      | undefined,
    is_active: Boolean(
      item?.is_active === true || Number(item?.is_active ?? 0) === 1,
    ),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
    message: item?.message ?? "",
  };
}

/** Laravel expects the same keys as Postman (form body). Use FormData so axios
 *  drops default `application/json` and sends multipart — URLSearchParams was
 *  sent with JSON Content-Type and the server saw empty fields. */
function appendNestedDateRanges(
  fd: FormData,
  prefix: string,
  items: ICohortDateRange[] | undefined,
) {
  const complete = (items ?? []).filter(
    (r) =>
      String(r?.start_date ?? "").trim() && String(r?.end_date ?? "").trim(),
  );
  complete.forEach((row, i) => {
    fd.append(`${prefix}[${i}][start_date]`, row.start_date);
    fd.append(`${prefix}[${i}][end_date]`, row.end_date);
  });
}

function buildCohortFormData(
  data: ICreateCohortPayload | IUpdateCohortPayload,
) {
  const fd = new FormData();
  const nameAr = String(data.name_ar ?? "").trim();
  const nameEn = String(data.name_en ?? "").trim();
  /** Single `name` avoids Laravel `name.ar` rules that often reject digits/symbols. */
  const primaryName = nameAr || nameEn;
  fd.append("name", primaryName);
  if (nameEn) fd.append("name[en]", nameEn);
  const startYear = yearFromCohortFormDate(data.start_date);
  const endYear = yearFromCohortFormDate(data.end_date);
  fd.append("start_year", startYear);
  fd.append("end_year", endYear);
  fd.append("enrollment_start_date", data.enrollment_start_date);
  fd.append("enrollment_end_date", data.enrollment_end_date);
  fd.append("is_active", data.is_active ? "1" : "0");
  appendNestedDateRanges(fd, "academic_years", data.academic_years);
  appendNestedDateRanges(fd, "makeup_exam_periods", data.makeup_exam_periods);
  return fd;
}

/** GET show/index may nest the model under data / Cohort / attributes. */
function pickCohortFromPayload(response: any): any {
  const nested = response?.data ?? response;
  const raw =
    nested?.Cohort ??
    nested?.cohort ??
    nested?.data?.Cohort ??
    nested?.data?.cohort ??
    (Array.isArray(nested?.data) ? nested.data[0] : null) ??
    (nested?.id != null ? nested : null);

  if (!raw) return null;
  return flattenCohortRow(raw);
}

export const cohortsApi = createApi({
  reducerPath: "cohortsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Cohorts", "Cohort"],
  endpoints: (builder) => ({
    getCohorts: builder.query<ICohort[], void>({
      query: () => ({
        url: "/cohorts",
        method: "get",
        params: {
          page: 0,
          limit: 0,
        },
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw =
          (Array.isArray(d?.data) ? d.data : null) ??
          d?.data?.data ??
          d?.Cohorts ??
          d?.cohorts ??
          d?.data ??
          d ??
          [];

        const list = Array.isArray(raw) ? raw : [];
        return list.map((row) => normalizeCohort(unwrapListRow(row)));
      },
      providesTags: ["Cohorts"],
    }),

    getCohortById: builder.query<ICohort, number>({
      query: (id) => ({
        url: `/cohorts/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickCohortFromPayload(response);

        if (!raw) {
          throw new Error("Cohort data not found");
        }

        return normalizeCohort(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Cohort", id }],
    }),

    createCohort: builder.mutation<
      { message: string; data?: ICohort },
      ICreateCohortPayload
    >({
      query: (data) => ({
        url: "/cohorts",
        method: "post",
        data: buildCohortFormData(data),
      }),
      invalidatesTags: ["Cohorts"],
    }),

    updateCohort: builder.mutation<
      { message: string; data?: ICohort },
      { id: number; data: IUpdateCohortPayload }
    >({
      query: ({ id, data }) => ({
        url: `/cohorts/${id}`,
        method: "put",
        data: buildCohortFormData(data),
      }),
      invalidatesTags: (_r, _e, { id }) => ["Cohorts", { type: "Cohort", id }],
    }),

    deleteCohort: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/cohorts/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Cohorts"],
    }),

    toggleCohortStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/cohorts/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cohortsApi.util.updateQueryData(
            "getCohorts",
            undefined,
            (draft: ICohort[]) => {
              const row = draft.find((c) => c.id === id);
              if (row) {
                row.is_active = !row.is_active;
              }
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Cohorts"],
    }),
  }),
});

export const {
  useGetCohortsQuery,
  useGetCohortByIdQuery,
  useCreateCohortMutation,
  useUpdateCohortMutation,
  useDeleteCohortMutation,
  useToggleCohortStatusMutation,
} = cohortsApi;
