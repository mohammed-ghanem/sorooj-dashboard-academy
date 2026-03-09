/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { Column, DataTable } from "@/components/datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetContactsQuery, useDeleteContactMutation } from "@/store/settings/contactsApi";
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
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

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
            key: "type_label",
            header: headers.type,
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
        // {
        //     key: "status",
        //     header: headers.status,
        //     align: "center",
        // },
        {
            key: "id",
            header: headers.actions,
            align: "center",
            render: (_, row) => (
                <div>
                    <Button
                        className="bg-yellow-500 hover:bg-yellow-600 focus:ring-2 px-2.5! py-4 focus:ring-yellow-300 cursor-pointer
                        text-white hover:text-white mx-1"
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMessage(row.message)}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>

                    <DeleteConfirmDialog
                        title={translate?.settings.contactUs.deleteTitle}
                        description={translate?.settings.contactUs.deleteMessage}
                        confirmText={translate?.settings.contactUs.deleteBtn}
                        cancelText={translate?.settings.contactUs.cancelBtn}
                        onConfirm={() => handleDelete(row.id)}
                    />
                </div>
            ),
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
                        {selectedMessage}
                    </div>

                </DialogContent>
            </Dialog>

        </div>
    );
}