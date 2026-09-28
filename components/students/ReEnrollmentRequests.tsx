/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, UserRoundCheck, UserRoundX, X } from "lucide-react";

import {
  useGetStudentsQuery,
  useLazyGetReEnrollmentOptionsQuery,
  useReEnrollStudentMutation,
} from "@/store/students/studentsApi";
import { useGetCohortsQuery } from "@/store/cohorts/cohortsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { Column, DataTable } from "@/components/datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { IStudent } from "@/types/student";
import CarriedOverTerms from "./CarriedOverTerms";

const FAILED_PHASE = "year_failed";

export default function ReEnrollmentRequests() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams() ?? "ar";
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const headers = TABLE_HEADERS[lang as "ar" | "en"].students;
  const pg = translate?.pages.students;
  const t = pg?.reEnrollment;

  const { data: students = [], isLoading } = useGetStudentsQuery(
    { progress_phase: FAILED_PHASE },
    { skip: !sessionReady },
  );

  // Backend filters by phase; guard in case the param is ignored.
  const failedStudents = useMemo(
    () => students.filter((s) => s.progressPhase === FAILED_PHASE),
    [students],
  );
  const eligibleCount = failedStudents.filter((s) => s.can_re_enroll).length;

  const [target, setTarget] = useState<IStudent | null>(null);
  const [selectedCohort, setSelectedCohort] = useState("");

  const [
    fetchOptions,
    { data: optionsData, isFetching: loadingOptions, isError: optionsError },
  ] = useLazyGetReEnrollmentOptionsQuery();
  const [reEnroll, { isLoading: reEnrolling }] = useReEnrollStudentMutation();

  const { data: cohorts = [] } = useGetCohortsQuery(undefined, {
    skip: !sessionReady,
  });

  const cohortNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of cohorts) {
      const loc = parseLocalizedNameFromModel(c);
      const name =
        lang === "ar"
          ? loc.name_ar || loc.name || loc.name_en
          : loc.name_en || loc.name || loc.name_ar;
      if (name) map.set(c.id, name);
    }
    return map;
  }, [cohorts, lang]);

  const options = (optionsData?.options ?? []).map((opt) => ({
    ...opt,
    label: opt.label || cohortNames.get(opt.id) || `#${opt.id}`,
  }));

  const openDialog = async (student: IStudent) => {
    setTarget(student);
    setSelectedCohort("");
    try {
      const res = await fetchOptions(student.id).unwrap();
      if (res.options.length === 1) {
        setSelectedCohort(String(res.options[0].id));
      }
    } catch {
      toast.error(t?.optionsFailed ?? "تعذر تحميل الدفعات المتاحة");
    }
  };

  const closeDialog = () => {
    setTarget(null);
    setSelectedCohort("");
  };

  const handleConfirm = async () => {
    if (!target) return;
    if (!selectedCohort) {
      toast.error(t?.cohortRequired ?? "يرجى اختيار الدفعة");
      return;
    }
    try {
      const res = await reEnroll({
        id: target.id,
        cohort_id: Number(selectedCohort),
      }).unwrap();
      toast.success(res?.message);
      closeDialog();
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors && Object.keys(errorData.errors).length > 0) {
        Object.values(errorData.errors).forEach((messages: any) =>
          (Array.isArray(messages) ? messages : [messages]).forEach(
            (msg: string) => toast.error(String(msg)),
          ),
        );
        return;
      }
      toast.error(errorData?.message ?? t?.failed ?? "فشل إعادة قيد الطالب");
    }
  };

  const columns: Column<IStudent>[] = [
    {
      key: "name",
      header: headers.name,
      render: (_, row) => (
        <div className="min-w-40">
          <p className="font-medium text-slate-800">{row.name}</p>
          <p className="text-xs text-slate-500" dir="ltr">
            {row.email}
          </p>
        </div>
      ),
    },
    {
      key: "mobile",
      header: headers.mobile,
      render: (v) => <span dir="ltr">{v || "—"}</span>,
    },
    {
      key: "country",
      header: headers.country,
      render: (_, row) => <span>{row.country?.name ?? "—"}</span>,
    },
    {
      key: "cohort",
      header: t?.academicPath ?? "المسار الدراسي",
      render: (_, row) => (
        <div className="min-w-32">
          <p className="font-medium text-slate-800">
            {row.cohort?.name ?? "—"}
          </p>
          <p className="text-xs text-slate-500">
            {[row.academic_year?.sequenceLabel, row.study_term?.name]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      ),
    },
    {
      key: "makeup_exam_period",
      header: t?.makeupPeriod ?? "فترة الملحق",
      render: (_, row) =>
        row.makeup_exam_period ? (
          <span className="whitespace-nowrap text-xs text-slate-600" dir="ltr">
            {row.makeup_exam_period.start_date ?? "—"} →{" "}
            {row.makeup_exam_period.end_date ?? "—"}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "carried_over_study_terms",
      header: t?.carriedOver ?? "المحاور المرحّلة",
      render: (_, row) => (
        <CarriedOverTerms
          terms={row.carried_over_study_terms}
          emptyLabel={t?.noCarriedOver ?? "لا يوجد"}
          className="min-w-28"
        />
      ),
    },
    {
      key: "progressPhase",
      header: headers.phase,
      align: "center",
      render: (_, row) => (
        <span className="inline-flex whitespace-nowrap rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-800 ring-1 ring-rose-200">
          {row.progressPhaseLabel || row.progressPhase}
        </span>
      ),
    },
    {
      key: "can_re_enroll",
      header: t?.canReEnroll ?? "قابلية إعادة القيد",
      align: "center",
      render: (_, row) => (
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
            row.can_re_enroll
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
              : "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
          )}
        >
          {row.can_re_enroll
            ? (t?.eligible ?? "متاح")
            : (t?.notEligible ?? "غير متاح")}
        </span>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, row) => (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
            disabled={!row.can_re_enroll}
            onClick={() => openDialog(row)}
          >
            <UserRoundCheck className="size-4" />
            {t?.reEnrollBtn ?? "إعادة القيد"}
          </Button>
          <Link href={`/${lang}/students/view/${row.id}`}>
            <Button type="button" size="sm" className={dash.tableView}>
              <Eye className="size-5" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <IndexListPage
      icon={UserRoundX}
      title={t?.listTitle ?? "طلبات إعادة القيد للراسبين"}
      description={t?.listDescription}
      createHref=""
      createLabel=""
      showCreate={false}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      {!showSkeleton ? (
        <div className="mb-4 flex flex-wrap gap-2 px-2">
          <span className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-800 ring-1 ring-rose-200">
            {t?.total ?? "إجمالي الراسبين"}
            <span className="rounded-md bg-rose-100 px-1.5 tabular-nums">
              {failedStudents.length}
            </span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
            {t?.eligibleCount ?? "متاح لإعادة القيد"}
            <span className="rounded-md bg-emerald-100 px-1.5 tabular-nums">
              {eligibleCount}
            </span>
          </span>
        </div>
      ) : null}

      <DataTable
        data={failedStudents}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={t?.searchPlaceholder ?? "Search…"}
        className={dash.dataTableOuter}
        tableCardClassName={dash.dataTableCard}
        tableHeaderClassName={dash.dataTableHeader}
      />

      <Dialog open={!!target} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent
          className="max-w-lg gap-5 rounded-2xl border-slate-200 sm:max-w-md [&>button]:hidden"
          dir={pageDir}
        >
          <DialogHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <DialogTitle className="text-lg font-bold text-slate-900">
              {t?.dialogTitle ?? "إعادة قيد الطالب"}
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="size-5" />
              </button>
            </DialogClose>
          </DialogHeader>

          {target ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{target.name}</p>
                <p className="mt-1 text-slate-600">
                  {[
                    target.cohort?.name,
                    target.academic_year?.sequenceLabel,
                    target.study_term?.name,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {target.carried_over_study_terms.length > 0 ? (
                  <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-3">
                    <p className="text-xs font-medium text-slate-500">
                      {t?.carriedOver ?? "المحاور المرحّلة"}
                    </p>
                    <CarriedOverTerms terms={target.carried_over_study_terms} />
                  </div>
                ) : null}
              </div>

              {loadingOptions ? (
                <p className="text-sm text-slate-500">
                  {t?.loadingOptions ?? "جاري تحميل الدفعات المتاحة..."}
                </p>
              ) : optionsError ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
                  {t?.optionsFailed ?? "تعذر تحميل الدفعات المتاحة"}
                </p>
              ) : options.length === 0 ? (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200">
                  {optionsData?.message ||
                    (t?.noOptions ?? "لا توجد دفعة متاحة لإعادة القيد حاليًا.")}
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    {t?.dialogHint ?? "اختر الدفعة التي سيتم إعادة قيد الطالب بها."}
                  </p>
                  <div className="space-y-2">
                    {options.map((opt) => {
                      const active = selectedCohort === String(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedCohort(String(opt.id))}
                          className={cn(
                            "w-full rounded-xl border px-4 py-3 text-start transition",
                            active
                              ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100"
                              : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40",
                          )}
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {opt.label}
                          </p>
                          {opt.description ? (
                            <p className="mt-0.5 text-xs text-slate-500">
                              <bdi dir="ltr">{opt.description}</bdi>
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl px-5"
                  onClick={closeDialog}
                >
                  {t?.cancelBtn ?? "إلغاء"}
                </Button>
                <Button
                  type="button"
                  className="rounded-xl bg-emerald-600 px-5 hover:bg-emerald-700"
                  disabled={
                    reEnrolling || loadingOptions || options.length === 0
                  }
                  onClick={handleConfirm}
                >
                  {reEnrolling
                    ? (t?.processing ?? "جارٍ إعادة القيد...")
                    : (t?.confirmBtn ?? "تأكيد إعادة القيد")}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </IndexListPage>
  );
}
