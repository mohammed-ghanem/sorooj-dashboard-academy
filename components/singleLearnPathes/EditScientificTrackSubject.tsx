/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { BookOpenText } from "lucide-react";
import { useGetScientificTrackCategoriesQuery } from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
import {
  useGetScientificTrackSubjectByIdQuery,
  useUpdateScientificTrackSubjectMutation,
} from "@/store/scientificTrackSubjects/scientificTrackSubjectsApi";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ImageDropzone from "@/components/shared/ImageDropzone";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import FormSubmitProgress from "@/components/shared/FormSubmitProgress";

type EditForm = {
  name: string;
  about_subject: string;
  category_id: number;
  is_active: boolean;
};

export default function EditScientificTrackSubject() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.scientificTrackSubjects.editSubject;
  const pg = translate?.pages.scientificTrackSubjects;

  const { data: categories = [], isLoading: loadingCategories } =
    useGetScientificTrackCategoriesQuery(undefined, { skip: !sessionReady });

  const {
    data: subject,
    isLoading,
    isError,
  } = useGetScientificTrackSubjectByIdQuery(Number(id), {
    skip: !sessionReady || !id || Number.isNaN(Number(id)),
  });

  const [updateSubject, { isLoading: isUpdating }] =
    useUpdateScientificTrackSubjectMutation();
  const [selectedCover, setSelectedCover] = useState<File | null>(null);

  const { register, handleSubmit, reset, control } = useForm<EditForm>({
    defaultValues: {
      name: "",
      about_subject: "",
      category_id: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (!subject) return;
    reset({
      name: subject.name ?? "",
      about_subject: subject.about_subject ?? "",
      category_id: subject.category_id || subject.category?.id || 0,
      is_active: Boolean(subject.is_active),
    });
  }, [subject, reset]);

  const onSubmit = async (data: EditForm) => {
    if (!data.category_id) {
      toast.error(
        lang === "ar" ? "يرجى اختيار القسم" : "Please select a category",
      );
      return;
    }

    try {
      const res = await updateSubject({
        id: Number(id),
        data: {
          name: data.name,
          about_subject: data.about_subject,
          category_id: Number(data.category_id),
          is_active: data.is_active,
          cover: selectedCover,
        },
      }).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/singleLearnPath/subjects`);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          (messages as string[]).forEach((msg) => toast.error(msg)),
        );
        return;
      }
      if (errorData?.message) toast.error(errorData.message);
    }
  };

  if (!sessionReady || isLoading || loadingCategories) {
    return <SubjectFormSkeleton />;
  }

  if (isError || !subject) {
    return (
      <div
        className={cn(dash.formPageNarrow, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {pg?.viewSubject?.notFound}
      </div>
    );
  }

  return (
    <div className={dash.formPageNarrow} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl font-bold text-slate-900 md:text-2xl">
            <span className={dash.pageIconBox}>
              <BookOpenText className="h-6 w-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {t?.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 md:space-y-10"
          >
            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <BookOpenText className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
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

                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.category}
                  </Label>
                  <Controller
                    name="category_id"
                    control={control}
                    rules={{ validate: (v) => Number(v) > 0 }}
                    render={({ field }) => (
                      <select
                        className={dash.select}
                        value={field.value > 0 ? String(field.value) : ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? 0 : Number(v));
                        }}
                      >
                        <option value="">{t?.selectCategory}</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.aboutSubject}
                  </Label>
                  <Textarea
                    className={cn("min-h-30", dash.input)}
                    {...register("about_subject", { required: true })}
                  />
                </div>

                <div className="space-y-2">
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
                    existingImageUrl={subject.cover}
                    onFileChange={setSelectedCover}
                  />
                </div>
              </div>
            </section>

            <Separator />

            <FormSubmitProgress isSubmitting={isUpdating} />

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
                disabled={isUpdating}
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
