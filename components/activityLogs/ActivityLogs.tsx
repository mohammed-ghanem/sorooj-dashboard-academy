"use client";

import Link from "next/link";
import { History, Eye } from "lucide-react";

import { Column, DataTable } from "@/components/datatable/DataTable";
import IndexListPage from "@/components/shared/IndexListPage";
import { Button } from "@/components/ui/button";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetActivityLogsQuery } from "@/store/activityLogs/activityLogsApi";
import type { IActivityLog } from "@/types/activityLogs";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";

export default function ActivityLogs() {
  const lang = (LangUseParams() as "ar" | "en") || "ar";
  const translate = TranslateHook();
  const sessionReady = useSessionReady();
  const headers = TABLE_HEADERS[lang]?.activityLogs ?? TABLE_HEADERS.ar.activityLogs;
  const pg = translate?.pages?.activityLogs;

  const { data: logs = [], isLoading, isFetching } = useGetActivityLogsQuery(
    undefined,
    { skip: !sessionReady },
  );

  const columns: Column<IActivityLog>[] = [
    {
      key: "description",
      header: headers.description,
      render: (_, row) => (
        <span className="text-sm font-medium text-slate-800">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "module",
      header: headers.module,
      align: "center",
      render: (_, row) => (
        <span className="inline-flex rounded-lg bg-sky-50 px-2 py-1 text-xs font-medium text-sky-900 ring-1 ring-sky-200/70">
          {row.module || row.subject?.type_name || "—"}
        </span>
      ),
    },
    {
      key: "action",
      header: headers.action,
      align: "center",
      render: (_, row) => (
        <span className="inline-flex rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-950 ring-1 ring-amber-200/70">
          {row.action || row.event || "—"}
        </span>
      ),
    },
    {
      key: "causer",
      header: headers.causer,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-800">
            {row.causer?.name || "—"}
          </p>
          {row.causer?.email ? (
            <p className="truncate text-xs text-slate-500">{row.causer.email}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "subject",
      header: headers.subject,
      render: (_, row) => (
        <span className="text-sm text-slate-700">
          {row.subject?.label || row.subject?.type_name || "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: headers.date,
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, row) => (
        <div className="flex justify-center">
          <Link href={`/${lang}/activity-logs/view/${row.id}`}>
            <Button type="button" size="sm" className={dash.tableView}>
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading || isFetching;

  return (
    <IndexListPage
      icon={History}
      title={pg?.title ?? ""}
      description={pg?.listDescription}
      createHref="#"
      createLabel=""
      showCreate={false}
      showSkeleton={showSkeleton}
    >
      <DataTable
        data={logs}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={pg?.searchPlaceholder}
        className={dash.dataTableOuter}
        tableCardClassName={dash.dataTableCard}
        tableHeaderClassName={dash.dataTableHeader}
      />
    </IndexListPage>
  );
}
