/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSessionReady } from "@/hooks/useSessionReady";
import { setUploadProgressListener } from "@/lib/uploadProgressBus";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";
import { getHomePageSection } from "@/constants/homePageSections";
import { getHomePageSectionHooks } from "@/store/homePage/homePageApis";
import type { HomePageSectionKey } from "@/types/homePageSection";
import AcademicYearFormSkeleton from "@/components/skeleton/AcademicYearFormSkeleton";
import ImageDropzone from "@/components/shared/ImageDropzone";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";

type Props = { sectionKey: HomePageSectionKey };

export default function EditHomePageItem({ sectionKey }: Props) {
  const { id } = useParams<{ id: string }>();
  const section = getHomePageSection(sectionKey);
  const hooks = getHomePageSectionHooks(sectionKey);
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const shared = translate?.pages?.homePageSections;
  const pg = shared?.[section.dictKey];
  const Icon = section.icon;
  const itemId = Number(id);

  const { data: item, isLoading, isError } = hooks.useGetItemByIdQuery(itemId, {
    skip: !sessionReady || !id || Number.isNaN(itemId),
  });
  const [updateItem, { isLoading: isUpdating }] = hooks.useUpdateItemMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadingLabel =
    shared?.uploadingFiles ??
    (lang === "ar" ? "جاري رفع الملفات..." : "Uploading files...");

  useEffect(() => {
    if (!item) return;
    setTitle(item.title ?? "");
    setDescription(item.description ?? "");
    setIsActive(Boolean(item.is_active));
  }, [item]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(`${shared?.processingSave ?? ""}...`);
    setUploadProgress(0);
    setUploadProgressListener((percent) => {
      setUploadProgress(percent);
      toast.loading(`${uploadingLabel} ${percent}%`, { id: toastId });
    });

    try {
      const res = await updateItem({
        id: itemId,
        data: {
          title,
          description,
          is_active: isActive,
          icon: iconFile,
          image: imageFile,
        },
      }).unwrap();
      toast.success(res?.message, { id: toastId });
      router.push(`/${lang}/${section.basePath}`);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          (messages as string[]).forEach((msg) => toast.error(msg)),
        );
        toast.dismiss(toastId);
      } else if (errorData?.message) {
        toast.error(errorData.message, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } finally {
      setUploadProgressListener(null);
      setUploadProgress(0);
    }
  };

  if (!sessionReady || isLoading) return <AcademicYearFormSkeleton />;

  if (isError || !item) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {shared?.notFound}
      </div>
    );
  }

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl font-bold text-slate-900 md:text-2xl">
            <span className={dash.pageIconBox}>
              <Icon className="h-6 w-6" />
            </span>
            <span className="leading-tight">{pg?.editTitle}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {pg?.formDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral}>
              <div className="grid grid-cols-1 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {shared?.title}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {shared?.description}
                  </Label>
                  <Textarea
                    className={cn("min-h-30", dash.input)}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                {section.hasIcon ? (
                  <div className="space-y-2">
                    <Label
                      className={cn(
                        "text-sm font-semibold text-slate-800",
                        labelAlign,
                      )}
                    >
                      {shared?.icon}
                    </Label>
                    <ImageDropzone
                      file={iconFile}
                      onFileChange={setIconFile}
                      existingImageUrl={item.icon}
                      accept="image/*,.svg"
                    />
                  </div>
                ) : null}
                {section.hasImage ? (
                  <div className="space-y-2">
                    <Label
                      className={cn(
                        "text-sm font-semibold text-slate-800",
                        labelAlign,
                      )}
                    >
                      {shared?.image}
                    </Label>
                    <ImageDropzone
                      file={imageFile}
                      onFileChange={setImageFile}
                      existingImageUrl={item.image}
                      accept="image/*,.svg"
                    />
                  </div>
                ) : null}
                <label className="flex items-center gap-3">
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                  />
                  <span className="text-sm font-medium">{shared?.isActive}</span>
                </label>
              </div>
            </section>

            {isUpdating && uploadProgress > 0 ? (
              <div className="space-y-2 rounded-xl border border-amber-200/70 bg-amber-50/40 px-3 py-3">
                <div className="flex items-center justify-between text-xs text-amber-950">
                  <span>{uploadingLabel}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className={dash.formFooterBar}>
              <Button
                type="submit"
                size="lg"
                className={dash.formSubmit}
                disabled={isUpdating}
              >
                {isUpdating
                  ? uploadProgress > 0
                    ? `${uploadingLabel} ${uploadProgress}%`
                    : shared?.processingSave
                  : shared?.saveBtn}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
