"use client";

import { useFormSubmitProgress } from "@/hooks/useFormSubmitProgress";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { cn } from "@/lib/utils";

type Props = {
  isSubmitting: boolean;
  progress?: number;
  className?: string;
};

export default function FormSubmitProgress({
  isSubmitting,
  progress: progressProp,
  className,
}: Props) {
  const ownProgress = useFormSubmitProgress(isSubmitting);
  const progress = progressProp ?? ownProgress;
  const lang = LangUseParams();
  const translate = TranslateHook();
  const t = translate?.pages?.formSubmit;
  const determinate = progress > 0;
  const label = determinate
    ? (t?.uploading ??
      (lang === "ar" ? "جاري الرفع والحفظ..." : "Uploading..."))
    : (t?.saving ?? (lang === "ar" ? "جاري الحفظ..." : "Saving..."));

  if (!isSubmitting) return null;

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-amber-200/70 bg-amber-50/40 px-3 py-3",
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs text-amber-950">
        <span>{label}</span>
        {determinate ? <span>{progress}%</span> : null}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-amber-100">
        {determinate ? (
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        ) : (
          <div className="form-submit-progress-indet absolute inset-y-0 w-1/3 rounded-full bg-amber-500" />
        )}
      </div>
    </div>
  );
}
