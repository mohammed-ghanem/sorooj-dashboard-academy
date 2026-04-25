/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import DeleteAccountSkeleton, {
  DeleteAccountEditorSkeleton,
} from "@/components/skeleton/DeleteAccountSkeleton";
import { useSessionReady } from "@/hooks/useSessionReady";
import TranslateHook from "@/translate/TranslateHook";
import { CircleCheckBig } from "lucide-react";
import {
  useGetDeleteAccountQuery,
  useUpdateDeleteAccountMutation,
} from "@/store/settings/deleteAcoount";

const CkEditor = dynamic(() => import("@/components/ckEditor/CKEditor"), {
  ssr: false,
  loading: () => <DeleteAccountEditorSkeleton />,
});

export default function DeleteAccount() {
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const { data, isLoading } = useGetDeleteAccountQuery(undefined, {
    skip: !sessionReady,
    refetchOnMountOrArgChange: true,
  });
  const [updateDeleteAccount, { isLoading: isSaving }] =
    useUpdateDeleteAccountMutation();

  const [form, setForm] = useState({ ar: "", en: "" });

  useEffect(() => {
    if (!data) return;
    setForm({
      ar: data.ar ?? "",
      en: data.en ?? "",
    });
  }, [data]);

  if (!sessionReady) {
    return <DeleteAccountSkeleton />;
  }

  if (isLoading) {
    return <DeleteAccountSkeleton />;
  }

  const submit = async () => {
    try {
      const res = await updateDeleteAccount(form).unwrap();
      toast.success(res?.message);
    } catch (err: any) {
      const errorData = err?.data ?? err;

      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg))
        );
        return;
      }
    }
  };

  return (
    <div className="p-6 mx-4 my-10 space-y-6 bg-white rounded-2xl border border-solid border-[#ddd]">
      <h3 className=" font-bold titleStyle cairo-font">
        {translate?.settings.deleteAccount.title}
      </h3>

      {!data ? (
        <>
          <DeleteAccountEditorSkeleton />
          <DeleteAccountEditorSkeleton />
        </>
      ) : (
        <>
          {/* arabic content */}
          <div className="m-2">
            <p className="titleDescription">
              {translate?.settings.deleteAccount.arabicContent}
            </p>
            <CkEditor
              editorData={form.ar}
              handleOnUpdate={(value) =>
                setForm((prev) => ({ ...prev, ar: value }))
              }
              config={{ language: "ar", direction: "rtl" }}
            />
          </div>
          {/* english content */}
          <div className="m-2">
            <p className="titleDescription">
              {translate?.settings.deleteAccount.englishContent}
            </p>
            <CkEditor
              editorData={form.en}
              handleOnUpdate={(value) =>
                setForm((prev) => ({ ...prev, en: value }))
              }
              config={{ language: "en", direction: "ltr" }}
            />
          </div>
          <button
            onClick={submit}
            className="submitButton flex items-center"
            disabled={isSaving}
          >
            <CircleCheckBig className="h-4 w-4 me-2" />
            {isSaving
              ? `${translate?.settings.deleteAccount.processing}`
              : `${translate?.settings.deleteAccount.saveBtn}`}
          </button>
        </>
      )}
    </div>
  );
}
