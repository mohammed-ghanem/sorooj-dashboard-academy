/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Edit3, Eye } from "lucide-react";
import { toast } from "sonner";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { getHomePageSection } from "@/constants/homePageSections";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import { getHomePageSectionHooks } from "@/store/homePage/homePageApis";
import type { HomePageSectionKey, IHomePageItem } from "@/types/homePageSection";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Column, DataTable } from "@/components/datatable/DataTable";
import IndexListPage from "@/components/shared/IndexListPage";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

type Props = { sectionKey: HomePageSectionKey };

export default function HomePageSectionList({ sectionKey }: Props) {
  const section = getHomePageSection(sectionKey);
  const hooks = getHomePageSectionHooks(sectionKey);
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const headers = TABLE_HEADERS[lang as "ar" | "en"].homePageItems;
  const shared = translate?.pages?.homePageSections;
  const pg = shared?.[section.dictKey];

  const { data: items = [], isLoading } = hooks.useGetItemsQuery(undefined, {
    skip: !sessionReady,
  });
  const [deleteItem] = hooks.useDeleteItemMutation();
  const [toggleStatus] = hooks.useToggleItemStatusMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<IHomePageItem>({
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
      const res = await deleteItem(id).unwrap();
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

  const columns: Column<IHomePageItem>[] = [
    {
      key: "title",
      header: headers.title,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {row.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.icon}
              alt=""
              className="h-9 w-9 rounded-lg object-contain ring-1 ring-slate-200"
            />
          ) : null}
          <span className="font-medium">{row.title}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: headers.description,
      render: (_, row) => (
        <span className="text-sm text-slate-600">
          {truncate(row.description || "—")}
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
            {getOptimisticStatus(row) ? shared?.active : shared?.inactive}
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
          <Link href={`/${lang}/${section.basePath}/view/${row.id}`}>
            <Button type="button" size="sm" className={dash.tableView}>
              <Eye className="h-5 w-5" />
            </Button>
          </Link>
          <Link href={`/${lang}/${section.basePath}/edit/${row.id}`}>
            <Button type="button" size="sm" className={dash.tableEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteConfirmDialog
            title={shared?.deleteTitle ?? ""}
            description={shared?.deleteMessage ?? ""}
            confirmText={shared?.deleteBtn ?? ""}
            cancelText={shared?.cancelBtn ?? ""}
            onConfirm={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;
  const Icon = section.icon;

  return (
    <IndexListPage
      icon={Icon}
      title={pg?.listTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/${section.basePath}/create`}
      createLabel={shared?.createTitle ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={items}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={`${shared?.searchPlaceholder ?? ""}`}
        className={dash.dataTableOuter}
        tableCardClassName={dash.dataTableCard}
        tableHeaderClassName={dash.dataTableHeader}
      />
    </IndexListPage>
  );
}
