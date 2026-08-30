export type ModuleColor =
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "amber"
  | "lime";

export type DashboardModuleStat = {
  key: string;
  count: number;
  active: number;
  inactive: number;
  color: ModuleColor;
};

export type DashboardStats = {
  isLoading: boolean;
  totals: {
    students: number;
    doctors: number;
    lessons: number;
    cohorts: number;
    totalLearningItems: number;
  };
  modules: DashboardModuleStat[];
  publishing: {
    active: number;
    inactive: number;
    publishedThisWeek: number;
  };
};
