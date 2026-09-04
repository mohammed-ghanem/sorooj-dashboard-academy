"use client";

import { useState } from "react";
import { dash } from "@/constants/dashboardUi";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";
import AcademyStatistics from "./AcademyStatistics";
import DoctorStatistics from "./DoctorStatistics";
import QuickLinks from "./QuickLinks";
import { useDashboardStats } from "./useDashboardStats";
import type { DashboardFilters } from "./types";
import { isDoctorPortal } from "@/lib/portal";

const INITIAL_FILTERS: DashboardFilters = {
  cohortId: "",
  yearId: "",
  period: "month",
};

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>(INITIAL_FILTERS);
  const stats = useDashboardStats(filters);

  if (stats.isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={dash.page}>
      <div className="space-y-8 md:space-y-10">
        {isDoctorPortal() ? (
          <DoctorStatistics
            stats={stats}
            filters={filters}
            onFiltersChange={setFilters}
          />
        ) : (
          <AcademyStatistics
            stats={stats}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}
        <QuickLinks />
      </div>
    </div>
  );
}
