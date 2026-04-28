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
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

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
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";

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
    <div className={dash.formPageNarrow} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <BookOpenText className="w-6 h-6" />
            </span>
            <span className="leading-tight">
              {translate?.pages.subjects.createSubject.title}
            </span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {translate?.pages.subjects.createSubject.description}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <BookOpenText className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {translate?.pages.subjects.createSubject.description}
                </p>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {translate?.pages.subjects.createSubject.name}
                </Label>
                <Input
                  className={cn("h-11", dash.input)}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                className={cn(
                  "text-sm font-semibold text-slate-800",
                  labelAlign,
                )}
              >
                {translate?.pages.subjects.createSubject.aboutSubject}
              </Label>
              <Input
                className={cn("h-11", dash.input)}
                value={form.about_subject}
                onChange={(e) =>
                  setForm({ ...form, about_subject: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                className={cn(
                  "text-sm font-semibold text-slate-800",
                  labelAlign,
                )}
              >
                {translate?.pages.subjects.createSubject.studyTerm}
              </Label>
              <select
                className={dash.select}
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

            <div className="space-y-2">
              <Label
                className={cn(
                  "text-sm font-semibold text-slate-800",
                  labelAlign,
                )}
              >
                {translate?.pages.subjects.createSubject.cover}
              </Label>
              <ImageDropzone
                file={form.cover}
                onFileChange={(file) => setForm({ ...form, cover: file })}
              />
            </div>
            </section>

            <Separator />

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(v) =>
                    setForm({ ...form, is_active: Boolean(v) })
                  }
                />
                <span className="text-sm font-medium text-slate-800">
                  {translate?.pages.subjects.createSubject.isActive}
                </span>
              </div>

            <Button
              type="submit"
              disabled={isCreating || !studyTerms.length}
              className={dash.formSubmit}
            >
              {isCreating
                ? `${translate?.pages.subjects.createSubject.processing}...`
                : `${translate?.pages.subjects.createSubject.createBtn}`}
            </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
