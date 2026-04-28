/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { Column, DataTable } from "@/components/datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import IndexListPage from "@/components/shared/IndexListPage";
import { useSessionReady } from "@/hooks/useSessionReady";
import {
  useGetContactsQuery,
  useDeleteContactMutation,
  useReplyContactMutation,
} from "@/store/settings/contactsApi";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Eye, MessageSquare, MessageSquareReply, X } from "lucide-react";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Contact = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  message: string;
  type: string;
  type_label: string;
  created_at: string;
  is_reply?: boolean;
  status?: string;
  reply?: string | null;
};

export default function ContactUS() {
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const headers = TABLE_HEADERS[lang as "ar" | "en"].contacts;
  const tc = translate?.settings.contactUs;

  const { data: contacts = [], isLoading } = useGetContactsQuery(undefined, {
    skip: !sessionReady,
  });

  const [deleteContact] = useDeleteContactMutation();
  const [selectedMessage, setSelectedMessage] = useState<{
    message: string;
    reply: string | null;
  } | null>(null);
  const [replyModal, setReplyModal] = useState<{
    id: number;
    message: string;
  } | null>(null);

  const [replyText, setReplyText] = useState("");
  const [replyContact] = useReplyContactMutation();

  const truncate = (text: string, limit = 100) =>
    text.length > limit ? text.slice(0, limit) + " .... " : text;

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteContact(id).unwrap();
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

  const handleReply = async () => {
    if (!replyModal) return;

    try {
      const res = await replyContact({
        id: replyModal.id,
        reply: replyText,
      }).unwrap();

      toast.success(res?.message);
      setReplyModal(null);
      setReplyText("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Error");
    }
  };

  const columns: Column<Contact>[] = [
    {
      key: "name",
      header: headers.name,
    },
    {
      key: "email",
      header: headers.email,
    },
    {
      key: "mobile",
      header: headers.mobile,
    },
    {
      key: "type",
      header: headers.type,
      align: "center",
      render: (_, row) => (
        <span className="inline-flex rounded-lg bg-sky-50 px-2 py-1 text-xs font-medium text-sky-900 ring-1 ring-sky-200/70">
          {lang === "ar" ? row.type_label : row.type}
        </span>
      ),
    },
    {
      key: "message",
      header: headers.message,
      render: (_, row) => (
        <div className="flex max-w-75 items-center gap-2">
          <span className="text-sm text-slate-700">{truncate(row.message)}</span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: headers.date,
    },
    {
      key: "status",
      header: headers.status,
      align: "center",
      render: (_, row) => (
        <p
          className={`inline-flex rounded-lg px-2 py-1.5 text-xs font-semibold ${
            row.is_reply
              ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70"
              : "bg-amber-50 text-amber-950 ring-1 ring-amber-200/70"
          }`}
        >
          {row.is_reply ? tc?.replyed : tc?.notReplyed}
        </p>
      ),
    },
    {
      key: "id",
      header: headers.actions,
      align: "center",
      render: (_, row) => {
        const isReplied =
          row.is_reply === true || row.status === "answered";

        return (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              className={dash.tableView}
              onClick={() =>
                setSelectedMessage({
                  message: row.message,
                  reply: row.reply ?? null,
                })
              }
            >
              <Eye className="h-4 w-4" />
            </Button>

            {!isReplied && (
              <Button
                type="button"
                size="sm"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-4 text-white shadow-sm shadow-sky-900/15 hover:bg-sky-700"
                onClick={() =>
                  setReplyModal({
                    id: row.id,
                    message: row.message,
                  })
                }
              >
                <MessageSquareReply className="h-4 w-4 shrink-0" />
                {tc?.replyBtn}
              </Button>
            )}

            <DeleteConfirmDialog
              title={tc?.deleteTitle}
              description={tc?.deleteMessage}
              confirmText={tc?.deleteBtn}
              cancelText={tc?.cancelBtn}
              onConfirm={() => handleDelete(row.id)}
            />
          </div>
        );
      },
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  return (
    <>
      <IndexListPage
        icon={MessageSquare}
        title={tc?.title ?? ""}
        description={tc?.listDescription}
        createHref="#"
        createLabel=""
        showCreate={false}
        showSkeleton={showSkeleton}
        dir={pageDir}
      >
        <DataTable
          data={contacts}
          columns={columns}
          isSkeleton={showSkeleton}
          searchPlaceholder={tc?.searchPlaceholder}
          className={dash.dataTableOuter}
          tableCardClassName={dash.dataTableCard}
          tableHeaderClassName={dash.dataTableHeader}
        />
      </IndexListPage>

      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent
          className="max-w-lg rounded-2xl border-slate-200 [&>button]:hidden"
          dir={pageDir}
        >
          <DialogHeader className="flex flex-row items-center justify-between gap-4">
            <DialogTitle className="text-lg font-bold text-slate-900">
              {tc?.message}
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </DialogHeader>

          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-800 ring-1 ring-slate-900/5">
            <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
          </div>

          {selectedMessage?.reply ? (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">
                {tc?.replySectionLabel}
              </h3>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm ring-1 ring-emerald-900/5">
                <p className="whitespace-pre-wrap">{selectedMessage.reply}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!replyModal} onOpenChange={() => setReplyModal(null)}>
        <DialogContent
          className="max-w-lg rounded-2xl border-slate-200 [&>button]:hidden"
          dir={pageDir}
        >
          <DialogHeader className="flex flex-row items-center justify-between gap-4">
            <DialogTitle className="text-lg font-bold text-slate-900">
              {tc?.replyDialogTitle}
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </DialogHeader>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700">
            {replyModal?.message}
          </div>

          <Textarea
            className={cn("min-h-[120px] rounded-xl border-slate-200", dash.input)}
            rows={4}
            placeholder={tc?.replyPlaceholder}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />

          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setReplyModal(null)}
            >
              {tc?.cancelBtn}
            </Button>

            <Button
              type="button"
              className="rounded-xl bg-linear-to-r from-emerald-700 to-teal-700 px-6 shadow-lg shadow-emerald-900/20 hover:from-emerald-600 hover:to-teal-600"
              onClick={handleReply}
            >
              {tc?.sendReply}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
