import { Skeleton } from "@/components/ui/skeleton";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

const widget =
  "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/4";

function WidgetSkeleton({ className }: { className?: string }) {
  return (
    <article className={cn(widget, className)}>
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
      <Skeleton className="mt-5 h-2 w-full rounded-full" />
    </article>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className={dash.page}>
      <div className="space-y-8 md:space-y-10">
        <section className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-7 w-48" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-36 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <article key={i} className={cn(widget, "p-4")}>
                <div className="mb-3 flex items-start justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
                <Skeleton className="h-8 w-16" />
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className={widget}>
              <Skeleton className="mb-5 h-5 w-28" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-3 w-full rounded-full" />
                ))}
              </div>
            </article>
            <article className={widget}>
              <Skeleton className="mb-5 h-5 w-28" />
              <div className="flex items-center gap-6">
                <Skeleton className="h-44 w-44 rounded-full" />
                <div className="flex-1 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            </article>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <WidgetSkeleton key={i} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
            <WidgetSkeleton />
            <article className={widget}>
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex h-40 items-end justify-center gap-8">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[70%] w-8 rounded-t-md" />
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/3"
              >
                <Skeleton className="mb-3 h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-full max-w-30" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
