/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { Column, DataTable } from "@/components/datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetContactsQuery, useDeleteContactMutation, useReplyContactMutation } from "@/store/settings/contactsApi";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, X } from "lucide-react";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";

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
    const headers = TABLE_HEADERS[lang as "ar" | "en"].contacts;

    const { data: contacts = [], isLoading } = useGetContactsQuery(undefined, {
        skip: !sessionReady,
    });

    const [deleteContact] = useDeleteContactMutation();
    const [selectedMessage, setSelectedMessage] = useState<{ message: string; reply: string | null } | null>(null);
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
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-600">
                        {lang === "ar" ? row.type_label : row.type}
                    </span>
                ),
        },
        {
            key: "message",
            header: headers.message,
            render: (_, row) => (
                <div className="flex items-center gap-2 max-w-75">
                    <span>{truncate(row.message)}</span>
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
                    className={`px-1 py-2 rounded text-xs ${row.is_reply
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                        }`}
                >
                    {row.is_reply ? `${translate?.settings.contactUs.replyed}` : `${translate?.settings.contactUs.notReplyed}`}
                </p>
            ),
        },
        {
            key: "id",
            header: headers.actions,
            align: "center",
            render: (_, row) => {
                const isReplied =
                    row.is_reply === true ||
                    row.status === "answered";

                return (
                    <div className="flex items-center justify-center">

                        {/*  show message */}
                        <Button
                            className="bg-yellow-500 hover:bg-yellow-600 mx-1 px-2.5! py-4 text-white cursor-pointer"
                            size="sm"
                            onClick={() =>
                                setSelectedMessage({
                                    message: row.message,
                                    reply: row.reply ?? null,
                                })
                            }
                        >
                            <Eye className="w-4 h-4" />
                        </Button>

                        {/* reply message*/}
                        {!isReplied && (
                            <Button
                                className="bg-blue-500 hover:bg-blue-600 mx-1 px-3.5! py-4 me-2 text-white cursor-pointer"
                                size="sm"
                                onClick={() =>
                                    setReplyModal({
                                        id: row.id,
                                        message: row.message,
                                    })
                                }
                            >
                                رد
                            </Button>
                        )}

                        {/* حذف */}
                        <DeleteConfirmDialog
                            title={translate?.settings.contactUs.deleteTitle}
                            description={translate?.settings.contactUs.deleteMessage}
                            confirmText={translate?.settings.contactUs.deleteBtn}
                            cancelText={translate?.settings.contactUs.cancelBtn}
                            onConfirm={() => handleDelete(row.id)}
                        />
                    </div>
                );
            }
        },
    ];


    const showSkeleton = !sessionReady || isLoading;

    return (
        <div className="p-6 mx-4 my-10 bg-white rounded-2xl border space-y-6">

            <h2 className="titleStyle">
                {translate?.settings.contactUs.title}
            </h2>

            <DataTable
                data={contacts}
                columns={columns}
                isSkeleton={showSkeleton}
                searchPlaceholder={translate?.settings.contactUs.searchPlaceholder}
            />

            <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
                <DialogContent className="max-w-lg [&>button]:hidden">

                    <DialogHeader className="flex flex-row items-center justify-between">

                        <DialogTitle className="titleStyle">
                            {translate?.settings.contactUs.message}
                        </DialogTitle>

                        <DialogClose asChild>
                            <button className="rounded-full p-1 text-red-500 hover:text-red-700 hover:bg-gray-100 transition
                            cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </DialogClose>

                    </DialogHeader>

                    <div className="whitespace-pre-wrap text-sm mt-2 rounded-md bg-gray-100 p-4">
                        {selectedMessage?.message}
                    </div>

                    {selectedMessage?.reply && (
                        <div className="mt-4">
                            <h3 className="font-semibold text-sm mb-2">الرد:</h3>
                            <div className="whitespace-pre-wrap text-sm rounded-md bg-green-50 p-4 border border-green-200">
                                {selectedMessage.reply}
                            </div>
                        </div>
                    )}

                </DialogContent>
            </Dialog>
            <Dialog open={!!replyModal} onOpenChange={() => setReplyModal(null)}>
                <DialogContent className="max-w-lg [&>button]:hidden">

                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="titleStyle">
                            الرد على الرسالة
                        </DialogTitle>

                        <DialogClose asChild>
                            <button className="rounded-full p-1 text-red-500 hover:text-red-700 hover:bg-gray-100 transition
                            cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </DialogClose>

                    </DialogHeader>

                    {/* message */}
                    <div className="bg-gray-100 p-3 rounded text-sm">
                        {replyModal?.message}
                    </div>

                    {/* textarea */}
                    <textarea
                        className="w-full border rounded p-2 mt-3 outline-none"
                        rows={4}
                        placeholder="اكتب الرد..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />

                    {/* buttons */}
                    <div className="flex justify-end gap-2 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setReplyModal(null)}
                        >
                            إلغاء
                        </Button>

                        <Button onClick={handleReply}>
                            إرسال الرد
                        </Button>
                    </div>

                </DialogContent>
            </Dialog>

        </div>
    );
}