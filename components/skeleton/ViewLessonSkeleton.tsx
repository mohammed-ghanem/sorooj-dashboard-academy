import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

/** Loading shell for lesson detail (view) — matches ViewLesson card & sections. */
export default function ViewLessonSkeleton() {
  return (
    <div className="w-full mx-auto py-10 px-4 md:px-6">
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
        <CardHeader className="space-y-3 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-emerald-50/40 pb-8 pt-8 md:px-10">
          <div className="flex flex-wrap items-start gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="space-y-3 flex-1 min-w-[200px]">
              <Skeleton className="h-8 w-52 max-w-full" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-8 md:px-10 md:py-10 space-y-8">
          <section className="rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/30 to-emerald-50/15 p-6 md:p-8 ring-1 ring-slate-900/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-200/60 bg-linear-to-br from-emerald-50/20 via-white to-teal-50/10 p-6 md:p-8 ring-1 ring-emerald-900/5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="min-h-[120px] h-32 w-full rounded-xl" />
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-muted/30 p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </section>

          <Separator />

          <section className="rounded-2xl border-2 border-violet-200/60 bg-linear-to-b from-violet-50/40 to-white p-6 md:p-8 ring-1 ring-violet-900/4 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </section>

          <section className="rounded-2xl border border-amber-200/70 bg-linear-to-br from-amber-50/30 to-white p-6 md:p-8 ring-1 ring-amber-900/6 space-y-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>

          <Skeleton className="h-11 w-40 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
