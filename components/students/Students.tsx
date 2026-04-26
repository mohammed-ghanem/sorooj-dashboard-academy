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

import { Eye } from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";
import type { IStudent } from "@/types/student";

export default function Students() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const headers = TABLE_HEADERS[lang as "ar" | "en"].students;

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
      render: (v) => <span className="truncate max-w-[200px] block">{v}</span>,
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
            className="data-[state=checked]:bg-green-600"
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
          <span className="text-sm">
            {getOptimisticStatus(row)
              ? translate?.pages.students.active
              : translate?.pages.students.inactive}
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
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 focus:ring-2
               focus:ring-yellow-300 cursor-pointer"
              size="sm"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </Link>
          <DeleteConfirmDialog
            title={translate?.pages.students.deleteTitle}
            description={translate?.pages.students.deleteMessage}
            confirmText={translate?.pages.students.deleteBtn}
            cancelText={translate?.pages.students.cancelBtn}
            onConfirm={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <div className="p-6 mx-4 my-10 bg-white rounded-2xl border space-y-6">
      <h2 className={`titleStyle ${showSkeleton ? "block h-11 w-48!" : ""}`}>
        {translate?.pages.students.listTitle || ""}
      </h2>

      <DataTable
        data={students}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={
          translate?.pages.students.searchPlaceholder ?? "Search…"
        }
      />
    </div>
  );
}
