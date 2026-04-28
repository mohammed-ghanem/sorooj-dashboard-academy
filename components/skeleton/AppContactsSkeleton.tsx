import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function AppContactsSkeleton() {
  return (
    <div className="w-full mx-auto py-10 px-4 md:px-4">
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
        <CardHeader className="space-y-3 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-emerald-50/40 pb-8 pt-8 md:pt-10 md:pb-10 px-6 md:px-10">
          <div className="flex flex-wrap items-start gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Skeleton className="h-8 w-56 max-w-full" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-8 md:px-10 md:py-10 space-y-8">
          <div className="rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3">
            <div className="mb-6 flex gap-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <Skeleton className="h-4 flex-1 max-w-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </div>
          <Separator />
          <div className="rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3">
            <div className="mb-6 flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`space-y-2 ${i === 2 ? "md:col-span-2" : ""}`}
                >
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-5">
            <Skeleton className="h-12 w-full max-w-xs mx-auto rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
