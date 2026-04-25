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

import type { ISubject } from "@/types/subject";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

export default function Subjects() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const headers = TABLE_HEADERS[lang as "ar" | "en"].subjects;

  const { data: studyTerms = [] } = useGetStudyTermsQuery(undefined, {
    skip: !sessionReady,
  });

  const studyTermLabelMap = useMemo(() => {
    const m = new Map<number, string>();
    studyTerms.forEach((st) => {
      const loc = parseLocalizedNameFromModel(st);
      const label = lang === "ar" ? loc.name_ar || loc.name : loc.name_en || loc.name;
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
  const [toggleStatus] = useToggleSubjectStatusMutation();

  const { getOptimisticStatus, toggle, isPending } = useOptimisticToggle<ISubject>({
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

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteSubject(id).unwrap();
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

  const columns: Column<ISubject>[] = [
    {
      key: "name_ar",
      header: headers.name,
      render: (_, s) => <span className="font-medium">{displayName(s)}</span>,
    },
    {
      key: "study_term_id",
      header: headers.studyTerm,
      render: (_, row) => <span className="text-sm">{displayStudyTerm(row)}</span>,
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
                  lang === "ar" ? "فشل تغيير الحالة" : "Failed to update status"
                );
              });
            }}
          />
          <span className="text-sm">
            {getOptimisticStatus(row)
              ? translate?.pages.subjects.active
              : translate?.pages.subjects.inactive}
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
          <Link href={`/${lang}/subjects/view/${row.id}`}>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300 cursor-pointer"
              size="sm"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </Link>
          <Link href={`/${lang}/subjects/edit/${row.id}`}>
            <Button
              className="bg-green-600 hover:bg-green-700 focus:ring-2 ease-in-out focus:ring-green-300 cursor-pointer"
              size="sm"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>

          <DeleteConfirmDialog
            title={translate?.pages.subjects.deleteTitle}
            description={translate?.pages.subjects.deleteMessage}
            confirmText={translate?.pages.subjects.deleteBtn}
            cancelText={translate?.pages.subjects.cancelBtn}
            onConfirm={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <div className="p-6 mx-4 my-10 bg-white rounded-2xl border space-y-6">
      <h2 className={`titleStyle ${showSkeleton ? "block h-11 w-32!" : ""}`}>
        {translate?.pages.subjects.listTitle || ""}
      </h2>
      <div className="mt-10">
        <Link
          href={`/${lang}/subjects/create`}
          className={`createBtn ${showSkeleton ? "block w-40 h-9 py-2.5 opacity-50" : ""}`}
        >
          {!showSkeleton && `${translate?.pages.subjects.createSubject.title}`}
        </Link>
      </div>

      <DataTable
        data={subjects}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={`${translate?.pages.subjects.searchPlaceholder}`}
      />
    </div>
  );
}
