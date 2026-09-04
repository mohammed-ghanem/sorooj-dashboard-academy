export type DashboardPeriod = "month" | "year" | "all" | "today" | "week";

export type DashboardFilters = {
  cohortId: string;
  yearId: string;
  period: DashboardPeriod;
};

export type DashboardFilterOption = {
  id: string;
  label: string;
};

export type StageKey =
  | "studying"
  | "makeup_pending"
  | "makeup"
  | "year_failed"
  | "program_completed";

export type DashboardKpi = {
  value: number;
  changePercentage: number | null;
};

export type DashboardNamedCount = {
  id?: number;
  name: string;
  count: number;
};

export type DashboardPhase = {
  key: StageKey;
  value: number;
  percentage: number;
};

export type DoctorExamGroup = {
  attempts: number;
  passRate: number;
  avgScore: number;
};

export type DoctorStatsPayload = {
  filters: {
    period: string;
    from: string;
    to: string;
  };
  kpis: {
    subjectsTaught: DashboardKpi;
    lessons: DashboardKpi;
    videos: DashboardKpi;
    books: DashboardKpi;
    studentsReached: DashboardKpi;
    pendingArticleReviews: DashboardKpi;
    examAttempts: DashboardKpi;
    actionRequired: DashboardKpi;
  };
  content: {
    program: { subjects: number; lessons: number; videos: number };
    scientificTracks: { subjects: number; lessons: number; videos: number };
    library: { booksActive: number; booksInactive: number };
  };
  exams: {
    video: DoctorExamGroup;
    lesson: DoctorExamGroup;
    subject: DoctorExamGroup;
  };
  attention: {
    pendingArticleReviews: number;
    lessonsWithoutExam: number;
    videosWithoutExam: number;
    subjectsWithoutExam: number;
  };
};

export type DashboardStatsPayload = {
  kpis: {
    studentsTotal: DashboardKpi;
    studentsEnrolled: DashboardKpi;
    studentsNotEnrolled: DashboardKpi;
    doctorsActive: DashboardKpi;
    countries: DashboardKpi;
    actionRequired: DashboardKpi;
  };
  path: {
    registered: number;
    enrolled: number;
    studying: number;
    completed: number;
  };
  phases: DashboardPhase[];
  program: {
    terms: number;
    subjects: number;
    lessons: number;
    videos: number;
    watchRate: number;
  };
  tracks: {
    categories: number;
    subjects: number;
    lessons: number;
    examAttempts: number;
    passRate: number;
    topCategory: DashboardNamedCount | null;
  };
  library: {
    categories: number;
    activeBooks: number;
    inactiveBooks: number;
    sheikhs: number;
    topCategories: DashboardNamedCount[];
  };
  attention: {
    essayReviews: number;
    unrepliedMessages: number;
    makeupPending: number;
    makeup: number;
    yearFailures: number;
    subjectsWithoutExam: number;
    total: number;
  };
    exams: {
      program: { subject: number; lesson: number; video: number };
      tracks: { subject: number; lesson: number; video: number };
    };
    doctor?: DoctorStatsPayload;
  };

export type DashboardStats = DashboardStatsPayload & {
  isLoading: boolean;
  isFetching: boolean;
  filters: {
    cohorts: DashboardFilterOption[];
    years: DashboardFilterOption[];
  };
};
