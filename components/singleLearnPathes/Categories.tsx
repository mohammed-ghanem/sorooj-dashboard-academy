/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";
import {
  useGetScientificTrackCategoriesQuery,
  useDeleteScientificTrackCategoryMutation,
  useToggleScientificTrackCategoryStatusMutation,
} from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSessionReady } from "@/hooks/useSessionReady";
import { Edit3, Eye, FolderTree } from "lucide-react";
import { Column, DataTable } from "@/components/datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import type { IScientificTrackCategory } from "@/types/scientificTrackCategory";

const basePath = "singleLearnPath/categories";

export default function Categories() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const headers = TABLE_HEADERS[lang as "ar" | "en"].scientificTrackCategories;
  const pg = translate?.pages.scientificTrackCategories;

  const { data: categories = [], isLoading } =
    useGetScientificTrackCategoriesQuery(undefined, { skip: !sessionReady });
  const [deleteCategory] = useDeleteScientificTrackCategoryMutation();
  const [toggleStatus] = useToggleScientificTrackCategoryStatusMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<IScientificTrackCategory>({
      getId: (row) => row.id,
      getStatus: (row) => row.is_active,
      onToggle: async (row) => {
        await toggleStatus(row.id);
      },
    });

  const truncate = (text: string, limit = 80) =>
    text.length > limit ? `${text.slice(0, limit)} .... ` : text;

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteCategory(id).unwrap();
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

  const columns: Column<IScientificTrackCategory>[] = [
    {
      key: "name",
      header: headers.name,
      render: (_, row) => (
        <span className="font-medium">{row.name}</span>
      ),
    },
    {
      key: "about_category",
      header: headers.about,
      render: (_, row) => (
        <span className="text-sm text-slate-600">
          {truncate(row.about_category || "—")}
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
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/${lang}/${basePath}/view/${row.id}`}>
            <Button type="button" size="sm" className={dash.tableView}>
              <Eye className="h-5 w-5" />
            </Button>
          </Link>
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
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <IndexListPage
      icon={FolderTree}
      title={pg?.listTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/${basePath}/create`}
      createLabel={pg?.createCategory?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={categories}
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
