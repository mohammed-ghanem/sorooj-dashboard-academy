import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

/** Matches ViewStudent: gradient header, avatar row, neutral section, status strips, back. */
export default function ViewStudentSkeleton() {
  return (
    <div className="w-full mx-auto py-10 px-4 md:px-6">
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
        <CardHeader className="space-y-3 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-emerald-50/40 pb-8 pt-8 md:pt-10 md:pb-10 px-6 md:px-10">
          <div className="flex flex-wrap items-start gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="space-y-3 flex-1 min-w-[200px]">
              <Skeleton className="h-8 w-64 max-w-full" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-4 py-8 md:px-10 md:py-10">
          <section className="rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3">
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Skeleton className="h-[88px] w-[88px] shrink-0 rounded-2xl" />
              <div className="space-y-2 flex-1 pt-2">
                <Skeleton className="h-6 w-48 max-w-full" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>

          <Separator />

          <div className="space-y-2 max-w-md">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          <Skeleton className="h-12 w-40 rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}
