/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";

import { useGetAcademicYearsQuery } from "@/store/academicYears/academicYearsApi";
import {
  useGetStudyTermsQuery,
  useDeleteStudyTermMutation,
  useToggleStudyTermStatusMutation,
} from "@/store/studyTerms/studyTermsApi";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSessionReady } from "@/hooks/useSessionReady";

import { Edit3, Eye, Layers } from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

import type { IStudyTerm } from "@/types/studyTerm";
import type { IAcademicYear } from "@/types/academicYear";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

export default function StudyTerms() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang as "ar" | "en"].studyTerms;
  const pg = translate?.pages.studyTerms;

  const { data: academicYears = [] } = useGetAcademicYearsQuery(undefined, {
    skip: !sessionReady,
  });

  const academicYearLabelMap = useMemo(() => {
    const m = new Map<number, string>();
    academicYears.forEach((y: IAcademicYear) => {
      const label =
        lang === "ar" ? y.name_ar || y.name : y.name_en || y.name;
      m.set(y.id, label);
    });
    return m;
  }, [academicYears, lang]);

  const displayAcademicYear = (row: IStudyTerm) => {
    const nested = row.academic_year;
    if (nested) {
      const loc = parseLocalizedNameFromModel(nested);
      return lang === "ar"
        ? loc.name_ar || loc.name || loc.name_en || "—"
        : loc.name_en || loc.name || loc.name_ar || "—";
    }
    const fromMap = academicYearLabelMap.get(row.academic_year_id);
    if (fromMap) return fromMap;
    return row.academic_year_id ? `#${row.academic_year_id}` : "—";
  };

  const { data: studyTerms = [], isLoading } = useGetStudyTermsQuery(
    undefined,
    { skip: !sessionReady },
  );
  const [deleteStudyTerm] = useDeleteStudyTermMutation();
  const [toggleStatus] = useToggleStudyTermStatusMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<IStudyTerm>({
      getId: (row) => row.id,
      getStatus: (row) => row.is_active,
      onToggle: async (row) => {
        await toggleStatus(row.id);
      },
    });

  const displayName = (c: IStudyTerm) => {
    const loc = parseLocalizedNameFromModel(c);
    return lang === "ar" ? loc.name_ar || loc.name : loc.name_en || loc.name;
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteStudyTerm(id).unwrap();
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

  const columns: Column<IStudyTerm>[] = [
    {
      key: "name_ar",
      header: headers.name,
      render: (_, c) => (
        <span className="font-medium">{displayName(c)}</span>
      ),
    },
    {
      key: "academic_year_id",
      header: headers.academicYear,
      render: (_, row) => (
        <span className="text-sm">{displayAcademicYear(row)}</span>
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
          <Link href={`/${lang}/study-terms/view/${row.id}`}>
            <Button type="button" size="sm" className={dash.tableView}>
              <Eye className="w-5 h-5" />
            </Button>
          </Link>
          <Link href={`/${lang}/study-terms/edit/${row.id}`}>
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
      icon={Layers}
      title={pg?.listTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/study-terms/create`}
      createLabel={pg?.createStudyTerm?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={studyTerms}
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
