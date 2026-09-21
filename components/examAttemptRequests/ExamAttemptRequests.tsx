/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Column, DataTable } from "@/components/datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import { useSessionReady } from "@/hooks/useSessionReady";
import {
  useGetExamAttemptRequestsQuery,
  useReviewExamAttemptRequestMutation,
} from "@/store/examAttemptRequests/examAttemptRequestsApi";
import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import { useGetSubjectsQuery } from "@/store/subjects/subjectsApi";
import { useGetLessonsQuery } from "@/store/lessons/lessonsApi";
import type { IExamAttemptRequest } from "@/types/examAttemptRequest";
import type { ILesson } from "@/types/lesson";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Eye, RefreshCw, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type ReviewMode = "approve" | "reject" | null;

type HierarchyIds = {
  studyTermId?: number;
  subjectId?: number;
  lessonId?: number;
};

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }
  if (s === "approved") {
    return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
  }
  if (s === "rejected") {
    return "bg-rose-50 text-rose-800 ring-1 ring-rose-200";
  }
  return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
}

function examableTypeLabel(
  type: string,
  labels?: {
    subject?: string;
    lesson?: string;
    lessonVideo?: string;
    other?: string;
  },
  translated?: string,
) {
  if (translated?.trim()) return translated.trim();
  const t = type.toLowerCase();
  if (t.includes("subject")) return labels?.subject ?? type;
  if (t.includes("video")) return labels?.lessonVideo ?? type;
  if (t.includes("lesson")) return labels?.lesson ?? type;
  return labels?.other ?? type;
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\u0600-\u06FFa-z0-9\s]/gi, "")
    .replace(/\s+/g, " ");
}

function collectNames(...values: unknown[]): string[] {
  const out = new Set<string>();
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      const loc = parseLocalizedNameFromModel(value);
      [loc.name, loc.name_ar, loc.name_en, (value as any)?.title].forEach(
        (n) => {
          const key = normalizeText(n);
          if (key) out.add(key);
        },
      );
      continue;
    }
    const key = normalizeText(value);
    if (key) out.add(key);
  }
  return [...out];
}

function localizedLabel(item: any, lang: string) {
  const loc = parseLocalizedNameFromModel(item);
  return lang === "ar"
    ? loc.name_ar || loc.name || loc.name_en || item?.name || item?.title || ""
    : loc.name_en || loc.name || loc.name_ar || item?.name || item?.title || "";
}

function mergeHierarchy(
  base: HierarchyIds,
  next: HierarchyIds,
): HierarchyIds {
  return {
    studyTermId: base.studyTermId ?? next.studyTermId,
    subjectId: base.subjectId ?? next.subjectId,
    lessonId: base.lessonId ?? next.lessonId,
  };
}

export default function ExamAttemptRequests() {
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const lang = LangUseParams() ?? "ar";
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const headers = TABLE_HEADERS[lang as "ar" | "en"].examAttemptRequests;
  const t = translate?.examAttemptRequests;

  const { data: requests = [], isLoading } = useGetExamAttemptRequestsQuery(
    undefined,
    { skip: !sessionReady },
  );
  const { data: studyTerms = [] } = useGetStudyTermsQuery(undefined, {
    skip: !sessionReady,
  });
  const { data: subjects = [] } = useGetSubjectsQuery(undefined, {
    skip: !sessionReady,
  });
  const { data: academicLessons = [] } = useGetLessonsQuery(
    { type: "study_term" },
    { skip: !sessionReady },
  );
  const { data: trackLessons = [] } = useGetLessonsQuery(
    { type: "category" },
    { skip: !sessionReady },
  );

  const lessons = useMemo(() => {
    const map = new Map<number, ILesson>();
    [...academicLessons, ...trackLessons].forEach((l) => {
      if (l?.id) map.set(l.id, l);
    });
    return Array.from(map.values());
  }, [academicLessons, trackLessons]);

  const [reviewRequest, { isLoading: reviewing }] =
    useReviewExamAttemptRequestMutation();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [selectedStudyTermId, setSelectedStudyTermId] = useState("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedLessonId, setSelectedLessonId] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [detailsItem, setDetailsItem] = useState<IExamAttemptRequest | null>(
    null,
  );
  const [reviewItem, setReviewItem] = useState<IExamAttemptRequest | null>(
    null,
  );
  const [reviewMode, setReviewMode] = useState<ReviewMode>(null);
  const [extraAttempts, setExtraAttempts] = useState("1");
  const [rejectReason, setRejectReason] = useState("");

  const subjectToTermMap = useMemo(() => {
    const map = new Map<number, number>();
    subjects.forEach((s: any) => {
      const termId = Number(s?.study_term_id ?? s?.study_term?.id ?? 0);
      if (s?.id && termId) map.set(Number(s.id), termId);
    });
    lessons.forEach((l) => {
      const embedded = Number(l.subject?.study_term_id ?? 0);
      if (l.subject_id && embedded && !map.has(l.subject_id)) {
        map.set(l.subject_id, embedded);
      }
    });
    return map;
  }, [subjects, lessons]);

  const lessonToSubjectMap = useMemo(() => {
    const map = new Map<number, number>();
    lessons.forEach((l) => {
      if (l.id && l.subject_id) map.set(l.id, l.subject_id);
    });
    return map;
  }, [lessons]);

  const videoToLessonMap = useMemo(() => {
    const map = new Map<number, number>();
    lessons.forEach((l) => {
      (l.videos ?? []).forEach((v) => {
        if (v?.id && l.id) map.set(Number(v.id), l.id);
      });
    });
    return map;
  }, [lessons]);

  const labelIndexes = useMemo(() => {
    const studyTermByLabel = new Map<string, number>();
    const subjectByLabel = new Map<string, number>();
    const lessonByLabel = new Map<string, number>();
    const videoByLabel = new Map<string, number>();

    studyTerms.forEach((st: any) => {
      collectNames(st).forEach((key) => {
        if (!studyTermByLabel.has(key)) studyTermByLabel.set(key, Number(st.id));
      });
    });

    subjects.forEach((s: any) => {
      collectNames(s).forEach((key) => {
        if (!subjectByLabel.has(key)) subjectByLabel.set(key, Number(s.id));
      });
    });

    lessons.forEach((l) => {
      collectNames(l, l.title).forEach((key) => {
        if (!lessonByLabel.has(key)) lessonByLabel.set(key, l.id);
      });
      (l.videos ?? []).forEach((v) => {
        collectNames(v, v.title).forEach((key) => {
          if (!videoByLabel.has(key)) videoByLabel.set(key, l.id);
        });
      });
    });

    return { studyTermByLabel, subjectByLabel, lessonByLabel, videoByLabel };
  }, [studyTerms, subjects, lessons]);

  const resolveHierarchy = useMemo(() => {
    return (item: IExamAttemptRequest): HierarchyIds => {
      let result: HierarchyIds = {};

      const fromApi: HierarchyIds = {
        studyTermId: item.exam?.study_term_id || undefined,
        subjectId: item.exam?.subject_id || undefined,
        lessonId: item.exam?.lesson_id || undefined,
      };
      result = mergeHierarchy(result, fromApi);

      const type = String(item.exam?.examable_type ?? "").toLowerCase();
      const examableId = Number(item.exam?.examable_id ?? 0);

      if (examableId) {
        const fromMorph: HierarchyIds = {};
        if (type.includes("video")) {
          const lessonId = videoToLessonMap.get(examableId);
          if (lessonId) {
            fromMorph.lessonId = lessonId;
            fromMorph.subjectId = lessonToSubjectMap.get(lessonId);
            if (fromMorph.subjectId) {
              fromMorph.studyTermId = subjectToTermMap.get(fromMorph.subjectId);
            }
          }
        } else if (type.includes("lesson")) {
          fromMorph.lessonId = examableId;
          fromMorph.subjectId = lessonToSubjectMap.get(examableId);
          if (fromMorph.subjectId) {
            fromMorph.studyTermId = subjectToTermMap.get(fromMorph.subjectId);
          }
        } else if (type.includes("subject")) {
          fromMorph.subjectId = examableId;
          fromMorph.studyTermId = subjectToTermMap.get(examableId);
        }
        result = mergeHierarchy(result, fromMorph);
      }

      // Fill missing parents from maps
      if (result.lessonId && !result.subjectId) {
        result.subjectId = lessonToSubjectMap.get(result.lessonId);
      }
      if (result.subjectId && !result.studyTermId) {
        result.studyTermId = subjectToTermMap.get(result.subjectId);
      }

      // Label fallback (examable_label → term / subject / lesson / video)
      if (!result.studyTermId || !result.subjectId || !result.lessonId) {
        const labelKey = normalizeText(item.exam?.examable_label);
        if (labelKey) {
          const fromLabel: HierarchyIds = {};
          if (!result.lessonId) {
            fromLabel.lessonId =
              labelIndexes.lessonByLabel.get(labelKey) ??
              labelIndexes.videoByLabel.get(labelKey);
          }
          if (!result.subjectId) {
            fromLabel.subjectId = labelIndexes.subjectByLabel.get(labelKey);
          }
          if (!result.studyTermId) {
            fromLabel.studyTermId = labelIndexes.studyTermByLabel.get(labelKey);
          }

          if (fromLabel.lessonId && !fromLabel.subjectId) {
            fromLabel.subjectId = lessonToSubjectMap.get(fromLabel.lessonId);
          }
          if (fromLabel.subjectId && !fromLabel.studyTermId) {
            fromLabel.studyTermId = subjectToTermMap.get(fromLabel.subjectId);
          }

          result = mergeHierarchy(result, fromLabel);
        }
      }

      return result;
    };
  }, [
    videoToLessonMap,
    lessonToSubjectMap,
    subjectToTermMap,
    labelIndexes,
  ]);

  const requestHierarchy = useMemo(() => {
    const map = new Map<number, HierarchyIds>();
    requests.forEach((item) => {
      map.set(item.id, resolveHierarchy(item));
    });
    return map;
  }, [requests, resolveHierarchy]);

  // Drop stuck hierarchy selections that resolve to nothing
  useEffect(() => {
    if (isLoading) return;

    if (
      selectedStudyTermId !== "all" &&
      ![...requestHierarchy.values()].some(
        (h) => h.studyTermId === Number(selectedStudyTermId),
      )
    ) {
      setSelectedStudyTermId("all");
    }
    if (
      selectedSubjectId !== "all" &&
      ![...requestHierarchy.values()].some(
        (h) => h.subjectId === Number(selectedSubjectId),
      )
    ) {
      setSelectedSubjectId("all");
    }
    if (
      selectedLessonId !== "all" &&
      ![...requestHierarchy.values()].some(
        (h) => h.lessonId === Number(selectedLessonId),
      )
    ) {
      setSelectedLessonId("all");
    }
  }, [
    isLoading,
    requestHierarchy,
    selectedStudyTermId,
    selectedSubjectId,
    selectedLessonId,
  ]);

  const statusCounts = useMemo(() => {
    const counts = {
      all: requests.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    for (const item of requests) {
      const s = String(item.status).toLowerCase();
      if (s === "pending") counts.pending += 1;
      else if (s === "approved") counts.approved += 1;
      else if (s === "rejected") counts.rejected += 1;
    }
    return counts;
  }, [requests]);

  const typeOptions = useMemo(() => {
    const map = new Map<string, { type: string; label: string; count: number }>();
    for (const item of requests) {
      const type = item.exam?.examable_type?.trim();
      if (!type) continue;
      const existing = map.get(type);
      if (existing) {
        existing.count += 1;
        continue;
      }
      map.set(type, {
        type,
        label: examableTypeLabel(
          type,
          t?.examableTypes,
          item.exam?.trans_examable_type,
        ),
        count: 1,
      });
    }
    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label, lang === "ar" ? "ar" : "en"),
    );
  }, [requests, t?.examableTypes, lang]);

  const studyTermOptions = useMemo(() => {
    const counts = new Map<number, number>();
    requests.forEach((item) => {
      const hid = requestHierarchy.get(item.id);
      if (hid?.studyTermId) {
        counts.set(hid.studyTermId, (counts.get(hid.studyTermId) ?? 0) + 1);
      }
    });

    return studyTerms
      .map((st: any) => ({
        id: String(st.id),
        label: localizedLabel(st, lang) || `#${st.id}`,
        count: counts.get(Number(st.id)) ?? 0,
      }))
      .filter((opt) => opt.count > 0)
      .sort((a, b) =>
        a.label.localeCompare(b.label, lang === "ar" ? "ar" : "en", {
          numeric: true,
        }),
      );
  }, [studyTerms, requests, requestHierarchy, lang]);

  const subjectOptions = useMemo(() => {
    const counts = new Map<number, number>();
    requests.forEach((item) => {
      const hid = requestHierarchy.get(item.id);
      if (hid?.subjectId) {
        counts.set(hid.subjectId, (counts.get(hid.subjectId) ?? 0) + 1);
      }
    });

    let list = subjects
      .map((s: any) => ({
        id: Number(s.id),
        label: localizedLabel(s, lang) || `#${s.id}`,
        parentId:
          Number(s?.study_term_id ?? s?.study_term?.id ?? 0) || undefined,
        count: counts.get(Number(s.id)) ?? 0,
      }))
      .filter((s) => s.count > 0);

    if (selectedStudyTermId !== "all") {
      const target = Number(selectedStudyTermId);
      list = list.filter((s) => s.parentId === target);
    }

    return list.sort((a, b) =>
      a.label.localeCompare(b.label, lang === "ar" ? "ar" : "en", {
        numeric: true,
      }),
    );
  }, [subjects, requests, requestHierarchy, selectedStudyTermId, lang]);

  const lessonOptions = useMemo(() => {
    const counts = new Map<number, number>();
    requests.forEach((item) => {
      const hid = requestHierarchy.get(item.id);
      if (hid?.lessonId) {
        counts.set(hid.lessonId, (counts.get(hid.lessonId) ?? 0) + 1);
      }
    });

    let list = lessons
      .map((l) => ({
        id: l.id,
        label: l.title || `#${l.id}`,
        subjectId: l.subject_id,
        studyTermId: subjectToTermMap.get(l.subject_id),
        count: counts.get(l.id) ?? 0,
      }))
      .filter((l) => l.count > 0);

    if (selectedSubjectId !== "all") {
      const sid = Number(selectedSubjectId);
      list = list.filter((l) => l.subjectId === sid);
    } else if (selectedStudyTermId !== "all") {
      const tid = Number(selectedStudyTermId);
      list = list.filter((l) => l.studyTermId === tid);
    }

    return list.sort((a, b) =>
      a.label.localeCompare(b.label, lang === "ar" ? "ar" : "en", {
        numeric: true,
      }),
    );
  }, [
    lessons,
    requests,
    requestHierarchy,
    selectedSubjectId,
    selectedStudyTermId,
    subjectToTermMap,
    lang,
  ]);

  const handleStudyTermChange = (val: string) => {
    setSelectedStudyTermId(val);
    if (val === "all") return;

    const targetTerm = Number(val);
    if (selectedSubjectId !== "all") {
      const subjectTerm = subjectToTermMap.get(Number(selectedSubjectId));
      if (subjectTerm !== targetTerm) {
        setSelectedSubjectId("all");
        setSelectedLessonId("all");
        return;
      }
    }
    if (selectedLessonId !== "all") {
      const lesson = lessons.find((l) => String(l.id) === selectedLessonId);
      const termId = lesson
        ? subjectToTermMap.get(lesson.subject_id)
        : undefined;
      if (termId !== targetTerm) setSelectedLessonId("all");
    }
  };

  const handleSubjectChange = (val: string) => {
    setSelectedSubjectId(val);
    if (val !== "all" && selectedLessonId !== "all") {
      const lesson = lessons.find((l) => String(l.id) === selectedLessonId);
      if (lesson && lesson.subject_id !== Number(val)) {
        setSelectedLessonId("all");
      }
    }
  };

  const isFiltered =
    selectedStudyTermId !== "all" ||
    selectedSubjectId !== "all" ||
    selectedLessonId !== "all" ||
    typeFilter !== "all";

  const handleResetFilters = () => {
    setSelectedStudyTermId("all");
    setSelectedSubjectId("all");
    setSelectedLessonId("all");
    setTypeFilter("all");
  };

  const filtered = useMemo(() => {
    return requests.filter((item) => {
      const status = String(item.status).toLowerCase();
      if (statusFilter !== "all" && status !== statusFilter) return false;

      if (typeFilter !== "all" && item.exam?.examable_type !== typeFilter) {
        return false;
      }

      const hid = requestHierarchy.get(item.id) ?? {};

      if (
        selectedStudyTermId !== "all" &&
        hid.studyTermId !== Number(selectedStudyTermId)
      ) {
        return false;
      }
      if (
        selectedSubjectId !== "all" &&
        hid.subjectId !== Number(selectedSubjectId)
      ) {
        return false;
      }
      if (
        selectedLessonId !== "all" &&
        hid.lessonId !== Number(selectedLessonId)
      ) {
        return false;
      }

      return true;
    });
  }, [
    requests,
    statusFilter,
    typeFilter,
    selectedStudyTermId,
    selectedSubjectId,
    selectedLessonId,
    requestHierarchy,
  ]);

  const openApprove = (item: IExamAttemptRequest) => {
    setReviewItem(item);
    setReviewMode("approve");
    setExtraAttempts("1");
    setRejectReason("");
  };

  const openReject = (item: IExamAttemptRequest) => {
    setReviewItem(item);
    setReviewMode("reject");
    setRejectReason("");
    setExtraAttempts("1");
  };

  const closeReview = () => {
    setReviewItem(null);
    setReviewMode(null);
    setExtraAttempts("1");
    setRejectReason("");
  };

  const handleReview = async () => {
    if (!reviewItem || !reviewMode) return;

    try {
      if (reviewMode === "approve") {
        const attempts = Number(extraAttempts);
        if (!Number.isFinite(attempts) || attempts < 1) {
          toast.error(t?.extraAttemptsRequired ?? "أدخل عدد محاولات صالح");
          return;
        }
        const res = await reviewRequest({
          id: reviewItem.id,
          status: "approved",
          extra_attempts: attempts,
        }).unwrap();
        toast.success(res?.message ?? t?.approveSuccess);
      } else {
        const reason = rejectReason.trim();
        if (!reason) {
          toast.error(t?.reasonRequired ?? "سبب الرفض مطلوب");
          return;
        }
        const res = await reviewRequest({
          id: reviewItem.id,
          status: "rejected",
          reason,
        }).unwrap();
        toast.success(res?.message ?? t?.rejectSuccess);
      }
      closeReview();
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          (Array.isArray(messages) ? messages : [messages]).forEach(
            (msg: string) => toast.error(String(msg)),
          ),
        );
        return;
      }
      toast.error(errorData?.message ?? t?.reviewError);
    }
  };

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    {
      key: "pending",
      label: t?.statusPending ?? "قيد المراجعة",
      count: statusCounts.pending,
    },
    {
      key: "approved",
      label: t?.statusApproved ?? "مقبول",
      count: statusCounts.approved,
    },
    {
      key: "rejected",
      label: t?.statusRejected ?? "مرفوض",
      count: statusCounts.rejected,
    },
    {
      key: "all",
      label: t?.statusAll ?? "الكل",
      count: statusCounts.all,
    },
  ];

  const columns: Column<IExamAttemptRequest>[] = [
    {
      key: "student",
      header: headers.student,
      render: (_, row) => (
        <div className="min-w-40">
          <p className="font-medium text-slate-800">
            {row.student?.name || "—"}
          </p>
          <p className="text-xs text-slate-500" dir="ltr">
            {row.student?.email || ""}
          </p>
        </div>
      ),
    },
    {
      key: "exam",
      header: headers.exam,
      render: (_, row) => (
        <div className="min-w-44">
          <p className="font-medium text-slate-800">{row.exam?.title || "—"}</p>
          <p className="text-xs text-slate-500">
            {row.exam?.examable_label || "—"}
            {row.exam?.examable_type
              ? ` · ${examableTypeLabel(
                  row.exam.examable_type,
                  t?.examableTypes,
                  row.exam.trans_examable_type,
                )}`
              : ""}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: headers.attempts,
      render: (_, row) => (
        <span className="tabular-nums text-slate-700">
          {row.exam?.attempts_used ?? 0}/{row.exam?.effective_max_attempts ?? 0}
        </span>
      ),
    },
    {
      key: "trans_status",
      header: headers.status,
      render: (_, row) => (
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusBadgeClass(row.status),
          )}
        >
          {row.trans_status || row.status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: headers.createdAt,
      render: (_, row) => (
        <span className="whitespace-nowrap text-sm text-slate-600">
          {row.created_at || "—"}
        </span>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      render: (_, row) => {
        const isPending = String(row.status).toLowerCase() === "pending";
        return (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              onClick={() => setDetailsItem(row)}
            >
              <Eye className="size-3.5" />
              {t?.view ?? "عرض"}
            </Button>
            {isPending ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => openApprove(row)}
                >
                  <Check className="size-3.5" />
                  {t?.approve ?? "قبول"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-8 gap-1"
                  onClick={() => openReject(row)}
                >
                  <X className="size-3.5" />
                  {t?.reject ?? "رفض"}
                </Button>
              </>
            ) : null}
          </div>
        );
      },
    },
  ];

  const showSkeleton = !sessionReady || isLoading;
  const selectClass =
    "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:text-sm";

  return (
    <IndexListPage
      icon={RefreshCw}
      title={t?.title ?? "طلبات إعادة محاولات الاختبار"}
      description={
        t?.listDescription ??
        "مراجعة طلبات الطلاب لإعادة محاولة الاختبار وقبولها أو رفضها."
      }
      createHref="#"
      createLabel=""
      showCreate={false}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-50/80 p-1.5 ring-1 ring-slate-200/80">
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
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
            {studyTermOptions.length > 0 ? (
              <div className="relative flex min-w-44 flex-1 sm:flex-initial">
                <select
                  value={selectedStudyTermId}
                  onChange={(e) => handleStudyTermChange(e.target.value)}
                  className={selectClass}
                  title={t?.filterByStudyTerm ?? "المحور الدراسي"}
                >
                  <option value="all">
                    {t?.allStudyTerms ?? "جميع المحاور الدراسية"}
                  </option>
                  {studyTermOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {subjectOptions.length > 0 ? (
              <div className="relative flex min-w-44 flex-1 sm:flex-initial">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className={selectClass}
                  title={t?.filterBySubject ?? "المادة الدراسية"}
                >
                  <option value="all">
                    {t?.allSubjects ?? "جميع المواد الدراسية"}
                  </option>
                  {subjectOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {lessonOptions.length > 0 ? (
              <div className="relative flex min-w-44 flex-1 sm:flex-initial">
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className={selectClass}
                  title={t?.filterByLesson ?? "الدرس"}
                >
                  <option value="all">{t?.allLessons ?? "جميع الدروس"}</option>
                  {lessonOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {typeOptions.length > 0 ? (
              <div className="relative flex min-w-40 flex-1 sm:flex-initial">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={selectClass}
                  title={t?.filterByType ?? "نوع الاختبار"}
                >
                  <option value="all">{t?.allTypes ?? "كل الأنواع"}</option>
                  {typeOptions.map((opt) => (
                    <option key={opt.type} value={opt.type}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {isFiltered ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 gap-1.5 rounded-xl"
                onClick={handleResetFilters}
              >
                <RotateCcw className="size-3.5" />
                {t?.resetFilters ?? "إعادة ضبط الفلاتر"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isSkeleton={showSkeleton}
        className={dash.dataTableOuter}
      />

      <Dialog
        open={!!detailsItem}
        onOpenChange={(open) => !open && setDetailsItem(null)}
      >
        <DialogContent
          className="max-h-[85vh] overflow-y-auto sm:max-w-lg"
          dir={pageDir}
        >
          <DialogHeader>
            <DialogTitle>{t?.detailsTitle ?? "تفاصيل الطلب"}</DialogTitle>
          </DialogHeader>
          {detailsItem ? (
            <div className="space-y-3 text-sm text-slate-700">
              <DetailRow
                label={t?.student ?? "الطالب"}
                value={`${detailsItem.student?.name ?? "—"} (${detailsItem.student?.email ?? ""})`}
              />
              <DetailRow
                label={t?.exam ?? "الاختبار"}
                value={detailsItem.exam?.title ?? "—"}
              />
              <DetailRow
                label={t?.axis ?? "المحور / المادة"}
                value={detailsItem.exam?.examable_label ?? "—"}
              />
              <DetailRow
                label={t?.examType ?? "نوع الاختبار"}
                value={examableTypeLabel(
                  detailsItem.exam?.examable_type ?? "",
                  t?.examableTypes,
                  detailsItem.exam?.trans_examable_type,
                )}
              />
              <DetailRow
                label={t?.attempts ?? "المحاولات"}
                value={`${detailsItem.exam?.attempts_used ?? 0} / ${detailsItem.exam?.effective_max_attempts ?? 0}`}
              />
              <DetailRow
                label={t?.status ?? "الحالة"}
                value={detailsItem.trans_status || detailsItem.status}
              />
              <DetailRow
                label={t?.createdAt ?? "تاريخ الطلب"}
                value={detailsItem.created_at || "—"}
              />
              {detailsItem.extra_attempts != null ? (
                <DetailRow
                  label={t?.extraAttempts ?? "محاولات إضافية"}
                  value={String(detailsItem.extra_attempts)}
                />
              ) : null}
              {detailsItem.rejection_reason ? (
                <DetailRow
                  label={t?.rejectionReason ?? "سبب الرفض"}
                  value={detailsItem.rejection_reason}
                />
              ) : null}
              {detailsItem.reviewer ? (
                <DetailRow
                  label={t?.reviewer ?? "المراجع"}
                  value={detailsItem.reviewer.name}
                />
              ) : null}
              {detailsItem.reviewed_at ? (
                <DetailRow
                  label={t?.reviewedAt ?? "تاريخ المراجعة"}
                  value={detailsItem.reviewed_at}
                />
              ) : null}
            </div>
          ) : null}
          <div className="mt-4 flex justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t?.close ?? "إغلاق"}
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!reviewItem && !!reviewMode}
        onOpenChange={(open) => !open && closeReview()}
      >
        <DialogContent
          className="max-w-lg gap-5 rounded-2xl border-slate-200 sm:max-w-md [&>button]:hidden"
          dir={pageDir}
        >
          <DialogHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <DialogTitle className="text-lg font-bold text-slate-900">
              {reviewMode === "approve"
                ? (t?.approveTitle ?? "قبول الطلب")
                : (t?.rejectTitle ?? "رفض الطلب")}
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                onClick={closeReview}
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </DialogHeader>

          {reviewItem ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">
                  {reviewItem.student?.name}
                </p>
                <p className="mt-1 text-slate-600">{reviewItem.exam?.title}</p>
              </div>

              {reviewMode === "approve" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {t?.extraAttempts ?? "عدد المحاولات الإضافية"}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={extraAttempts}
                    onChange={(e) => setExtraAttempts(e.target.value)}
                    className={cn(
                      "h-11 rounded-xl border-slate-200 bg-white shadow-sm",
                      "focus-visible:border-slate-200 focus-visible:ring-0",
                    )}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {t?.rejectionReason ?? "سبب الرفض"}
                  </label>
                  <Textarea
                    rows={5}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t?.reasonPlaceholder ?? "اكتب سبب الرفض..."}
                    className={cn(
                      "min-h-30 rounded-xl border-slate-200 bg-white px-3 py-3 shadow-sm",
                      "focus-visible:border-slate-200 focus-visible:ring-0",
                    )}
                  />
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl px-5"
                  onClick={closeReview}
                >
                  {t?.cancel ?? "إلغاء"}
                </Button>
                <Button
                  type="button"
                  disabled={reviewing}
                  className={cn(
                    "rounded-xl px-5",
                    reviewMode === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : undefined,
                  )}
                  variant={reviewMode === "reject" ? "destructive" : "default"}
                  onClick={handleReview}
                >
                  {reviewing
                    ? (t?.processing ?? "جارٍ الحفظ...")
                    : reviewMode === "approve"
                      ? (t?.confirmApprove ?? "تأكيد القبول")
                      : (t?.confirmReject ?? "تأكيد الرفض")}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </IndexListPage>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-slate-800">{value || "—"}</span>
    </div>
  );
}
