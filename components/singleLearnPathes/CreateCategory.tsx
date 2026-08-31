/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderTree } from "lucide-react";
import { useCreateScientificTrackCategoryMutation } from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";
import AcademicYearFormSkeleton from "@/components/skeleton/AcademicYearFormSkeleton";
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
import { Separator } from "@/components/ui/separator";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import FormSubmitProgress from "@/components/shared/FormSubmitProgress";

type FormState = {
  name: string;
  about_category: string;
  is_active: boolean;
};

export default function CreateCategory() {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const t = translate?.pages.scientificTrackCategories.createCategory;

  const [createCategory, { isLoading: isCreating }] =
    useCreateScientificTrackCategoryMutation();

  const [form, setForm] = useState<FormState>({
    name: "",
    about_category: "",
    is_active: true,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createCategory(form).unwrap();
      toast.success(res?.message);
      router.push(`/${lang}/singleLearnPath/categories`);
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

  if (!sessionReady) return <AcademicYearFormSkeleton />;

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl font-bold text-slate-900 md:text-2xl">
            <span className={dash.pageIconBox}>
              <FolderTree className="h-6 w-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {t?.description}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <FolderTree className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {t?.description}
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
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
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
                    {t?.aboutCategory}
                  </Label>
                  <Textarea
                    className={cn("min-h-[120px]", dash.input)}
                    value={form.about_category}
                    onChange={(e) =>
                      setForm({ ...form, about_category: e.target.value })
                    }
                  />
                </div>
              </div>
            </section>

            <Separator />

            <FormSubmitProgress isSubmitting={isCreating} />

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(v) =>
                    setForm({ ...form, is_active: Boolean(v) })
                  }
                />
                <span className="text-sm font-medium text-slate-800">
                  {t?.isActive}
                </span>
              </div>
              <Button
                type="submit"
                disabled={isCreating}
                className={dash.formSubmit}
              >
                {isCreating ? `${t?.processing}...` : `${t?.createBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
