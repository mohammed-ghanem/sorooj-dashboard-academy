/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";

import {
  useGetStudentsQuery,
  useToggleStudentStatusMutation,
  useDeleteStudentMutation,
} from "@/store/students/studentsApi";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSessionReady } from "@/hooks/useSessionReady";

import { Eye, UserCircle } from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";
import type { IStudent } from "@/types/student";

export default function Students() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang as "ar" | "en"].students;
  const pg = translate?.pages.students;

  const { data: students = [], isLoading } = useGetStudentsQuery(undefined, {
    skip: !sessionReady,
  });
  const [toggleStatus] = useToggleStudentStatusMutation();
  const [deleteStudent] = useDeleteStudentMutation();

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

  const enrollmentLabel = (s: IStudent) =>
    s.enrollmentStatusLabel || s.enrollmentStatus || "—";

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
      render: (v) => (
        <span className="truncate max-w-[200px] block">{v}</span>
      ),
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
      key: "enrollmentStatus",
      header: headers.enrollment,
      render: (_, row) => (
        <span className="text-sm text-muted-foreground">
          {enrollmentLabel(row)}
        </span>
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
      <DataTable
        data={students}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={
          pg?.searchPlaceholder ?? "Search…"
        }
        className={dash.dataTableOuter}
        tableCardClassName={dash.dataTableCard}
        tableHeaderClassName={dash.dataTableHeader}
      />
    </IndexListPage>
  );
}
