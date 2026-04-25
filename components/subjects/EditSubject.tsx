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

  const { data: studyTerms = [], isLoading: loadingStudyTerms } =
    useGetStudyTermsQuery(undefined, { skip: !sessionReady });

  const { data: subject, isLoading } = useGetSubjectByIdQuery(Number(id), {
    skip: !sessionReady,
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
        lang === "ar" ? "يرجى اختيار المحور الدراسي" : "Please select a study term"
      );
      return;
    }

    try {
      let coverFile: File | null = selectedCover;

      // Browsers never prefill file inputs on edit.
      // Reuse existing cover by converting its URL to File if user didn't pick a new one.
      if (!coverFile && subject?.cover) {
        try {
          const res = await fetch(subject.cover);
          const blob = await res.blob();
          const ext = blob.type?.split("/")[1] || "jpg";
          coverFile = new File([blob], `cover.${ext}`, { type: blob.type || "image/jpeg" });
        } catch {
          toast.error(
            lang === "ar"
              ? "تعذر استخدام صورة الغلاف الحالية، يرجى إعادة رفع صورة."
              : "Couldn't reuse current cover image, please upload one."
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

  if (!sessionReady || isLoading || loadingStudyTerms) {
    return <SubjectFormSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold ">
            <div className="flex items-center gap-2 rounded-xl icon_bg">
              <BookOpenText className="w-5 h-5 " />
            </div>
            {translate?.pages.subjects.editSubject.title}
          </CardTitle>
          <CardDescription className="mr-1 font-semibold">
            {translate?.pages.subjects.editSubject.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold mb-2">
                  {translate?.pages.subjects.editSubject.name}
                </Label>
                <Input
                  className="focus-visible:ring-0 border-[#999]"
                  {...register("name", { required: true })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-semibold mb-2">
                {translate?.pages.subjects.editSubject.aboutSubject}
              </Label>
              <Input
                className="focus-visible:ring-0 border-[#999]"
                {...register("about_subject", { required: true })}
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold mb-2">
                {translate?.pages.subjects.editSubject.studyTerm}
              </Label>
              <Controller
                name="study_term_id"
                control={control}
                rules={{ validate: (v) => v > 0 }}
                render={({ field }) => (
                  <select
                    className="flex h-10 w-full rounded-md border border-[#999] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
                    value={field.value > 0 ? String(field.value) : ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? 0 : Number(v));
                    }}
                  >
                    <option value="">
                      {translate?.pages.subjects.editSubject.selectStudyTerm}
                    </option>
                    {studyTerms.map((st) => (
                      <option key={st.id} value={st.id}>
                        {studyTermLabel(st)}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold mb-2">
                {translate?.pages.subjects.editSubject.cover}
              </Label>
              <ImageDropzone
                file={selectedCover}
                existingImageUrl={subject?.cover}
                onFileChange={setSelectedCover}
                showRemoveButton={false}
              />
            </div>

            <Separator />

            <div className="flex items-center gap-3">
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
              <span className="text-sm">
                {translate?.pages.subjects.editSubject.isActive}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isUpdating || !studyTerms.length}
              className="w-content block mx-auto gap-2 bg-green-700 hover:bg-green-600 font-semibold cursor-pointer"
            >
              {isUpdating
                ? `${translate?.pages.subjects.editSubject.processing}...`
                : `${translate?.pages.subjects.editSubject.editBtn}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
