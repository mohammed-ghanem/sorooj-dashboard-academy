"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

/** Matches CreateRole / EditRole on formPageWide: gradient header, role fields, permission matrix. */
export default function RoleFormSkeleton() {
  return (
    <div className="w-full  mx-auto py-10 px-4 md:px-4">
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
        <CardHeader className="space-y-3 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-emerald-50/40 pb-8 pt-8 md:pt-10 md:pb-10 px-6 md:px-10">
          <div className="flex flex-wrap items-start gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="space-y-3 flex-1 min-w-[200px]">
              <Skeleton className="h-8 w-56 max-w-full" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-8 md:px-10 md:py-10 space-y-8">
          <section className="rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3">
            <Skeleton className="h-5 w-40 mb-6" />
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>

          <Skeleton className="h-11 w-full max-w-sm rounded-xl" />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="rounded-2xl border-slate-200/90 shadow-sm ring-1 ring-slate-900/4"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {[...Array(3)].map((__, j) => (
                    <Skeleton key={j} className="h-11 w-full rounded-xl" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-5 md:px-8 md:py-6">
            <Skeleton className="h-12 w-full max-w-xs mx-auto rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
