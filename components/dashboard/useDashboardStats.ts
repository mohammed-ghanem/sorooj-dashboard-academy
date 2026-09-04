"use client";

import { useEffect, useMemo, useState } from "react";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useGetCohortsQuery } from "@/store/cohorts/cohortsApi";
import { useGetAcademicYearsQuery } from "@/store/academicYears/academicYearsApi";
import {
  emptyStatistics,
  useGetStatisticsQuery,
} from "@/store/statistics/statisticsApi";
import { isDoctorPortal } from "@/lib/portal";
import type {
  DashboardFilters,
  DashboardStats,
  DashboardStatsPayload,
} from "./types";

export function useDashboardStats(
  filters: DashboardFilters,
): DashboardStats {
  const sessionReady = useSessionReady();
  const { hasModuleAccess, isReady } = useUserPermissions();
  const permReady = sessionReady && isReady;
  const doctorPortal = isDoctorPortal();

  const skipCohorts = doctorPortal || !permReady || !hasModuleAccess("cohorts");
  const skipYears =
    doctorPortal || !permReady || !hasModuleAccess("academic_years");

  const statsQuery = useGetStatisticsQuery(filters, {
    skip: !permReady,
  });
  const cohortsQuery = useGetCohortsQuery(undefined, { skip: skipCohorts });
  const yearsQuery = useGetAcademicYearsQuery(undefined, { skip: skipYears });

  const [cached, setCached] = useState<DashboardStatsPayload | null>(null);

  useEffect(() => {
    if (statsQuery.data) setCached(statsQuery.data);
  }, [statsQuery.data]);

  return useMemo(() => {
    const payload = statsQuery.data ?? cached ?? emptyStatistics();
    return {
      ...payload,
      isLoading:
        !permReady || (statsQuery.isLoading && !statsQuery.data && !cached),
      isFetching: statsQuery.isFetching,
      filters: {
        cohorts: (cohortsQuery.data ?? []).map((cohort) => ({
          id: String(cohort.id),
          label: cohort.name || cohort.name_ar || cohort.name_en,
        })),
        years: (yearsQuery.data ?? []).map((year) => ({
          id: String(year.id),
          label: year.name || year.name_ar || year.name_en,
        })),
      },
    };
  }, [
    permReady,
    statsQuery.data,
    statsQuery.isLoading,
    statsQuery.isFetching,
    cached,
    cohortsQuery.data,
    yearsQuery.data,
  ]);
}
