/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";

import {
  useGetLessonsQuery,
  useDeleteLessonMutation,
  useToggleLessonStatusMutation,
} from "@/store/lessons/lessonsApi";
import { useDeleteLessonExamMutation } from "@/store/lessonExams/lessonExamsApi";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSessionReady } from "@/hooks/useSessionReady";

import { Edit3, Eye, Film } from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";
import LessonExamActionsCell from "@/components/lessons/exam/LessonExamActionsCell";

import type { ILesson } from "@/types/lesson";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

export default function Lessons() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang as "ar" | "en"].lessons;
  const pg = translate?.pages.lessons;

  const { data: lessons = [], isLoading } = useGetLessonsQuery(undefined, {
    skip: !sessionReady,
  });
  const [deleteLesson] = useDeleteLessonMutation();
  const [deleteLessonExam] = useDeleteLessonExamMutation();
  const [toggleStatus] = useToggleLessonStatusMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<ILesson>({
      getId: (row) => row.id,
      getStatus: (row) => row.is_active,
      onToggle: async (row) => {
        await toggleStatus(row.id);
      },
    });

  const displaySubject = (lesson: ILesson) => {
    const nested = lesson.subject;
    if (nested) {
      const loc = parseLocalizedNameFromModel(nested);
      return lang === "ar"
        ? loc.name_ar || loc.name || loc.name_en || "—"
        : loc.name_en || loc.name || loc.name_ar || "—";
    }
    return lesson.subject_id ? `#${lesson.subject_id}` : "—";
  };

  const displayDoctor = (lesson: ILesson) => {
    const n = lesson.doctor?.name?.trim();
    if (n) return n;
    return lesson.doctor_id ? `#${lesson.doctor_id}` : "—";
  };

  const handleDeleteExam = async (lessonId: number) => {
    try {
      const res = await deleteLessonExam(lessonId).unwrap();
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
      const res = await deleteLesson(id).unwrap();
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

  const columns: Column<ILesson>[] = [
    {
      key: "lesson_number",
      header: headers.lessonNumber,
      render: (_, row) => (
        <span className="text-sm font-semibold text-slate-800">
          {row.lesson_number || "—"}
        </span>
      ),
    },
    {
      key: "title",
      header: headers.title,
      render: (_, row) => (
        <span className="font-medium text-slate-900 line-clamp-2 max-w-[240px] md:max-w-xs">
          {row.title || "—"}
        </span>
      ),
    },
    {
      key: "subject_id",
      header: headers.subject,
      render: (_, row) => (
        <span className="text-sm text-slate-700">{displaySubject(row)}</span>
      ),
    },
    {
      key: "doctor_id",
      header: headers.doctor,
      render: (_, row) => (
        <span className="text-sm text-slate-700">{displayDoctor(row)}</span>
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
            <Link href={`/${lang}/lessons/view/${row.id}`}>
              <Button
                type="button"
                size="sm"
                className={dash.tableView}
                title={translate?.pages.lessons.viewLesson?.title}
              >
                <Eye className="w-5 h-5" />
              </Button>
            </Link>
            <Link href={`/${lang}/lessons/edit/${row.id}`}>
              <Button
                type="button"
                size="sm"
                className={dash.tableEdit}
                title={translate?.pages.lessons.editLesson?.title}
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

          <LessonExamActionsCell
            lessonId={row.id}
            lang={lang ?? "ar"}
            examUi={pg?.lessonExam}
            onDeleteExam={() => handleDeleteExam(row.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <IndexListPage
      icon={Film}
      title={pg?.listTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/lessons/create`}
      createLabel={pg?.createLesson?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={lessons}
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
