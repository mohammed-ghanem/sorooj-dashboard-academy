/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import "./style.css";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { BookOpenText } from "lucide-react";
import { useState } from "react";

import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import {
  useGetSubjectByIdQuery,
  useUpdateSubjectMutation,
} from "@/store/subjects/subjectsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

import SubjectFormSkeleton from "@/components/skeleton/SubjectFormSkeleton";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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

type EditSubjectForm = {
  name: string;
  about_subject: string;
  study_term_id: number;
  is_active: boolean;
};

export default function EditSubject() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.subjects.editSubject;

  const { data: studyTerms = [], isLoading: loadingStudyTerms } =
    useGetStudyTermsQuery(undefined, { skip: !sessionReady });

  const {
    data: subject,
    isLoading,
    isError,
  } = useGetSubjectByIdQuery(Number(id), {
    skip: !sessionReady || !id || Number.isNaN(Number(id)),
  });

  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();
  const [selectedCover, setSelectedCover] = useState<File | null>(null);

  const { register, handleSubmit, reset, control } = useForm<EditSubjectForm>({
    defaultValues: {
      name: "",
      about_subject: "",
      study_term_id: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (!subject) return;

    const studyTermId = subject.study_term_id || subject.study_term?.id || 0;
    reset({
      name: subject.name ?? subject.name_ar ?? subject.name_en ?? "",
      about_subject: subject.about_subject ?? "",
      study_term_id: Number(studyTermId) || 0,
      is_active: Boolean(subject.is_active),
    });
  }, [subject, reset]);

  const studyTermLabel = (row: any) => {
    const loc = parseLocalizedNameFromModel(row);
    return lang === "ar" ? loc.name_ar || loc.name : loc.name_en || loc.name;
  };

  const onSubmit = async (data: EditSubjectForm) => {
    if (!data.study_term_id) {
      toast.error(
        lang === "ar"
          ? "يرجى اختيار المحور الدراسي"
          : "Please select a study term",
      );
      return;
    }

    try {
      let coverFile: File | null = selectedCover;

      if (!coverFile && subject?.cover) {
        try {
          const res = await fetch(subject.cover);
          const blob = await res.blob();
          const ext = blob.type?.split("/")[1] || "jpg";
          coverFile = new File([blob], `cover.${ext}`, {
            type: blob.type || "image/jpeg",
          });
        } catch {
          toast.error(
            lang === "ar"
              ? "تعذر استخدام صورة الغلاف الحالية، يرجى إعادة رفع صورة."
              : "Couldn't reuse current cover image, please upload one.",
          );
          return;
        }
      }

      const res = await updateSubject({
        id: Number(id),
        data: {
          name: data.name,
          about_subject: data.about_subject,
          study_term_id: data.study_term_id,
          is_active: data.is_active,
          cover: coverFile,
        },
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

  if (!sessionReady || isLoading || loadingStudyTerms) {
    return <SubjectFormSkeleton />;
  }

  if (isError || !subject) {
    return (
      <div
        className={cn(dash.formPageNarrow, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {translate?.pages.subjects.viewSubject.notFound}
      </div>
    );
  }

  return (
    <div className={dash.formPageNarrow} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <BookOpenText className="w-6 h-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {t?.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <BookOpenText className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {t?.titleUpdate}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.name}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    {...register("name", { required: true })}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {t?.aboutSubject}
                </Label>
                <Input
                  className={cn("h-11", dash.input)}
                  {...register("about_subject", { required: true })}
                />
              </div>

              <div className="mt-5 space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {t?.studyTerm}
                </Label>
                <Controller
                  name="study_term_id"
                  control={control}
                  rules={{ validate: (v) => v > 0 }}
                  render={({ field }) => (
                    <select
                      className={dash.select}
                      value={field.value > 0 ? String(field.value) : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? 0 : Number(v));
                      }}
                    >
                      <option value="">{t?.selectStudyTerm}</option>
                      {studyTerms.map((st) => (
                        <option key={st.id} value={st.id}>
                          {studyTermLabel(st)}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="mt-6 space-y-2">
                <Label
                  className={cn(
                    "text-sm font-semibold text-slate-800",
                    labelAlign,
                  )}
                >
                  {t?.cover}
                </Label>
                <ImageDropzone
                  file={selectedCover}
                  existingImageUrl={subject?.cover}
                  onFileChange={setSelectedCover}
                  showRemoveButton={false}
                />
              </div>
            </section>

            <Separator />

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                    />
                  )}
                />
                <span className="text-sm font-medium text-slate-800">
                  {t?.isActive}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isUpdating || !studyTerms.length}
                className={dash.formSubmit}
              >
                {isUpdating ? `${t?.processing}...` : `${t?.editBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
