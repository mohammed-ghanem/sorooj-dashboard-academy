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

import { Edit3, ShieldX } from "lucide-react";
import { Column, DataTable } from "../datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
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

  const headers = TABLE_HEADERS[lang as "ar" | "en"].admins;

  const {
    data: admins = [], isLoading } = useGetAdminsQuery(undefined, { skip: !sessionReady });
  const [deleteAdmin] = useDeleteAdminMutation();
  const [toggleStatus] = useToggleAdminStatusMutation();

  // Optimistic Toggle 
  const { getOptimisticStatus, toggle, isPending } = useOptimisticToggle<Admin>(
    {
      getId: (admin) => admin.id,
      getStatus: (admin) => admin.is_active,

      onToggle: async (admin) => {
        await toggleStatus(admin.id);
        return;
      },
    }
  );


  /* ========================
     Helpers
  ======================== */
  const isProtectedAdmin = (roles: any) => {
    if (Array.isArray(roles)) {
      return roles.some(
        (r) =>
          r === "admin" ||
          r === "أدمن" ||
          r === "ادمن" ||
          r?.name === "admin" ||
          r?.name === "أدمن" ||
          r?.name === "ادمن"
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

  /* ========================
     Columns
  ======================== */
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
              className="data-[state=checked]:bg-green-600"
              checked={getOptimisticStatus(admin)}
              disabled={isPending(admin)}
              onCheckedChange={(checked) => {
                toggle(admin, checked).catch(() => {
                  toast.error("فشل تغيير الحالة");
                });
              }}
            />

            <span className="text-sm">
              {getOptimisticStatus(admin)
                ? translate?.pages.admins.active
                : translate?.pages.admins.inactive}
            </span>
          </div>
        ) : (
          <Badge variant="destructive">
            {translate?.pages.admins.protect}
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
          <div className="flex justify-center gap-2">
            {/* EDIT */}
            <Link href={`/${lang}/admins/edit/${admin.id}`}>
              <Button
                className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 cursor-pointer"
                size="sm"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </Link>

            {/* DELETE */}
            <DeleteConfirmDialog
              title={translate?.pages.admins.deleteTitle}
              description={translate?.pages.admins.deleteMessage}
              confirmText={translate?.pages.admins.deleteBtn }
              cancelText={translate?.pages.admins.cancelBtn}
              onConfirm={() => handleDelete(admin.id)}
            />
          </div>
        ) : (
          <Badge variant="destructive">
            {translate?.pages.admins.protect}
            <ShieldX />
          </Badge>
        ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;
  return (
    <div className="p-6 mx-4 my-10 bg-white rounded-2xl border space-y-6">
      <h2 className={`titleStyle ${showSkeleton ? "block h-11 w-24!" : ""}`}>
        {translate?.pages.admins.adminsTitle || ""}
      </h2>
      <div className="mt-10">
        <Link
          href={`/${lang}/admins/create`}
          className={`createBtn  ${showSkeleton ? "block w-40 h-9 py-2.5 opacity-50" : ""}`}
        >
          {!showSkeleton &&
            `${translate?.pages.admins.createAdmin.title}`}
        </Link>
      </div>

      <DataTable
        data={admins}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={`${translate?.pages.admins.searchPlaceholder}`}
      />
    </div>
  );
}
