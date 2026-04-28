/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import LangUseParams from "@/translate/LangUseParams";

import {
  useGetAdminsQuery,
  useDeleteAdminMutation,
  useToggleAdminStatusMutation,
} from "@/store/admins/adminsApi";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useSessionReady } from "@/hooks/useSessionReady";

import { Edit3, ShieldX, UserCog } from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import TranslateHook from "@/translate/TranslateHook";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

type Admin = {
  id: number;
  name: string;
  email: string;
  roles: any;
  is_active: boolean;
};

export default function Admins() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const headers = TABLE_HEADERS[lang as "ar" | "en"].admins;
  const pg = translate?.pages.admins;

  const { data: admins = [], isLoading } = useGetAdminsQuery(undefined, {
    skip: !sessionReady,
  });
  const [deleteAdmin] = useDeleteAdminMutation();
  const [toggleStatus] = useToggleAdminStatusMutation();

  const { getOptimisticStatus, toggle, isPending } =
    useOptimisticToggle<Admin>({
      getId: (admin) => admin.id,
      getStatus: (admin) => admin.is_active,
      onToggle: async (admin) => {
        await toggleStatus(admin.id);
      },
    });

  const isProtectedAdmin = (roles: any) => {
    if (Array.isArray(roles)) {
      return roles.some(
        (r) =>
          r === "admin" ||
          r === "أدمن" ||
          r === "ادمن" ||
          r?.name === "admin" ||
          r?.name === "أدمن" ||
          r?.name === "ادمن",
      );
    }
    return roles === "admin" || roles === "أدمن" || roles === "ادمن";
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteAdmin(id).unwrap();
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

  const columns: Column<Admin>[] = [
    {
      key: "name",
      header: headers.name,
      render: (_, admin) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{admin.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: headers.email,
    },
    {
      key: "roles",
      header: headers.roles,
      render: (roles) =>
        Array.isArray(roles) ? roles.map((r) => r.name ?? r).join(", ") : roles,
    },
    {
      key: "is_active",
      header: headers.status,
      align: "center",
      render: (_, admin) =>
        !isProtectedAdmin(admin.roles) ? (
          <div className="flex items-center justify-center gap-2" dir="ltr">
            <Switch
              className={dash.statusSwitch}
              checked={getOptimisticStatus(admin)}
              disabled={isPending(admin)}
              onCheckedChange={(checked) => {
                toggle(admin, checked).catch(() => {
                  toast.error(
                    lang === "ar"
                      ? "فشل تغيير الحالة"
                      : "Failed to update status",
                  );
                });
              }}
            />

            <span className="text-sm text-slate-600">
              {getOptimisticStatus(admin) ? pg?.active : pg?.inactive}
            </span>
          </div>
        ) : (
          <Badge variant="destructive">
            {pg?.protect}
            <ShieldX />
          </Badge>
        ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, admin) =>
        !isProtectedAdmin(admin.roles) ? (
          <div className="flex justify-center gap-2 flex-wrap">
            <Link href={`/${lang}/admins/edit/${admin.id}`}>
              <Button type="button" size="sm" className={dash.tableEdit}>
                <Edit3 className="h-4 w-4" />
              </Button>
            </Link>

            <DeleteConfirmDialog
              title={pg?.deleteTitle ?? ""}
              description={pg?.deleteMessage ?? ""}
              confirmText={pg?.deleteBtn ?? ""}
              cancelText={pg?.cancelBtn ?? ""}
              onConfirm={() => handleDelete(admin.id)}
            />
          </div>
        ) : (
          <Badge variant="destructive">
            {pg?.protect}
            <ShieldX />
          </Badge>
        ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <IndexListPage
      icon={UserCog}
      title={pg?.adminsTitle ?? ""}
      description={pg?.listDescription}
      createHref={`/${lang}/admins/create`}
      createLabel={pg?.createAdmin?.title ?? ""}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <DataTable
        data={admins}
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
