/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";

import {
  useGetLessonsQuery,
  useDeleteLessonMutation,
  useToggleLessonStatusMutation,
} from "@/store/lessons/lessonsApi";
import { useDeleteLessonExamMutation } from "@/store/lessonExams/lessonExamsApi";
import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import { useGetSubjectsQuery } from "@/store/subjects/subjectsApi";
import { useGetScientificTrackCategoriesQuery } from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
import { useGetScientificTrackSubjectsQuery } from "@/store/scientificTrackSubjects/scientificTrackSubjectsApi";
import { useGetDoctorsQuery } from "@/store/doctors/doctorsApi";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSessionReady } from "@/hooks/useSessionReady";
import { cn } from "@/lib/utils";

import {
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Film,
  PlayCircle,
  RotateCcw,
} from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";
import LessonExamActionsCell from "@/components/lessons/exam/LessonExamActionsCell";

import type { ILesson, LessonTrackType } from "@/types/lesson";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";
import {
  ACADEMIC_LESSONS_BASE_PATH,
  lessonVideosHref,
} from "@/utils/lessonsPaths";

type LessonsProps = {
  track?: LessonTrackType;
  basePath?: string;
};

type StatusTab = "all" | "active" | "inactive";

export default function Lessons({
  track = "study_term",
  basePath = ACADEMIC_LESSONS_BASE_PATH,
}: LessonsProps) {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang as "ar" | "en"].lessons;
  const pg = translate?.pages.lessons;

  // Filter States
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [selectedParentId, setSelectedParentId] = useState<string>("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");

  const { data: lessons = [], isLoading } = useGetLessonsQuery(
    { type: track },
    { skip: !sessionReady },
  );

  // Associated hierarchies for filtering
  const { data: studyTerms = [] } = useGetStudyTermsQuery(undefined, {
    skip: !sessionReady || track !== "study_term",
  });
  const { data: academicSubjects = [] } = useGetSubjectsQuery(undefined, {
    skip: !sessionReady || track !== "study_term",
  });

  const { data: trackCategories = [] } = useGetScientificTrackCategoriesQuery(
    undefined,
    { skip: !sessionReady || track !== "category" },
  );
  const { data: trackSubjects = [] } = useGetScientificTrackSubjectsQuery(
    undefined,
    { skip: !sessionReady || track !== "category" },
  );

  const { data: doctors = [] } = useGetDoctorsQuery(undefined, {
    skip: !sessionReady,
  });

  const [deleteLesson] = useDeleteLessonMutation();
  const [deleteLessonExam] = useDeleteLessonExamMutation();
  const [toggleStatus] = useToggleLessonStatusMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<ILesson>({
      getId: (row) => row.id,
      getStatus: (row) => row.is_active,
      onToggle: async (row) => {
        await toggleStatus({ id: row.id, type: track });
      },
    });

  // Map of subjectId -> parentId (study_term_id or category_id)
  const subjectToParentMap = useMemo(() => {
    const map = new Map<number, number>();
    if (track === "study_term") {
      academicSubjects.forEach((s) => {
        if (s.id && s.study_term_id) {
          map.set(s.id, s.study_term_id);
        }
      });
    } else {
      trackSubjects.forEach((s) => {
        if (s.id && s.category_id) {
          map.set(s.id, s.category_id);
        }
      });
    }

    // Supplement with any embedded parent id on lesson subjects
    lessons.forEach((l) => {
      const pid =
        track === "study_term"
          ? l.subject?.study_term_id
          : l.subject?.category_id;
      if (l.subject_id && pid && !map.has(l.subject_id)) {
        map.set(l.subject_id, pid);
      }
    });

    return map;
  }, [track, academicSubjects, trackSubjects, lessons]);

  // Options for Parent select (Study Terms or Categories) with lesson counts
  const parentOptions = useMemo(() => {
    const counts = new Map<number, number>();
    lessons.forEach((l) => {
      const pid = subjectToParentMap.get(l.subject_id);
      if (pid != null) {
        counts.set(pid, (counts.get(pid) ?? 0) + 1);
      }
    });

    if (track === "study_term") {
      return studyTerms.map((st) => {
        const loc = parseLocalizedNameFromModel(st);
        const label =
          lang === "ar"
            ? loc.name_ar || loc.name || loc.name_en
            : loc.name_en || loc.name || loc.name_ar;
        return {
          id: String(st.id),
          label: label || `#${st.id}`,
          count: counts.get(st.id) ?? 0,
        };
      });
    }

    return trackCategories.map((c) => ({
      id: String(c.id),
      label: c.name || `#${c.id}`,
      count: counts.get(c.id) ?? 0,
    }));
  }, [track, studyTerms, trackCategories, lessons, subjectToParentMap, lang]);

  // Options for Subject select, filtered by selectedParentId if one is chosen
  const subjectOptions = useMemo(() => {
    const map = new Map<
      number,
      { id: number; label: string; parentId?: number; count: number }
    >();

    const sourceSubjects =
      track === "study_term" ? academicSubjects : trackSubjects;

    sourceSubjects.forEach((s: any) => {
      const loc = parseLocalizedNameFromModel(s);
      const label =
        track === "category"
          ? s.name
          : lang === "ar"
            ? loc.name_ar || loc.name || loc.name_en
            : loc.name_en || loc.name || loc.name_ar;
      const pid = track === "study_term" ? s.study_term_id : s.category_id;
      map.set(s.id, {
        id: s.id,
        label: label || `#${s.id}`,
        parentId: pid,
        count: 0,
      });
    });

    // Also include any subjects directly found in lessons
    lessons.forEach((l) => {
      if (!l.subject_id) return;
      if (!map.has(l.subject_id)) {
        const loc = parseLocalizedNameFromModel(l.subject);
        const label =
          track === "category"
            ? l.subject?.name
            : lang === "ar"
              ? loc.name_ar || loc.name || loc.name_en
              : loc.name_en || loc.name || loc.name_ar;
        const pid = subjectToParentMap.get(l.subject_id);
        map.set(l.subject_id, {
          id: l.subject_id,
          label: label || `#${l.subject_id}`,
          parentId: pid,
          count: 0,
        });
      }
      const item = map.get(l.subject_id);
      if (item) item.count += 1;
    });

    let list = Array.from(map.values());
    if (selectedParentId !== "all") {
      const targetPid = Number(selectedParentId);
      list = list.filter((s) => s.parentId === targetPid);
    }

    return list.sort((a, b) =>
      a.label.localeCompare(b.label, lang === "ar" ? "ar" : "en", {
        numeric: true,
      }),
    );
  }, [
    track,
    academicSubjects,
    trackSubjects,
    lessons,
    selectedParentId,
    subjectToParentMap,
    lang,
  ]);

  // Options for Doctor select with lesson counts
  const doctorOptions = useMemo(() => {
    const counts = new Map<number, number>();
    const docMap = new Map<number, string>();

    doctors.forEach((d) => {
      if (d.id) docMap.set(d.id, d.name);
    });

    lessons.forEach((l) => {
      if (l.doctor_id) {
        counts.set(l.doctor_id, (counts.get(l.doctor_id) ?? 0) + 1);
        if (!docMap.has(l.doctor_id) && l.doctor?.name) {
          docMap.set(l.doctor_id, l.doctor.name);
        }
      }
    });

    return Array.from(counts.keys())
      .map((id) => ({
        id: String(id),
        label: docMap.get(id) || `#${id}`,
        count: counts.get(id) ?? 0,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, lang === "ar" ? "ar" : "en"),
      );
  }, [doctors, lessons, lang]);

  const handleParentChange = (val: string) => {
    setSelectedParentId(val);
    if (val !== "all" && selectedSubjectId !== "all") {
      const targetPid = Number(val);
      const sub = subjectOptions.find(
        (s) => String(s.id) === selectedSubjectId,
      );
      if (sub && sub.parentId !== targetPid) {
        setSelectedSubjectId("all");
      }
    }
  };

  const isFiltered =
    selectedParentId !== "all" ||
    selectedSubjectId !== "all" ||
    selectedDoctorId !== "all";

  const handleResetFilters = () => {
    setSelectedParentId("all");
    setSelectedSubjectId("all");
    setSelectedDoctorId("all");
  };

  // Filter lessons based on all active criteria
  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      // Status Tab
      if (statusTab === "active" && !l.is_active) return false;
      if (statusTab === "inactive" && l.is_active) return false;

      // Parent (study term or category)
      if (selectedParentId !== "all") {
        const pid = subjectToParentMap.get(l.subject_id);
        if (pid !== Number(selectedParentId)) return false;
      }

      // Subject
      if (selectedSubjectId !== "all") {
        if (l.subject_id !== Number(selectedSubjectId)) return false;
      }

      // Doctor
      if (selectedDoctorId !== "all") {
        if (l.doctor_id !== Number(selectedDoctorId)) return false;
      }

      return true;
    });
  }, [
    lessons,
    statusTab,
    selectedParentId,
    selectedSubjectId,
    selectedDoctorId,
    subjectToParentMap,
  ]);

  const allCount = lessons.length;
  const activeCount = useMemo(
    () => lessons.filter((l) => l.is_active).length,
    [lessons],
  );
  const inactiveCount = allCount - activeCount;

  const displaySubject = (lesson: ILesson) => {
    const nested = lesson.subject;
    if (nested) {
      if (track === "category" && nested.name) return nested.name;
      const loc = parseLocalizedNameFromModel(nested);
      return lang === "ar"
        ? loc.name_ar || loc.name || loc.name_en || "—"
        : loc.name_en || loc.name || loc.name_ar || "—";
    }
    return lesson.subject_id ? `#${lesson.subject_id}` : "—";
  };

  const displayDoctor = (lesson: ILesson) => {
    const n = lesson.doctor?.name?.trim();
    if (n) return n;
    return lesson.doctor_id ? `#${lesson.doctor_id}` : "—";
  };

  const handleDeleteExam = async (lessonId: number) => {
    try {
      const res = await deleteLessonExam(lessonId).unwrap();
      toast.success(res?.message);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.message) {
        toast.error(errorData.message);
        return;
      }
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteLesson(id).unwrap();
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

  const columns: Column<ILesson>[] = [
    {
      key: "lesson_number",
      header: headers.lessonNumber,
      render: (_, row) => (
        <span className="text-sm font-semibold text-slate-800">
          {row.lesson_number || "—"}
        </span>
      ),
    },
    {
      key: "title",
      header: headers.title,
      render: (_, row) => (
        <span className="font-medium text-slate-900 line-clamp-2 max-w-60 md:max-w-xs">
          {row.title || "—"}
        </span>
      ),
    },
    {
      key: "subject_id",
      header: headers.subject,
      render: (_, row) => (
        <span className="text-sm text-slate-700">{displaySubject(row)}</span>
      ),
    },
    {
      key: "doctor_id",
      header: headers.doctor,
      render: (_, row) => (
        <span className="text-sm text-slate-700">{displayDoctor(row)}</span>
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
      key: "videos",
      header: headers.videoExams,
      align: "center",
      render: (_, row) => (
        <Link href={lessonVideosHref(lang ?? "ar", row.id, basePath)}>
          <Button
            type="button"
            size="sm"
            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white h-9 w-9 p-0 shadow-sm"
            title={pg?.videoExam?.tooltipVideosList ?? ""}
            aria-label={pg?.videoExam?.tooltipVideosList ?? ""}
          >
            <PlayCircle className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, row) => (
        <div className="flex flex-col items-center gap-2 min-w-50">
          <div className="flex justify-center gap-2 flex-wrap">
            <Link href={`/${lang}/${basePath}/view/${row.id}`}>
              <Button
                type="button"
                size="sm"
                className={dash.tableView}
                title={translate?.pages.lessons.viewLesson?.title}
              >
                <Eye className="w-5 h-5" />
              </Button>
            </Link>
            <Link href={`/${lang}/${basePath}/edit/${row.id}`}>
              <Button
                type="button"
                size="sm"
                className={dash.tableEdit}
                title={translate?.pages.lessons.editLesson?.title}
              >
                <Edit3 className="h-4 w-4" />
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

          <LessonExamActionsCell
            lessonId={row.id}
            lang={lang ?? "ar"}
            examUi={pg?.lessonExam}
            lessonsBasePath={basePath}
            onDeleteExam={() => handleDeleteExam(row.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  const parentSelectLabel =
    track === "study_term"
      ? pg?.allStudyTerms ??
        (lang === "ar" ? "جميع المحاور الدراسية" : "All study terms")
      : pg?.allCategories ??
        (lang === "ar" ? "جميع الأقسام" : "All categories");

  const parentTitle =
    track === "study_term"
      ? pg?.filterByStudyTerm ??
        (lang === "ar" ? "المحور الدراسي" : "Study term")
      : pg?.filterByCategory ?? (lang === "ar" ? "القسم" : "Category");

  return (
    <IndexListPage
      icon={Film}
      title={pg?.listTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/${basePath}/create`}
      createLabel={pg?.createLesson?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <div className="space-y-4">
        {/* Controls Bar: Status Tabs + Filters */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-50/80 p-1.5 ring-1 ring-slate-200/80">
            <button
              type="button"
              onClick={() => setStatusTab("all")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
                statusTab === "all"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-300"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
              )}
            >
              <span>
                {pg?.tabAll ??
                  (lang === "ar" ? "جميع الدروس" : "All lessons")}
              </span>
              <span
                className={cn(
                  "inline-flex min-w-5 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums",
                  statusTab === "all"
                    ? "bg-slate-200 text-slate-800"
                    : "bg-slate-200/70 text-slate-600",
                )}
              >
                {allCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusTab("active")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
                statusTab === "active"
                  ? "bg-white text-emerald-900 shadow-sm ring-1 ring-emerald-200/70"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
              )}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>
                {pg?.tabActive ??
                  (lang === "ar" ? "الدروس النشطة" : "Active lessons")}
              </span>
              <span
                className={cn(
                  "inline-flex min-w-5 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums",
                  statusTab === "active"
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-slate-200/70 text-slate-600",
                )}
              >
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusTab("inactive")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
                statusTab === "inactive"
                  ? "bg-white text-amber-900 shadow-sm ring-1 ring-amber-200/70"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
              )}
            >
              <Clock className="h-4 w-4 text-amber-600" />
              <span>
                {pg?.tabInactive ??
                  (lang === "ar"
                    ? "الدروس غير النشطة"
                    : "Inactive lessons")}
              </span>
              <span
                className={cn(
                  "inline-flex min-w-5 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums",
                  statusTab === "inactive"
                    ? "bg-amber-100 text-amber-900"
                    : "bg-slate-200/70 text-slate-600",
                )}
              >
                {inactiveCount}
              </span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Parent Select (Study Term or Category) */}
            {parentOptions.length > 0 ? (
              <div className="relative flex min-w-44 flex-1 sm:flex-initial">
                <select
                  value={selectedParentId}
                  onChange={(e) => handleParentChange(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                  title={parentTitle}
                >
                  <option value="all">{parentSelectLabel}</option>
                  {parentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Subject Select */}
            {subjectOptions.length > 0 ? (
              <div className="relative flex min-w-44 flex-1 sm:flex-initial">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                  title={
                    pg?.filterBySubject ??
                    (lang === "ar" ? "المادة الدراسية" : "Subject")
                  }
                >
                  <option value="all">
                    {pg?.allSubjects ??
                      (lang === "ar"
                        ? "جميع المواد الدراسية"
                        : "All subjects")}
                  </option>
                  {subjectOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Doctor Select */}
            {doctorOptions.length > 1 ? (
              <div className="relative flex min-w-40 flex-1 sm:flex-initial">
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                  title={
                    pg?.filterByDoctor ??
                    (lang === "ar"
                      ? "عضو هيئة التدريس"
                      : "Faculty member")
                  }
                >
                  <option value="all">
                    {pg?.allDoctors ??
                      (lang === "ar"
                        ? "جميع أعضاء هيئة التدريس"
                        : "All faculty members")}
                  </option>
                  {doctorOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Reset Filters */}
            {isFiltered ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 gap-1.5 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  {pg?.resetFilters ??
                    (lang === "ar" ? "إعادة ضبط" : "Reset")}
                </span>
              </Button>
            ) : null}
          </div>
        </div>

        <DataTable
          data={filteredLessons}
          columns={columns}
          isSkeleton={showSkeleton}
          searchPlaceholder={`${pg?.searchPlaceholder}`}
          className={dash.dataTableOuter}
          tableCardClassName={dash.dataTableCard}
          tableHeaderClassName={dash.dataTableHeader}
        />
      </div>
    </IndexListPage>
  );
}
