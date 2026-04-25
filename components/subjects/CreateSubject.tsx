/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import "./style.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpenText } from "lucide-react";

import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import { useCreateSubjectMutation } from "@/store/subjects/subjectsApi";
import { useSessionReady } from "@/hooks/useSessionReady";

import SubjectFormSkeleton from "@/components/skeleton/SubjectFormSkeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ImageDropzone from "@/components/shared/ImageDropzone";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

type FormState = {
  name: string;
  about_subject: string;
  study_term_id: number | "";
  is_active: boolean;
  cover: File | null;
};

export default function CreateSubject() {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const { data: studyTerms = [], isLoading: loadingStudyTerms } =
    useGetStudyTermsQuery(undefined, { skip: !sessionReady });

  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation();

  const [form, setForm] = useState<FormState>({
    name: "",
    about_subject: "",
    study_term_id: "",
    is_active: true,
    cover: null,
  });

  const studyTermLabel = (row: any) => {
    const loc = parseLocalizedNameFromModel(row);
    return lang === "ar" ? loc.name_ar || loc.name : loc.name_en || loc.name;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.study_term_id === "" || Number(form.study_term_id) <= 0) {
      toast.error(
        lang === "ar"
          ? "يرجى اختيار المحور الدراسي"
          : "Please select a study term",
      );
      return;
    }

    if (!studyTerms.length) {
      toast.error(
        lang === "ar"
          ? "لا توجد محاور دراسية متاحة. أضف محورًا دراسيًا أولًا."
          : "No study terms available. Create a study term first.",
      );
      return;
    }

    try {
      const res = await createSubject({
        name: form.name,
        about_subject: form.about_subject,
        study_term_id: Number(form.study_term_id),
        is_active: form.is_active,
        cover: form.cover,
      }).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/subjects`);
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

  if (!sessionReady || loadingStudyTerms) {
    return <SubjectFormSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold">
            <div className="flex items-center gap-2 rounded-xl icon_bg">
              <BookOpenText className="w-5 h-5 " />
            </div>
            {translate?.pages.subjects.createSubject.title}
          </CardTitle>
          <CardDescription>
            {translate?.pages.subjects.createSubject.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.subjects.createSubject.name}
                </Label>
                <Input
                  className="focus-visible:ring-0 border-[#999]"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-semibold mb-2">
                {translate?.pages.subjects.createSubject.aboutSubject}
              </Label>
              <Input
                className="focus-visible:ring-0 border-[#999]"
                value={form.about_subject}
                onChange={(e) =>
                  setForm({ ...form, about_subject: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold mb-2">
                {translate?.pages.subjects.createSubject.studyTerm}
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-[#999] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
                value={
                  form.study_term_id === "" ? "" : String(form.study_term_id)
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    study_term_id:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              >
                <option value="">
                  {translate?.pages.subjects.createSubject.selectStudyTerm}
                </option>
                {studyTerms.map((st) => (
                  <option key={st.id} value={st.id}>
                    {studyTermLabel(st)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="font-semibold mb-2">
                {translate?.pages.subjects.createSubject.cover}
              </Label>
              <ImageDropzone
                file={form.cover}
                onFileChange={(file) => setForm({ ...form, cover: file })}
              />
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) =>
                  setForm({ ...form, is_active: Boolean(v) })
                }
              />
              <span className="text-sm">
                {translate?.pages.subjects.createSubject.isActive}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isCreating || !studyTerms.length}
              className="mx-auto block bg-green-700 hover:bg-green-600 font-semibold"
            >
              {isCreating
                ? `${translate?.pages.subjects.createSubject.processing}...`
                : `${translate?.pages.subjects.createSubject.createBtn}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
