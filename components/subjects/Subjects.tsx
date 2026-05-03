/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";

import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import {
  useGetSubjectsQuery,
  useDeleteSubjectMutation,
  useToggleSubjectStatusMutation,
} from "@/store/subjects/subjectsApi";
import { useDeleteSubjectExamMutation } from "@/store/subjectExams/subjectExamsApi";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSessionReady } from "@/hooks/useSessionReady";

import { BookOpenText, Edit3, Eye } from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";
import SubjectExamActionsCell from "@/components/subjects/exam/SubjectExamActionsCell";

import type { ISubject } from "@/types/subject";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

export default function Subjects() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang as "ar" | "en"].subjects;
  const pg = translate?.pages.subjects;

  const { data: studyTerms = [] } = useGetStudyTermsQuery(undefined, {
    skip: !sessionReady,
  });

  const studyTermLabelMap = useMemo(() => {
    const m = new Map<number, string>();
    studyTerms.forEach((st) => {
      const loc = parseLocalizedNameFromModel(st);
      const label =
        lang === "ar" ? loc.name_ar || loc.name : loc.name_en || loc.name;
      m.set(st.id, label);
    });
    return m;
  }, [studyTerms, lang]);

  const displayStudyTerm = (row: ISubject) => {
    const nested = row.study_term;
    if (nested) {
      const loc = parseLocalizedNameFromModel(nested);
      return lang === "ar"
        ? loc.name_ar || loc.name || loc.name_en || "—"
        : loc.name_en || loc.name || loc.name_ar || "—";
    }
    const fromMap = studyTermLabelMap.get(row.study_term_id);
    if (fromMap) return fromMap;
    return row.study_term_id ? `#${row.study_term_id}` : "—";
  };

  const { data: subjects = [], isLoading } = useGetSubjectsQuery(undefined, {
    skip: !sessionReady,
  });
  const [deleteSubject] = useDeleteSubjectMutation();
  const [deleteSubjectExam] = useDeleteSubjectExamMutation();
  const [toggleStatus] = useToggleSubjectStatusMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<ISubject>({
      getId: (row) => row.id,
      getStatus: (row) => row.is_active,
      onToggle: async (row) => {
        await toggleStatus(row.id);
      },
    });

  const displayName = (s: ISubject) => {
    const loc = parseLocalizedNameFromModel(s);
    return lang === "ar" ? loc.name_ar || loc.name : loc.name_en || loc.name;
  };

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
          messages.forEach((msg: string) => toast.error(msg)),
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

  const columns: Column<ISubject>[] = [
    {
      key: "name_ar",
      header: headers.name,
      render: (_, s) => (
        <span className="font-medium text-slate-900">{displayName(s)}</span>
      ),
    },
    {
      key: "study_term_id",
      header: headers.studyTerm,
      render: (_, row) => (
        <span className="text-sm text-slate-700">{displayStudyTerm(row)}</span>
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
        <div className="flex flex-col items-center gap-2 min-w-[200px]">
          <div className="flex justify-center gap-2 flex-wrap">
            <Link href={`/${lang}/subjects/view/${row.id}`}>
              <Button
                type="button"
                size="sm"
                className={dash.tableView}
                title={translate?.pages.subjects.viewSubject?.title}
              >
                <Eye className="w-5 h-5" />
              </Button>
            </Link>
            <Link href={`/${lang}/subjects/edit/${row.id}`}>
              <Button
                type="button"
                size="sm"
                className={dash.tableEdit}
                title={translate?.pages.subjects.editSubject?.title}
              >
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

          <SubjectExamActionsCell
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
      createHref={`/${lang}/subjects/create`}
      createLabel={pg?.createSubject?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={subjects}
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
