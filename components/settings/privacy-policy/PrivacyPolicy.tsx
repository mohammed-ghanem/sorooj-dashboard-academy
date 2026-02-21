/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useGetPrivacyPolicyQuery, useUpdatePrivacyPolicyMutation, } from "@/store/settings/privacyPolicyApi";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import PrivacyPolicySkeleton, { PrivacyPolicyEditorSkeleton } from "./PrivacyPolicySkeleton";
import { useSessionReady } from "@/hooks/useSessionReady";
import TranslateHook from "@/translate/TranslateHook";
import { CircleCheckBig } from "lucide-react";

const CkEditor = dynamic(() => import("@/components/ckEditor/CKEditor"), {
  ssr: false,
  loading: () => <PrivacyPolicyEditorSkeleton />,
});

export default function PrivacyPolicy() {
  const sessionReady = useSessionReady();
  const translate = TranslateHook();
  const { data, isLoading } = useGetPrivacyPolicyQuery(undefined, {
    skip: !sessionReady,
  });
  const [updatePolicy, { isLoading: isSaving }] =
    useUpdatePrivacyPolicyMutation();

  const [form, setForm] = useState({ ar: "", en: "" });

  useEffect(() => {
    if (!data) return;
    setForm({
      ar: data.ar ?? "",
      en: data.en ?? "",
    });
  }, [data]);

  // const isPageLoading = isLoading || !data;

  if (!sessionReady) {
    return <PrivacyPolicySkeleton />;
  }

  if (isLoading) {
    return <PrivacyPolicySkeleton />;
  }
  const submit = async () => {
    try {
      const res = await updatePolicy(form).unwrap();
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
        {translate?.settings.privacyPolicy.title}
      </h3>

      {!data ? (
        <>
          <PrivacyPolicyEditorSkeleton />
          <PrivacyPolicyEditorSkeleton />
        </>
      ) : (
        <>
          {/* arabic content */}
          <div className="m-2">
            <p className="titleDescription">{translate?.settings.privacyPolicy.arabicContent}</p>
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
            <p className="titleDescription">{translate?.settings.privacyPolicy.englishContent}</p>
            <CkEditor
              editorData={form.en}
              handleOnUpdate={(value) =>
                setForm((prev) => ({ ...prev, en: value }))
              }
              config={{ language: "en", direction: "ltr" }}
            />
          </div>
          <button onClick={submit}
            className="submitButton flex items-center"
            disabled={isSaving}
          >
            <CircleCheckBig className="h-4 w-4 me-2" />
            {isSaving
              ?
              `${translate?.settings.privacyPolicy.processing}`
              :
              `${translate?.settings.privacyPolicy.saveBtn}`
            }
          </button>
        </>
      )}
    </div>
  );
}
