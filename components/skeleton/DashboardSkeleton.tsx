import { Skeleton } from "@/components/ui/skeleton";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

function SectionHeaderSkeleton() {
  return (
    <header className="space-y-2">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </header>
  );
}

function KpiCardSkeleton() {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5",
        "shadow-sm ring-1 ring-slate-900/3",
      )}
    >
      <Skeleton className="absolute inset-s-0 top-0 h-full w-1.5 rounded-none" />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-16" />
        </div>
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      </div>
    </article>
  );
}

function ModuleCardSkeleton() {
  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-10" />
      </div>
      <Skeleton className="mb-3 h-2.5 w-full rounded-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </article>
  );
}

function QuickLinkSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/3">
      <Skeleton className="mb-3 h-10 w-10 rounded-xl" />
      <Skeleton className="h-4 w-full max-w-[120px]" />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className={dash.page}>
      <div className="space-y-8 md:space-y-10">
        {/* Welcome banner */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
          <div className="flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-10">
            <div className="flex min-w-0 items-start gap-4">
              <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
              <div className="min-w-0 space-y-2 flex-1">
                <Skeleton className="h-8 w-64 max-w-full" />
                <Skeleton className="h-4 w-full max-w-2xl" />
                <Skeleton className="h-4 w-[80%] max-w-xl" />
              </div>
            </div>
            <Skeleton className="h-[72px] w-full max-w-[180px] rounded-2xl md:w-[180px]" />
          </div>
        </section>

        {/* KPI statistics */}
        <section className="space-y-4">
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Content modules */}
        <section className="space-y-4">
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ModuleCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Publishing health */}
        <section className="rounded-3xl border border-emerald-200/80 bg-white p-6 md:p-8 shadow-md shadow-emerald-950/5 ring-1 ring-emerald-900/5">
          <header className="mb-6 flex flex-wrap items-start gap-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
              <Skeleton className="h-40 w-40 rounded-full" />
              <Skeleton className="mt-4 h-4 w-56 max-w-full" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm",
                    i === 2 && "sm:col-span-2 lg:col-span-1",
                  )}
                >
                  <Skeleton className="mb-2 h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="space-y-4">
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <QuickLinkSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
