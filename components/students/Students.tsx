/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LangUseParams from "@/translate/LangUseParams";

import {
  useGetStudentsQuery,
  useToggleStudentStatusMutation,
  useDeleteStudentMutation,
} from "@/store/students/studentsApi";
import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSessionReady } from "@/hooks/useSessionReady";

import { Download, Eye, RotateCcw, UserCircle } from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";
import StudentEnrollmentCell from "./StudentEnrollmentCell";
import type { IStudent } from "@/types/student";
import { isStudentEnrolled } from "@/utils/studentEnrollment";
import { cn } from "@/lib/utils";

type EnrollmentTab = "all" | "enrolled" | "not_enrolled";
type SortKey = "newest" | "oldest" | "name";

type FilterOption = { id: string; label: string; count: number };

const FILTER_KEYS = [
  "enrollment",
  "cohort",
  "year",
  "term",
  "phase",
  "status",
  "country",
  "sort",
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

function phaseBadgeClass(phase: string | null) {
  switch (phase) {
    case "studying":
      return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
    case "makeup_pending":
      return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
    case "makeup":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
    case "year_failed":
      return "bg-rose-50 text-rose-800 ring-1 ring-rose-200";
    case "program_completed":
      return "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200";
    default:
      return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
  }
}

function buildOptions(
  students: IStudent[],
  pick: (s: IStudent) => { id: string; label: string } | null,
  lang: string,
  sortNumeric = true,
): FilterOption[] {
  const map = new Map<string, FilterOption>();
  for (const s of students) {
    const ref = pick(s);
    if (!ref || !ref.id) continue;
    const existing = map.get(ref.id);
    if (existing) existing.count += 1;
    else map.set(ref.id, { id: ref.id, label: ref.label, count: 1 });
  }
  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, lang === "ar" ? "ar" : "en", {
      numeric: sortNumeric,
    }),
  );
}

function toTimestamp(value: string | null) {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function Students() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams() ?? "ar";
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const headers = TABLE_HEADERS[lang as "ar" | "en"].students;
  const pg = translate?.pages.students;
  const f = pg?.filters;

  const { data: students = [], isLoading } = useGetStudentsQuery(undefined, {
    skip: !sessionReady,
  });
  const { data: studyTerms = [] } = useGetStudyTermsQuery(undefined, {
    skip: !sessionReady,
  });
  const [toggleStatus] = useToggleStudentStatusMutation();
  const [deleteStudent] = useDeleteStudentMutation();

  const getParam = (key: FilterKey) => searchParams.get(key) ?? "";
  const enrollment = (getParam("enrollment") || "all") as EnrollmentTab;
  const cohortId = getParam("cohort");
  const yearId = getParam("year");
  const termId = getParam("term");
  const phase = getParam("phase");
  const status = getParam("status");
  const countryId = getParam("country");
  const sort = (getParam("sort") || "newest") as SortKey;

  const setParams = useCallback(
    (updates: Partial<Record<FilterKey, string>>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        const isDefault =
          !value ||
          (key === "enrollment" && value === "all") ||
          (key === "sort" && value === "newest");
        if (isDefault) next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteStudent(id).unwrap();
      toast.success(res?.message);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
        return;
      }
      if (errorData?.message) {
        toast.error(errorData.message);
        return;
      }
    }
  };

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<IStudent>({
      getId: (row) => row.id,
      getStatus: (row) => row.is_active,
      onToggle: async (row) => {
        await toggleStatus(row.id);
      },
    });

  const enrollmentLabels = {
    enrolled: pg?.enrolled ?? "",
    notEnrolled: pg?.notEnrolled ?? "",
    enrollBtn: pg?.enrollBtn ?? "",
    enrollConfirmTitle: pg?.enrollConfirmTitle ?? "",
    enrollConfirmMessage: pg?.enrollConfirmMessage ?? "",
    cancelBtn: pg?.cancelBtn ?? "",
    confirmBtn: pg?.enrollConfirmBtn ?? "",
    enrollFailed: pg?.enrollFailed ?? "",
  };

  const yearLabel = useCallback(
    (s: IStudent) => {
      const y = s.academic_year;
      if (!y) return "";
      return (
        y.sequenceLabel ||
        `${f?.academicYearPrefix ?? (lang === "ar" ? "العام" : "Year")} ${y.sequence || y.id}`
      );
    },
    [f?.academicYearPrefix, lang],
  );

  // Dropdown filters (everything except enrollment) — used for tab counts.
  const matchesDropdowns = useCallback(
    (s: IStudent, skip?: FilterKey) => {
      if (skip !== "cohort" && cohortId && String(s.cohort?.id ?? "") !== cohortId)
        return false;
      if (skip !== "year" && yearId && String(s.academic_year?.id ?? "") !== yearId)
        return false;
      if (skip !== "term" && termId && String(s.study_term?.id ?? "") !== termId)
        return false;
      if (skip !== "phase" && phase && (s.progressPhase ?? "") !== phase)
        return false;
      if (skip !== "status" && status) {
        if (status === "active" && !s.is_active) return false;
        if (status === "inactive" && s.is_active) return false;
      }
      if (skip !== "country" && countryId && String(s.country?.id ?? "") !== countryId)
        return false;
      return true;
    },
    [cohortId, yearId, termId, phase, status, countryId],
  );

  const matchesEnrollment = useCallback(
    (s: IStudent) => {
      if (enrollment === "enrolled") return isStudentEnrolled(s);
      if (enrollment === "not_enrolled") return !isStudentEnrolled(s);
      return true;
    },
    [enrollment],
  );

  // Each dropdown's options reflect the other active filters (cascading).
  const poolFor = useCallback(
    (key: FilterKey) =>
      students.filter((s) => matchesEnrollment(s) && matchesDropdowns(s, key)),
    [students, matchesEnrollment, matchesDropdowns],
  );

  const cohortOptions = useMemo(
    () =>
      buildOptions(
        poolFor("cohort"),
        (s) =>
          s.cohort ? { id: String(s.cohort.id), label: s.cohort.name } : null,
        lang,
      ),
    [poolFor, lang],
  );

  const yearOptions = useMemo(
    () =>
      buildOptions(
        poolFor("year"),
        (s) =>
          s.academic_year
            ? { id: String(s.academic_year.id), label: yearLabel(s) }
            : null,
        lang,
      ),
    [poolFor, yearLabel, lang],
  );

  // All study terms from the API (scoped to the selected academic year),
  // with student counts — terms with no students still appear with (0).
  const termOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of poolFor("term")) {
      if (!s.study_term) continue;
      const id = String(s.study_term.id);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    const map = new Map<string, FilterOption>();
    for (const term of studyTerms) {
      if (yearId && String(term.academic_year_id ?? "") !== yearId) continue;
      const loc = parseLocalizedNameFromModel(term);
      const label =
        (lang === "ar"
          ? loc.name_ar || loc.name || loc.name_en
          : loc.name_en || loc.name || loc.name_ar) || `#${term.id}`;
      const id = String(term.id);
      map.set(id, { id, label, count: counts.get(id) ?? 0 });
    }

    for (const s of students) {
      if (!s.study_term) continue;
      const id = String(s.study_term.id);
      if (map.has(id)) continue;
      if (yearId && String(s.academic_year?.id ?? "") !== yearId) continue;
      map.set(id, {
        id,
        label: s.study_term.name,
        count: counts.get(id) ?? 0,
      });
    }

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label, lang === "ar" ? "ar" : "en", {
        numeric: true,
      }),
    );
  }, [poolFor, studyTerms, students, yearId, lang]);

  const phaseOptions = useMemo(
    () =>
      buildOptions(
        poolFor("phase"),
        (s) =>
          s.progressPhase
            ? {
                id: s.progressPhase,
                label: s.progressPhaseLabel || s.progressPhase,
              }
            : null,
        lang,
      ),
    [poolFor, lang],
  );

  const countryOptions = useMemo(
    () =>
      buildOptions(
        poolFor("country"),
        (s) =>
          s.country ? { id: String(s.country.id), label: s.country.name } : null,
        lang,
        false,
      ),
    [poolFor, lang],
  );

  const statusCounts = useMemo(() => {
    const pool = poolFor("status");
    const active = pool.filter((s) => s.is_active).length;
    return { active, inactive: pool.length - active };
  }, [poolFor]);

  const enrollmentCounts = useMemo(() => {
    const pool = students.filter((s) => matchesDropdowns(s));
    const enrolled = pool.filter(isStudentEnrolled).length;
    return {
      all: pool.length,
      enrolled,
      not_enrolled: pool.length - enrolled,
    };
  }, [students, matchesDropdowns]);

  const filtered = useMemo(() => {
    const list = students.filter(
      (s) => matchesEnrollment(s) && matchesDropdowns(s),
    );
    const sorted = [...list];
    if (sort === "name") {
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name, lang === "ar" ? "ar" : "en"),
      );
    } else {
      sorted.sort((a, b) => {
        const diff = toTimestamp(b.created_at) - toTimestamp(a.created_at);
        const byDate = diff !== 0 ? diff : b.id - a.id;
        return sort === "oldest" ? -byDate : byDate;
      });
    }
    return sorted;
  }, [students, matchesEnrollment, matchesDropdowns, sort, lang]);

  const isFiltered =
    enrollment !== "all" ||
    !!cohortId ||
    !!yearId ||
    !!termId ||
    !!phase ||
    !!status ||
    !!countryId;

  const handleReset = () => {
    router.replace(
      sort !== "newest" ? `${pathname}?sort=${sort}` : pathname,
      { scroll: false },
    );
  };

  const handleExport = () => {
    const cols: [string, (s: IStudent) => unknown][] = [
      [headers.name, (s) => s.name],
      [headers.email, (s) => s.email],
      [headers.mobile, (s) => s.mobile],
      [headers.country, (s) => s.country?.name ?? ""],
      [headers.cohort, (s) => s.cohort?.name ?? ""],
      [f?.academicYear ?? "Academic year", (s) => yearLabel(s)],
      [f?.studyTerm ?? "Study term", (s) => s.study_term?.name ?? ""],
      [headers.phase, (s) => s.progressPhaseLabel ?? ""],
      [
        headers.enrollment,
        (s) => (isStudentEnrolled(s) ? pg?.enrolled : pg?.notEnrolled),
      ],
      [headers.status, (s) => (s.is_active ? pg?.active : pg?.inactive)],
    ];
    const lines = [
      cols.map(([h]) => csvEscape(h)).join(","),
      ...filtered.map((s) => cols.map(([, get]) => csvEscape(get(s))).join(",")),
    ];
    // BOM so Excel renders Arabic correctly.
    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<IStudent>[] = [
    {
      key: "name",
      header: headers.name,
      render: (_, row) => (
        <span className="font-medium truncate block min-w-0">{row.name}</span>
      ),
    },
    {
      key: "email",
      header: headers.email,
      render: (v) => <span className="truncate max-w-50 block">{v}</span>,
    },
    {
      key: "mobile",
      header: headers.mobile,
    },
    {
      key: "country",
      header: headers.country,
      render: (_, row) => (
        <span className="truncate">{row.country?.name ?? "—"}</span>
      ),
    },
    {
      key: "cohort",
      header: headers.cohort,
      render: (_, row) =>
        row.cohort ? (
          <div className="min-w-28">
            <p className="font-medium text-slate-800">{row.cohort.name}</p>
            {row.academic_year || row.study_term ? (
              <p className="text-xs text-slate-500">
                {[yearLabel(row), row.study_term?.name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "progressPhase",
      header: headers.phase,
      align: "center",
      render: (_, row) =>
        row.progressPhase ? (
          <span
            className={cn(
              "inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
              phaseBadgeClass(row.progressPhase),
            )}
          >
            {row.progressPhaseLabel || row.progressPhase}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "enrollmentStatus",
      header: headers.enrollment,
      align: "center",
      render: (_, row) => (
        <StudentEnrollmentCell student={row} labels={enrollmentLabels} />
      ),
    },
    {
      key: "is_active",
      header: headers.status,
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2" dir="ltr">
          <Switch
            className={dash.statusSwitch}
            checked={getOptimisticStatus(row)}
            disabled={isPending(row)}
            onCheckedChange={(checked) => {
              toggle(row, checked).catch(() => {
                toast.error(
                  lang === "ar"
                    ? "فشل تغيير الحالة"
                    : "Failed to update status",
                );
              });
            }}
          />
          <span className="text-sm text-slate-600">
            {getOptimisticStatus(row) ? pg?.active : pg?.inactive}
          </span>
        </div>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, row) => (
        <div className="flex justify-center gap-2 flex-wrap">
          <Link href={`/${lang}/students/view/${row.id}`}>
            <Button type="button" size="sm" className={dash.tableView}>
              <Eye className="w-5 h-5" />
            </Button>
          </Link>
          <DeleteConfirmDialog
            title={pg?.deleteTitle ?? ""}
            description={pg?.deleteMessage ?? ""}
            confirmText={pg?.deleteBtn ?? ""}
            cancelText={pg?.cancelBtn ?? ""}
            onConfirm={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  const enrollmentTabs: { key: EnrollmentTab; label: string; count: number }[] =
    [
      { key: "all", label: f?.all ?? "الكل", count: enrollmentCounts.all },
      {
        key: "enrolled",
        label: f?.enrolled ?? "ملتحقون",
        count: enrollmentCounts.enrolled,
      },
      {
        key: "not_enrolled",
        label: f?.notEnrolled ?? "غير ملتحقين",
        count: enrollmentCounts.not_enrolled,
      },
    ];

  const handleSelectChange = (key: FilterKey, value: string) => {
    if (key === "year" && value && termId) {
      const term = studyTerms.find((t) => String(t.id) === termId);
      if (term && String(term.academic_year_id ?? "") !== value) {
        setParams({ year: value, term: "" });
        return;
      }
    }
    setParams({ [key]: value });
  };

  const selectClass =
    "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-sm";

  const renderSelect = (
    key: FilterKey,
    value: string,
    allLabel: string,
    title: string,
    options: FilterOption[],
  ) => {
    if (options.length === 0 && !value) return null;
    return (
      <div className="relative flex min-w-40 flex-1 sm:flex-initial">
        <select
          value={value}
          onChange={(e) => handleSelectChange(key, e.target.value)}
          className={cn(
            selectClass,
            value && "border-emerald-400 bg-emerald-50/40 text-emerald-900",
          )}
          title={title}
        >
          <option value="">{allLabel}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label} ({opt.count})
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <IndexListPage
      icon={UserCircle}
      title={pg?.listTitle ?? ""}
      description={pg?.listDescription}
      createHref=""
      createLabel=""
      showCreate={false}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <div className="mb-4 space-y-3 px-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-50/80 p-1.5 ring-1 ring-slate-200/80">
            {enrollmentTabs.map((tab) => {
              const active = enrollment === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setParams({ enrollment: tab.key })}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
                    active
                      ? "bg-white text-emerald-900 shadow-sm ring-1 ring-emerald-200/70"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "inline-flex min-w-5 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums",
                      active
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-slate-200/70 text-slate-600",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setParams({ sort: e.target.value })}
              className={cn(selectClass, "w-auto min-w-36")}
            >
              <option value="newest">{f?.sortNewest ?? "الأحدث أولًا"}</option>
              <option value="oldest">{f?.sortOldest ?? "الأقدم أولًا"}</option>
              <option value="name">{f?.sortName ?? "حسب الاسم"}</option>
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 gap-1.5 rounded-xl"
              onClick={handleExport}
              disabled={filtered.length === 0}
            >
              <Download className="size-4" />
              {f?.export ?? "تصدير CSV"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {renderSelect(
            "cohort",
            cohortId,
            f?.allCohorts ?? "جميع الدفعات",
            f?.cohort ?? "الدفعة",
            cohortOptions,
          )}
          {renderSelect(
            "year",
            yearId,
            f?.allAcademicYears ?? "جميع الأعوام الدراسية",
            f?.academicYear ?? "العام الدراسي",
            yearOptions,
          )}
          {renderSelect(
            "term",
            termId,
            f?.allStudyTerms ?? "جميع المحاور الدراسية",
            f?.studyTerm ?? "المحور الدراسي",
            termOptions,
          )}
          {renderSelect(
            "phase",
            phase,
            f?.allPhases ?? "جميع مراحل التقدم",
            f?.phase ?? "مرحلة التقدم",
            phaseOptions,
          )}
          {renderSelect(
            "status",
            status,
            f?.allStatuses ?? "كل الحالات",
            f?.status ?? "الحالة",
            [
              {
                id: "active",
                label: f?.active ?? "نشط",
                count: statusCounts.active,
              },
              {
                id: "inactive",
                label: f?.inactive ?? "موقوف",
                count: statusCounts.inactive,
              },
            ],
          )}
          {renderSelect(
            "country",
            countryId,
            f?.allCountries ?? "جميع الدول",
            f?.country ?? "الدولة",
            countryOptions,
          )}

          {isFiltered ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 gap-1.5 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
              onClick={handleReset}
            >
              <RotateCcw className="size-3.5" />
              {f?.reset ?? "مسح الفلاتر"}
            </Button>
          ) : null}

          {!showSkeleton ? (
            <span className="ms-auto text-xs font-medium text-slate-500 sm:text-sm">
              {f?.results ?? "النتائج"}:{" "}
              <span className="font-bold tabular-nums text-slate-800">
                {filtered.length}
              </span>
              {isFiltered ? (
                <span className="tabular-nums"> / {students.length}</span>
              ) : null}
            </span>
          ) : null}
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={pg?.searchPlaceholder ?? "Search…"}
        className={dash.dataTableOuter}
        tableCardClassName={dash.dataTableCard}
        tableHeaderClassName={dash.dataTableHeader}
      />
    </IndexListPage>
  );
}
