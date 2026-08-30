"use client";

import { dash } from "@/constants/dashboardUi";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";
import WelcomeBanner from "./WelcomeBanner";
import Statistics from "./Statistics";
import ContentModulesSection from "./ContentModulesSection";
import PublishingHealth from "./PublishingHealth";
import QuickLinks from "./QuickLinks";
import { useDashboardStats } from "./useDashboardStats";

export default function Dashboard() {
  const stats = useDashboardStats();

  if (stats.isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={dash.page}>
      <div className="space-y-8 md:space-y-10">
        <WelcomeBanner stats={stats} />
        <Statistics stats={stats} />
        <ContentModulesSection stats={stats} />
        <PublishingHealth stats={stats} />
        <QuickLinks />
      </div>
    </div>
  );
}
