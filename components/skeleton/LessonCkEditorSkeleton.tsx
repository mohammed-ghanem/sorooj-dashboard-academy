import { Skeleton } from "@/components/ui/skeleton";

/** Matches the lesson rich-content panel (editor loading state). */
export function LessonCkEditorSkeleton() {
  return (
    <div className="lesson-form-editor rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-50/40 via-white to-teal-50/25 p-3 md:p-4 shadow-inner ring-1 ring-emerald-900/6 overflow-hidden">
      <div className="flex gap-2 border-b border-emerald-100/80 bg-white/90 px-2 py-2">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md shrink-0" />
        ))}
      </div>
      <Skeleton className="mt-3 min-h-[280px] h-[min(320px,45vh)] w-full rounded-xl bg-white/90" />
    </div>
  );
}
