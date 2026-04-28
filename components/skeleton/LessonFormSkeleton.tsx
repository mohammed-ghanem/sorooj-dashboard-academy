import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonCkEditorSkeleton } from "./LessonCkEditorSkeleton";

export { LessonCkEditorSkeleton };

/**
 * Loading shell for Create / Edit lesson forms — mirrors lesson card layout & sections.
 */
export default function LessonFormSkeleton() {
  return (
    <div className="w-full mx-auto py-10 px-4 md:px-6">
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
        <CardHeader className="space-y-4 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-emerald-50/40 pb-8 pt-8 md:pt-10 md:pb-10 px-6 md:px-10">
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Skeleton className="h-8 w-56 max-w-full" />
              <Skeleton className="h-4 w-full max-w-xl" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-8 px-2 md:py-10 space-y-10 md:space-y-12">
          {/* Lesson details panel */}
          <section className="rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3">
            <div className="mb-6 flex gap-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </section>

          {/* Videos panel */}
          <section className="rounded-2xl border-2 border-violet-200/70 bg-linear-to-b from-violet-50/50 via-white to-white p-6 md:p-8 shadow-md shadow-violet-950/6 ring-1 ring-violet-900/4">
            <div className="mb-6 flex flex-wrap justify-between gap-4">
              <div className="flex gap-4 flex-1">
                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
            </div>
            <div className="rounded-xl border border-violet-100/90 bg-white/95 p-4 md:p-5 space-y-4 ring-1 ring-violet-900/3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-10 rounded-xl w-full" />
                <Skeleton className="h-10 rounded-xl w-full" />
              </div>
              <Skeleton className="h-10 w-40 rounded-lg" />
            </div>
          </section>

          {/* Rich content / CKEditor zone */}
          <section className="rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-50/25 via-white to-teal-50/15 p-6 md:p-8 shadow-sm ring-1 ring-emerald-900/5 space-y-4">
            <div className="flex gap-4 mb-2">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-52 max-w-full" />
              </div>
            </div>
            <LessonCkEditorSkeleton />
          </section>

          {/* Divider chip */}
          <div className="relative py-6 md:py-8 flex justify-center">
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>

          {/* PDF panel */}
          <section className="rounded-2xl border border-amber-200/80 bg-linear-to-br from-amber-50/40 via-white to-orange-50/25 p-6 md:p-8 shadow-lg shadow-amber-950/5 ring-1 ring-amber-900/6">
            <div className="flex flex-wrap justify-between gap-4 mb-8">
              <div className="flex gap-4 flex-1">
                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-60 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
            </div>
            <Skeleton className="h-44 w-full rounded-xl" />
          </section>

          {/* Footer */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-5 md:px-8 md:py-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-12 w-full md:w-56 mx-auto rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
