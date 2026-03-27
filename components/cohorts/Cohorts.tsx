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

import { Edit3, Eye } from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

import type { ICohort } from "@/types/cohort";

export default function Cohorts() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const headers = TABLE_HEADERS[lang as "ar" | "en"].cohorts;

  const {
    data: cohorts = [],
    isLoading,
  } = useGetCohortsQuery(undefined, { skip: !sessionReady });
  const [deleteCohort] = useDeleteCohortMutation();
  const [toggleStatus] = useToggleCohortStatusMutation();

  const { getOptimisticStatus, toggle, isPending } = useOptimisticToggle<ICohort>(
    {
      getId: (row) => row.id,
      getStatus: (row) => row.is_active,
      onToggle: async (row) => {
        await toggleStatus(row.id);
      },
    }
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
          messages.forEach((msg: string) => toast.error(msg))
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
    },
    {
      key: "end_date",
      header: headers.endDate,
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
                    : "Failed to update status"
                );
              });
            }}
          />
          <span className="text-sm">
            {getOptimisticStatus(row)
              ? translate?.pages.cohorts.active
              : translate?.pages.cohorts.inactive}
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
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 focus:ring-2
               focus:ring-yellow-300 cursor-pointer"
              size="sm"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </Link>
          <Link href={`/${lang}/cohorts/edit/${row.id}`}>
            <Button
              className="bg-green-600 hover:bg-green-700 focus:ring-2 ease-in-out
                 focus:ring-green-300 cursor-pointer"
              size="sm"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>

          <DeleteConfirmDialog
            title={translate?.pages.cohorts.deleteTitle}
            description={translate?.pages.cohorts.deleteMessage}
            confirmText={translate?.pages.cohorts.deleteBtn}
            cancelText={translate?.pages.cohorts.cancelBtn}
            onConfirm={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <div className="p-6 mx-4 my-10 bg-white rounded-2xl border space-y-6">
      <h2 className={`titleStyle ${showSkeleton ? "block h-11 w-24!" : ""}`}>
        {translate?.pages.cohorts.cohortsTitle || ""}
      </h2>
      <div className="mt-10">
        <Link
          href={`/${lang}/cohorts/create`}
          className={`createBtn  ${showSkeleton ? "block w-40 h-9 py-2.5 opacity-50" : ""}`}
        >
          {!showSkeleton &&
            `${translate?.pages.cohorts.createCohort.title}`}
        </Link>
      </div>

      <DataTable
        data={cohorts}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={`${translate?.pages.cohorts.searchPlaceholder}`}
      />
    </div>
  );
}
