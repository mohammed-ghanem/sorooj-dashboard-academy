/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  DashboardFilters,
  DashboardKpi,
  DashboardNamedCount,
  DashboardPhase,
  DashboardStatsPayload,
  StageKey,
} from "@/components/dashboard/types";

const STAGE_KEYS: StageKey[] = [
  "studying",
  "makeup_pending",
  "makeup",
  "year_failed",
  "program_completed",
];

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function pickStatistics(response: any) {
  const body = response?.data ?? response;
  return (
    body?.Statistics ??
    body?.statistics ??
    body?.data?.Statistics ??
    body?.data?.statistics ??
    body
  );
}

function kpi(source: any, key: string): DashboardKpi {
  const item = source?.[key] ?? {};
  const change = item?.change_percentage;
  return {
    value: num(item?.value),
    changePercentage: change == null || change === "" ? null : num(change),
  };
}

function listValue(items: any[], key: string) {
  const row = (Array.isArray(items) ? items : []).find(
    (item) => String(item?.key ?? "") === key,
  );
  return num(row?.value ?? row?.count);
}

function listCount(items: any[], key: string) {
  const row = (Array.isArray(items) ? items : []).find(
    (item) => String(item?.key ?? "") === key,
  );
  return num(row?.count ?? row?.value);
}

function examRate(group: any, key: string) {
  return num(group?.[key]?.pass_rate);
}

function namedCount(
  item: any,
  countKey: "books" | "subjects" | "count",
): DashboardNamedCount | null {
  if (!item) return null;
  const name = String(item?.name ?? "").trim();
  if (!name && item?.id == null) return null;
  return {
    id: item?.id != null ? num(item.id) : undefined,
    name: name || String(item.id),
    count: num(item?.[countKey] ?? item?.count),
  };
}

export function emptyStatistics(): DashboardStatsPayload {
  const zero: DashboardKpi = { value: 0, changePercentage: null };
  return {
    kpis: {
      studentsTotal: zero,
      studentsEnrolled: zero,
      studentsNotEnrolled: zero,
      doctorsActive: zero,
      countries: zero,
      actionRequired: zero,
    },
    path: { registered: 0, enrolled: 0, studying: 0, completed: 0 },
    phases: STAGE_KEYS.map((key) => ({ key, value: 0, percentage: 0 })),
    program: { terms: 0, subjects: 0, lessons: 0, videos: 0, watchRate: 0 },
    tracks: {
      categories: 0,
      subjects: 0,
      lessons: 0,
      examAttempts: 0,
      passRate: 0,
      topCategory: null,
    },
    library: {
      categories: 0,
      activeBooks: 0,
      inactiveBooks: 0,
      sheikhs: 0,
      topCategories: [],
    },
    attention: {
      essayReviews: 0,
      unrepliedMessages: 0,
      makeupPending: 0,
      makeup: 0,
      yearFailures: 0,
      subjectsWithoutExam: 0,
      total: 0,
    },
    exams: {
      program: { subject: 0, lesson: 0, video: 0 },
      tracks: { subject: 0, lesson: 0, video: 0 },
    },
  };
}

export function normalizeStatistics(response: any): DashboardStatsPayload {
  const raw = pickStatistics(response) ?? {};
  const kpis = raw?.kpis ?? {};
  const journey = Array.isArray(raw?.student_journey) ? raw.student_journey : [];
  const phasesRaw = Array.isArray(raw?.progress_phases) ? raw.progress_phases : [];
  const attentionRaw = Array.isArray(raw?.attention) ? raw.attention : [];
  const program = raw?.program ?? {};
  const tracks = raw?.scientific_tracks ?? {};
  const library = raw?.library ?? {};
  const exams = raw?.exams ?? {};

  const phases: DashboardPhase[] = STAGE_KEYS.map((key) => {
    const row = phasesRaw.find((item: any) => String(item?.key ?? "") === key);
    return {
      key,
      value: num(row?.value),
      percentage: num(row?.percentage),
    };
  });

  const attention = {
    essayReviews: listCount(attentionRaw, "pending_article_reviews"),
    unrepliedMessages: listCount(attentionRaw, "unanswered_contacts"),
    makeupPending: listCount(attentionRaw, "makeup_pending"),
    makeup: listCount(attentionRaw, "makeup"),
    yearFailures: listCount(attentionRaw, "year_failed"),
    subjectsWithoutExam: listCount(attentionRaw, "subjects_without_exam"),
    total: 0,
  };
  attention.total = kpi(kpis, "action_required").value;

  return {
    kpis: {
      studentsTotal: kpi(kpis, "students_total"),
      studentsEnrolled: kpi(kpis, "students_enrolled"),
      studentsNotEnrolled: kpi(kpis, "students_not_enrolled"),
      doctorsActive: kpi(kpis, "doctors_active"),
      countries: kpi(kpis, "countries"),
      actionRequired: kpi(kpis, "action_required"),
    },
    path: {
      registered: listValue(journey, "registered"),
      enrolled: listValue(journey, "enrolled"),
      studying: listValue(journey, "studying"),
      completed: listValue(journey, "completed"),
    },
    phases,
    program: {
      terms: num(program.study_terms),
      subjects: num(program.subjects),
      lessons: num(program.lessons),
      videos: num(program.videos),
      watchRate: num(program.watch_completion_rate),
    },
    tracks: {
      categories: num(tracks.categories),
      subjects: num(tracks.subjects),
      lessons: num(tracks.lessons),
      examAttempts: num(tracks.exam_attempts),
      passRate: num(tracks.pass_rate),
      topCategory: namedCount(tracks.top_category, "subjects"),
    },
    library: {
      categories: num(library.categories),
      activeBooks: num(library.books_active),
      inactiveBooks: num(library.books_inactive),
      sheikhs: num(library.doctors_with_books),
      topCategories: (Array.isArray(library.top_categories)
        ? library.top_categories
        : []
      )
        .map((item: any) => namedCount(item, "books"))
        .filter((item: DashboardNamedCount | null): item is DashboardNamedCount =>
          Boolean(item),
        ),
    },
    attention,
    exams: {
      program: {
        subject: examRate(exams.program, "subject"),
        lesson: examRate(exams.program, "lesson"),
        video: examRate(exams.program, "video"),
      },
      tracks: {
        subject: examRate(exams.scientific_tracks, "subject"),
        lesson: examRate(exams.scientific_tracks, "lesson"),
        video: examRate(exams.scientific_tracks, "video"),
      },
    },
  };
}

export function buildStatisticsParams(filters: DashboardFilters) {
  const params: Record<string, string> = {
    period: filters.period || "month",
  };
  if (filters.cohortId) params.cohort_id = filters.cohortId;
  if (filters.yearId) params.cohort_academic_year_id = filters.yearId;
  return params;
}

export const statisticsApi = createApi({
  reducerPath: "statisticsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Statistics"],
  endpoints: (builder) => ({
    getStatistics: builder.query<DashboardStatsPayload, DashboardFilters>({
      query: (filters) => ({
        url: "/statistics",
        method: "get",
        params: buildStatisticsParams(filters),
      }),
      transformResponse: (response: any) => normalizeStatistics(response),
      providesTags: ["Statistics"],
    }),
  }),
});

export const { useGetStatisticsQuery } = statisticsApi;
