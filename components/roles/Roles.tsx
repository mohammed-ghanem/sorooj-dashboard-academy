/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";

import {
  useGetRolesQuery,
  useToggleRoleStatusMutation,
  useDeleteRoleMutation,
} from "@/store/roles/rolesApi";

import { Column, DataTable } from "../datatable/DataTable";
import { toast } from "sonner";
import { Edit3, Eye, ShieldCheck } from "lucide-react";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

type Role = {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
};

export default function RolesPage() {
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const sessionReady = useSessionReady();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang].roles;
  const pg = translate?.pages.roles;

  const {
    data: rolesData = [],
    isLoading,
    isFetching,
  } = useGetRolesQuery(undefined, {
    skip: !sessionReady,
    refetchOnMountOrArgChange: false,
  });

  const roles: Role[] = rolesData.map((role: any) => ({
    ...role,
    is_active: Boolean(role.is_active),
  }));

  const [toggleStatus] = useToggleRoleStatusMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<Role>({
      getId: (role) => role.id,
      getStatus: (role) => role.is_active,
      onToggle: async (role, next) => {
        await toggleStatus({
          id: role.id,
          is_active: next,
        }).unwrap();
      },
    });

  const handleDelete = async (id: number) => {
    try {
      const res = (await deleteRole(id).unwrap()) as any;
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

  const columns: Column<Role>[] = [
    {
      key: `${lang === "ar" ? "name_ar" : "name_en"}`,
      header: headers.name,
    },
    {
      key: "is_active",
      header: headers.status,
      align: "center",
      render: (_, role) => (
        <div className="flex items-center justify-center gap-2" dir="ltr">
          <Switch
            className={dash.statusSwitch}
            checked={getOptimisticStatus(role)}
            disabled={isPending(role)}
            onCheckedChange={(checked) => {
              toggle(role, checked).catch(() => {
                toast.error(
                  lang === "ar"
                    ? "فشل تغيير الحالة"
                    : "Failed to update status",
                );
              });
            }}
          />

          <span className="text-sm text-slate-600">
            {getOptimisticStatus(role)
              ? pg?.active || ""
              : pg?.inactive || ""}
          </span>
        </div>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, role) => (
        <div className="flex justify-center gap-2 flex-wrap">
          <Link href={`/${lang}/roles/view/${role.id}`}>
            <Button type="button" size="sm" className={dash.tableView}>
              <Eye className="w-5 h-5" />
            </Button>
          </Link>
          <Link href={`/${lang}/roles/edit/${role.id}`}>
            <Button type="button" size="sm" className={dash.tableEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteConfirmDialog
            title={pg?.deleteTitle ?? ""}
            description={pg?.deleteMessage ?? ""}
            confirmText={pg?.deleteBtn ?? ""}
            cancelText={pg?.cancelBtn ?? ""}
            onConfirm={() => handleDelete(role.id)}
          />
        </div>
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading || isFetching;

  return (
    <IndexListPage
      icon={ShieldCheck}
      title={pg?.rolesTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/roles/create`}
      createLabel={pg?.createRole?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={roles}
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
