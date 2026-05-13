/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import LangUseParams from "@/translate/LangUseParams";

import {
  cohortsApi,
  useGetCohortsQuery,
  useDeleteCohortMutation,
  useToggleCohortStatusMutation,
} from "@/store/cohorts/cohortsApi";
import { store, type RootState } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSessionReady } from "@/hooks/useSessionReady";

import { Edit3, Eye, UsersRound } from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";
import {
  formatGregorianDateUi,
  formatHijriFromGregorianUi,
} from "@/utils/dateFormat";

import type { ICohort, ICohortDateRange } from "@/types/cohort";

function academicRangesScore(ranges: ICohortDateRange[] | undefined): number {
  return (ranges ?? []).filter(
    (r) =>
      String(r?.start_date ?? "").trim() || String(r?.end_date ?? "").trim(),
  ).length;
}

/** Index payloads often omit nested ranges; reuse cached GET /cohorts/:id when available. */
function mergeCohortWithCachedDetail(state: RootState, row: ICohort): ICohort {
  if (academicRangesScore(row.academic_years) > 0) return row;
  const detail = cohortsApi.endpoints.getCohortById.select(row.id)(state).data;
  if (!detail || academicRangesScore(detail.academic_years) === 0) return row;
  const merged: ICohort = {
    ...row,
    academic_years: detail.academic_years,
  };
  if (
    academicRangesScore(row.makeup_exam_periods) === 0 &&
    academicRangesScore(detail.makeup_exam_periods) > 0
  ) {
    merged.makeup_exam_periods = detail.makeup_exam_periods;
  }
  return merged;
}

function cohortRowListEqual(a: ICohort[], b: ICohort[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Avoid N+1 when many cohorts exist; index usually stays small. */
const PREFETCH_COHORT_DETAIL_MAX = 40;

export default function Cohorts() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang as "ar" | "en"].cohorts;
  const pg = translate?.pages.cohorts;

  const dispatch = useAppDispatch();
  const { isLoading } = useGetCohortsQuery(undefined, {
    skip: !sessionReady,
  });

  /** Raw list from index (before merge); signature changes when rows change. */
  const listSignature = useSelector((state: RootState) => {
    const list =
      cohortsApi.endpoints.getCohorts.select(undefined)(state).data ?? [];
    return list.map((c) => c.id).join(",");
  });

  /**
   * True while GET /cohorts/:id is still needed for nested ranges omitted from the index.
   */
  const isEnrichingCohortRows = useSelector((state: RootState) => {
    const list =
      cohortsApi.endpoints.getCohorts.select(undefined)(state).data ?? [];
    if (list.length === 0) return false;
    if (list.length > PREFETCH_COHORT_DETAIL_MAX) return false;

    return list.some((c) => {
      const needsAcademic = academicRangesScore(c.academic_years) === 0;
      const needsMakeup = academicRangesScore(c.makeup_exam_periods) === 0;
      if (!needsAcademic && !needsMakeup) return false;
      const q = cohortsApi.endpoints.getCohortById.select(c.id)(state);
      return q.status === "uninitialized" || q.status === "pending";
    });
  });

  const cohorts = useSelector((state: RootState) => {
    const list =
      cohortsApi.endpoints.getCohorts.select(undefined)(state).data ?? [];
    return list.map((row) => mergeCohortWithCachedDetail(state, row));
  }, cohortRowListEqual);

  useEffect(() => {
    if (!sessionReady || isLoading) return;
    const list =
      cohortsApi.endpoints.getCohorts.select(undefined)(store.getState())
        .data ?? [];
    if (list.length > PREFETCH_COHORT_DETAIL_MAX) return;
    list.forEach((c) => {
      if (
        academicRangesScore(c.academic_years) === 0 ||
        academicRangesScore(c.makeup_exam_periods) === 0
      ) {
        dispatch(cohortsApi.endpoints.getCohortById.initiate(c.id));
      }
    });
  }, [sessionReady, isLoading, dispatch, listSignature]);
  const [deleteCohort] = useDeleteCohortMutation();
  const [toggleStatus] = useToggleCohortStatusMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<ICohort>({
      getId: (row) => row.id,
      getStatus: (row) => row.is_active,
      onToggle: async (row) => {
        await toggleStatus(row.id);
      },
    });

  const displayName = (c: ICohort) =>
    lang === "ar" ? c.name_ar || c.name : c.name_en || c.name;

  const locale = lang === "ar" ? "ar" : "en";
  const cc = translate?.pages.cohorts.createCohort;

  const renderDateRangeBlock = (
    range: ICohortDateRange | undefined,
    title: string,
  ) => {
    const start = range?.start_date?.trim();
    const end = range?.end_date?.trim();
    if (!start && !end) {
      return <div className="text-muted-foreground text-xs py-0.5">—</div>;
    }
    return (
      <div className="flex items-center">
        <div className="text-xs font-semibold text-slate-800 ml-3">{title}</div>
        <div className="flex justify-between items-center">
          {start ? (
            <div>
              <div className="text-[11px] font-medium text-slate-600">
                {cc?.periodStartDate}
              </div>
              <div>
                <div className="text-sm leading-tight">
                  {formatGregorianDateUi(start, locale)}
                </div>
                <div className="text-xs text-muted-foreground leading-tight">
                  {formatHijriFromGregorianUi(start, locale)}
                </div>
              </div>
            </div>
          ) : null}
          {end ? (
            <div className="ms-3">
              <div className="text-[11px] font-medium text-slate-600 pt-0.5">
                {cc?.periodEndDate}
              </div>
              <div className="text-sm leading-tight">
                {formatGregorianDateUi(end, locale)}
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                {formatHijriFromGregorianUi(end, locale)}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteCohort(id).unwrap();
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

  const columns: Column<ICohort>[] = [
    {
      key: "name_ar",
      header: headers.name,
      render: (_, c) => (
        <span className="font-medium bg-white text-slate-900 rounded px-0.5">
          {displayName(c)}
        </span>
      ),
    },
    {
      key: "academic_years",
      header: headers.academicYears,
      render: (_, row) => {
        const years = row.academic_years ?? [];
        const hasAny = years.some(
          (r) =>
            String(r?.start_date ?? "").trim() ||
            String(r?.end_date ?? "").trim(),
        );
        if (!hasAny) {
          return <div className="text-muted-foreground text-sm">—</div>;
        }
        const y1 = years[0];
        const y2 = years[1];
        return (
          <div className="leading-5 text-sm min-w-40 max-w-[20rem]">
            <div className="pt-3 mb-3">
              {renderDateRangeBlock(y1, headers.academicYearFirst)}
            </div>
            <div className="border-t border-slate-100 pt-3">
              {renderDateRangeBlock(y2, headers.academicYearSecond)}
            </div>
          </div>
        );
      },
    },
    {
      key: "makeup_exam_periods",
      header: headers.secondRoundExams,
      render: (_, row) => {
        const periods = row.makeup_exam_periods ?? [];
        const hasAny = periods.some(
          (r) =>
            String(r?.start_date ?? "").trim() ||
            String(r?.end_date ?? "").trim(),
        );
        if (!hasAny) {
          return <div className="text-muted-foreground text-sm">—</div>;
        }
        const p1 = periods[0];
        const p2 = periods[1];
        return (
          <div className="leading-5 text-sm min-w-40 max-w-[20rem]">
            <div className="pt-3 mb-3">
              {renderDateRangeBlock(p1, headers.academicYearFirst)}
            </div>
            <div className="border-t border-slate-100 pt-3">
              {renderDateRangeBlock(p2, headers.academicYearSecond)}
            </div>
          </div>
        );
      },
    },
    {
      key: "enrollment_start_date",
      header: headers.enrollmentPeriod,
      render: (_, row) => (
        <div className="leading-5 text-sm space-y-2">
          <div>
            <div>
              {formatGregorianDateUi(row.enrollment_start_date, locale) || "—"}
            </div>
            <div className="text-muted-foreground text-xs">
              {formatHijriFromGregorianUi(row.enrollment_start_date, locale)}
            </div>
          </div>
          <div>
            <div>
              {formatGregorianDateUi(row.enrollment_end_date, locale) || "—"}
            </div>
            <div className="text-muted-foreground text-xs">
              {formatHijriFromGregorianUi(row.enrollment_end_date, locale)}
            </div>
          </div>
        </div>
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
          <Link href={`/${lang}/cohorts/view/${row.id}`}>
            <Button type="button" size="sm" className={dash.tableView}>
              <Eye className="w-5 h-5" />
            </Button>
          </Link>
          <Link href={`/${lang}/cohorts/edit/${row.id}`}>
            <Button type="button" size="sm" className={dash.tableEdit}>
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
      ),
    },
  ];

  const showSkeleton =
    !sessionReady || isLoading || isEnrichingCohortRows;

  return (
    <IndexListPage
      icon={UsersRound}
      title={pg?.cohortsTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/cohorts/create`}
      createLabel={pg?.createCohort?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={cohorts}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={`${pg?.searchPlaceholder}`}
        className={dash.dataTableOuter}
        tableCardClassName={dash.dataTableCard}
        tableHeaderClassName={dash.dataTableHeader}
      />
    </IndexListPage>
  );
}
