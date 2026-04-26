/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { Edit3, Eye } from "lucide-react";
import { toast } from "sonner";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import {
  useDeleteDoctorMutation,
  useGetDoctorsQuery,
  useToggleDoctorStatusMutation,
} from "@/store/doctors/doctorsApi";
import type { IDoctor } from "@/types/doctor";
import { TABLE_HEADERS } from "@/constants/tableHeaders";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Column, DataTable } from "../datatable/DataTable";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

const AVATAR_SIZE = 40;

function DoctorNameWithAvatar({ row }: { row: IDoctor }) {
  const name = row.name || "—";
  const src = row.avatar?.trim();

  if (src) {
    return (
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src={src}
          alt=""
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          className="rounded-full object-cover shrink-0 border border-border"
          unoptimized
        />
        <span className="font-medium truncate">{name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="shrink-0 flex items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground"
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      >
        {row.name?.charAt(0)?.toUpperCase() || "—"}
      </div>
      <span className="font-medium truncate">{name}</span>
    </div>
  );
}

export default function Doctors() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const headers = TABLE_HEADERS[lang as "ar" | "en"].doctors;

  const { data: doctors = [], isLoading } = useGetDoctorsQuery(undefined, {
    skip: !sessionReady,
  });

  const [deleteDoctor] = useDeleteDoctorMutation();
  const [toggleStatus] = useToggleDoctorStatusMutation();

  const { getOptimisticStatus, toggle, isPending } = useOptimisticToggle<IDoctor>({
    getId: (row) => row.id,
    getStatus: (row) => row.is_active,
    onToggle: async (row) => {
      await toggleStatus(row.id);
    },
  });

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteDoctor(id).unwrap();
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
      }
    }
  };

  const columns: Column<IDoctor>[] = [
    {
      key: "name",
      header: headers.name,
      render: (_, row) => <DoctorNameWithAvatar row={row} />,
    },
    {
      key: "email",
      header: headers.email,
      render: (_, row) => <span className="break-all">{row.email || "—"}</span>,
    },
    {
      key: "mobile",
      header: headers.mobile,
      render: (_, row) => row.mobile || "—",
    },
    {
      key: "specialization",
      header: headers.specialization,
      render: (_, row) => (
        <span className="truncate max-w-[220px] block">{row.specialization || "—"}</span>
      ),
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
              ? translate?.pages.doctors.active
              : translate?.pages.doctors.inactive}
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
          <Link href={`/${lang}/doctors/view/${row.id}`}>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300 cursor-pointer"
              size="sm"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </Link>
          <Link href={`/${lang}/doctors/edit/${row.id}`}>
            <Button
              className="bg-green-600 hover:bg-green-700 focus:ring-2 ease-in-out focus:ring-green-300 cursor-pointer"
              size="sm"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteConfirmDialog
            title={translate?.pages.doctors.deleteTitle}
            description={translate?.pages.doctors.deleteMessage}
            confirmText={translate?.pages.doctors.deleteBtn}
            cancelText={translate?.pages.doctors.cancelBtn}
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
        {translate?.pages.doctors.listTitle || ""}
      </h2>
      <div className="mt-10">
        <Link
          href={`/${lang}/doctors/create`}
          className={`createBtn ${showSkeleton ? "block w-40 h-9 py-2.5 opacity-50" : ""}`}
        >
          {!showSkeleton && `${translate?.pages.doctors.createDoctor.title}`}
        </Link>
      </div>

      <DataTable
        data={doctors}
        columns={columns}
        isSkeleton={showSkeleton}
        searchPlaceholder={`${translate?.pages.doctors.searchPlaceholder}`}
      />
    </div>
  );
}
