/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";
import { useGetScientificTrackCategoriesQuery } from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
import {
  useGetScientificTrackSubjectsQuery,
  useDeleteScientificTrackSubjectMutation,
  useToggleScientificTrackSubjectStatusMutation,
} from "@/store/scientificTrackSubjects/scientificTrackSubjectsApi";
import { useDeleteScientificTrackSubjectExamMutation } from "@/store/scientificTrackSubjectExams/scientificTrackSubjectExamsApi";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSessionReady } from "@/hooks/useSessionReady";
import { BookOpenText, Edit3, Eye } from "lucide-react";
import { Column, DataTable } from "@/components/datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import ScientificTrackSubjectExamActionsCell from "@/components/singleLearnPathes/exam/ScientificTrackSubjectExamActionsCell";
import type { IScientificTrackSubject } from "@/types/scientificTrackSubject";
import { canDoctorMutateSubjects } from "@/lib/doctorAccess";
import { isDoctorPortal } from "@/lib/portal";

const basePath = "singleLearnPath/subjects";

export default function ScientificTrackSubjects() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const headers = TABLE_HEADERS[lang as "ar" | "en"].scientificTrackSubjects;
  const pg = translate?.pages.scientificTrackSubjects;

  const { data: categories = [] } = useGetScientificTrackCategoriesQuery(
    undefined,
    { skip: !sessionReady || isDoctorPortal() },
  );

  const categoryLabelMap = useMemo(() => {
    const m = new Map<number, string>();
    categories.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const displayCategory = (row: IScientificTrackSubject) => {
    if (row.category?.name) return row.category.name;
    const fromMap = categoryLabelMap.get(row.category_id);
    if (fromMap) return fromMap;
    return row.category_id ? `#${row.category_id}` : "—";
  };

  const { data: subjects = [], isLoading } =
    useGetScientificTrackSubjectsQuery(undefined, { skip: !sessionReady });
  const [deleteSubject] = useDeleteScientificTrackSubjectMutation();
  const [deleteSubjectExam] = useDeleteScientificTrackSubjectExamMutation();
  const [toggleStatus] = useToggleScientificTrackSubjectStatusMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<IScientificTrackSubject>({
      getId: (row) => row.id,
      getStatus: (row) => row.is_active,
      onToggle: async (row) => {
        await toggleStatus(row.id);
      },
    });

  const handleDeleteExam = async (subjectId: number) => {
    try {
      const res = await deleteSubjectExam(subjectId).unwrap();
      toast.success(res?.message);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.message) {
        toast.error(errorData.message);
        return;
      }
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          (messages as string[]).forEach((msg) => toast.error(msg)),
        );
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteSubject(id).unwrap();
      toast.success(res?.message);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          (messages as string[]).forEach((msg) => toast.error(msg)),
        );
        return;
      }
      if (errorData?.message) toast.error(errorData.message);
    }
  };

  const columns: Column<IScientificTrackSubject>[] = [
    {
      key: "name",
      header: headers.name,
      render: (_, row) => (
        <span className="font-medium text-slate-900">{row.name}</span>
      ),
    },
    {
      key: "category_id",
      header: headers.category,
      render: (_, row) => (
        <span className="text-sm text-slate-700">{displayCategory(row)}</span>
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
            disabled={isPending(row) || isDoctorPortal()}
            onCheckedChange={(checked) => {
              if (isDoctorPortal()) return;
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
        <div className="flex flex-col items-center gap-2 min-w-[200px]">
          <div className="flex flex-wrap justify-center gap-2">
            <Link href={`/${lang}/${basePath}/view/${row.id}`}>
              <Button type="button" size="sm" className={dash.tableView}>
                <Eye className="h-5 w-5" />
              </Button>
            </Link>
            {canDoctorMutateSubjects() ? (
              <>
                <Link href={`/${lang}/${basePath}/edit/${row.id}`}>
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
              </>
            ) : null}
          </div>

          <ScientificTrackSubjectExamActionsCell
            subjectId={row.id}
            lang={lang ?? "ar"}
            examUi={pg?.subjectExam}
            onDeleteExam={() => handleDeleteExam(row.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <IndexListPage
      icon={BookOpenText}
      title={pg?.listTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/${basePath}/create`}
      createLabel={pg?.createSubject?.title ?? ""}
      showCreate={canDoctorMutateSubjects()}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={subjects}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={`${pg?.searchPlaceholder ?? ""}`}
        className={dash.dataTableOuter}
        tableCardClassName={dash.dataTableCard}
        tableHeaderClassName={dash.dataTableHeader}
      />
    </IndexListPage>
  );
}
