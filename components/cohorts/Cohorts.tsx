/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";

import {
  useGetCohortsQuery,
  useDeleteCohortMutation,
  useToggleCohortStatusMutation,
} from "@/store/cohorts/cohortsApi";

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
import { formatGregorianDateAr, formatHijriDateAr } from "@/utils/dateFormat";

import type { ICohort } from "@/types/cohort";

export default function Cohorts() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang as "ar" | "en"].cohorts;
  const pg = translate?.pages.cohorts;

  const { data: cohorts = [], isLoading } = useGetCohortsQuery(undefined, {
    skip: !sessionReady,
  });
  const [deleteCohort] = useDeleteCohortMutation();
  const [toggleStatus] = useToggleCohortStatusMutation();

  const { getOptimisticStatus, toggle, isPending } = useOptimisticToggle<ICohort>(
    {
      getId: (row) => row.id,
      getStatus: (row) => row.is_active,
      onToggle: async (row) => {
        await toggleStatus(row.id);
      },
    },
  );

  const displayName = (c: ICohort) =>
    lang === "ar" ? c.name_ar || c.name : c.name_en || c.name;

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
        <span className="font-medium">{displayName(c)}</span>
      ),
    },
    {
      key: "start_date",
      header: headers.startDate,
      render: (_, row) => (
        <div className="leading-5">
          <div>{formatGregorianDateAr(row.start_date)}</div>
          <div className="text-sm text-muted-foreground">
            {formatHijriDateAr(row.start_date_hijri)}
          </div>
        </div>
      ),
    },
    {
      key: "end_date",
      header: headers.endDate,
      render: (_, row) => (
        <div className="leading-5">
          <div>{formatGregorianDateAr(row.end_date)}</div>
          <div className="text-sm text-muted-foreground">
            {formatHijriDateAr(row.end_date_hijri)}
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

  const showSkeleton = !sessionReady || isLoading;

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
