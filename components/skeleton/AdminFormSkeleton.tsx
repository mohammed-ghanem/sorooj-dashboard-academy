import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function AdminFormSkeleton() {
  return (
    <div className="w-full mx-auto py-10 px-4 md:px-4">
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
        <CardHeader className="space-y-3 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-emerald-50/40 pb-8 pt-8 md:pt-10 md:pb-10 px-6 md:px-10">
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Skeleton className="h-8 w-48 max-w-full" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-8 md:px-10 md:py-10">
          <div className="rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3">
            <div className="mb-6 flex gap-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <Skeleton className="h-4 flex-1 max-w-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          <div className="rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 p-3"
                >
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-5 md:px-8 md:py-6 space-y-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-12 w-full max-w-xs mx-auto rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
