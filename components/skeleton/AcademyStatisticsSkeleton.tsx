import { Skeleton } from "@/components/ui/skeleton";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

const widget =
  "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/4";

const KPI_TONES = [
  {
    card: "border-emerald-100 bg-linear-to-br from-white via-emerald-50/50 to-teal-50/40 ring-emerald-100/80",
    icon: "bg-linear-to-br from-emerald-100 to-teal-50 ring-emerald-200/80",
    rail: "bg-linear-to-b from-emerald-400 to-teal-700",
  },
  {
    card: "border-teal-100 bg-linear-to-br from-white via-teal-50/45 to-cyan-50/35 ring-teal-100/80",
    icon: "bg-linear-to-br from-teal-100 to-cyan-50 ring-teal-200/80",
    rail: "bg-linear-to-b from-teal-400 to-cyan-700",
  },
  {
    card: "border-rose-100 bg-linear-to-br from-white via-rose-50/50 to-orange-50/30 ring-rose-100/80",
    icon: "bg-linear-to-br from-rose-100 to-orange-50 ring-rose-200/80",
    rail: "bg-linear-to-b from-rose-400 to-rose-700",
  },
  {
    card: "border-violet-100 bg-linear-to-br from-white via-violet-50/45 to-fuchsia-50/30 ring-violet-100/80",
    icon: "bg-linear-to-br from-violet-100 to-fuchsia-50 ring-violet-200/80",
    rail: "bg-linear-to-b from-violet-400 to-indigo-700",
  },
  {
    card: "border-sky-100 bg-linear-to-br from-white via-sky-50/50 to-cyan-50/35 ring-sky-100/80",
    icon: "bg-linear-to-br from-sky-100 to-cyan-50 ring-sky-200/80",
    rail: "bg-linear-to-b from-sky-400 to-cyan-700",
  },
  {
    card: "border-amber-100 bg-linear-to-br from-white via-amber-50/55 to-orange-50/35 ring-amber-100/80",
    icon: "bg-linear-to-br from-amber-100 to-orange-50 ring-amber-200/80",
    rail: "bg-linear-to-b from-amber-400 to-orange-600",
  },
] as const;

function TitleChip({
  tone,
}: {
  tone: "emerald" | "amber" | "sky" | "cyan";
}) {
  const tones = {
    emerald: "bg-linear-to-br from-emerald-100 to-teal-50 ring-emerald-200/80",
    amber: "bg-linear-to-br from-amber-100 to-orange-50 ring-amber-200/80",
    sky: "bg-linear-to-br from-sky-100 to-indigo-50 ring-sky-200/80",
    cyan: "bg-linear-to-br from-cyan-100 to-teal-50 ring-cyan-200/80",
  };

  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1",
          tones[tone],
        )}
      >
        <Skeleton className="h-5 w-5 rounded-sm bg-white/70" />
      </span>
      <Skeleton className="h-5 w-32" />
    </div>
  );
}

function StatRows({ count = 4 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0"
        >
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-10" />
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ className }: { className?: string }) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3.5 w-10" />
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100/90 ring-1 ring-slate-200/60">
        <Skeleton className={cn("h-full w-2/3 rounded-full", className)} />
      </div>
    </div>
  );
}

export default function AcademyStatisticsSkeleton() {
  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className={dash.pageIconBox}>
            <Skeleton className="h-6 w-6 rounded-sm bg-white/70" />
          </span>
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-linear-to-br from-white to-emerald-50/40 px-3 py-2 shadow-sm ring-1 ring-emerald-900/4"
            >
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {KPI_TONES.map((tone, index) => (
          <article key={index} className={cn(widget, "p-4", tone.card)}>
            <span
              aria-hidden
              className={cn(
                "absolute inset-s-0 top-3 bottom-3 w-1 rounded-full",
                tone.rail,
              )}
            />
            <div className="mb-3 flex items-start justify-between gap-2 ps-2">
              <Skeleton className="h-3.5 w-16" />
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
                  tone.icon,
                )}
              >
                <Skeleton className="h-4 w-4 rounded-sm bg-white/70" />
              </span>
            </div>
            <Skeleton className="ms-2 h-8 w-16" />
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article
          className={cn(
            widget,
            "border-teal-100/90 bg-linear-to-br from-white via-white to-teal-50/40 ring-teal-100/70",
          )}
        >
          <Skeleton className="mb-5 h-5 w-36" />
          <div className="space-y-4">
            {[
              "from-emerald-800 to-teal-500",
              "from-teal-600 to-cyan-400",
              "from-cyan-600 to-sky-400",
              "from-amber-500 to-yellow-300",
            ].map((bar, index) => (
              <div
                key={index}
                className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3"
              >
                <Skeleton className="h-3.5 w-14" />
                <div className="h-3.5 overflow-hidden rounded-full bg-slate-100/90 ring-1 ring-slate-200/50">
                  <div
                    className={cn(
                      "h-full rounded-full bg-linear-to-r",
                      bar,
                      index === 0
                        ? "w-[92%]"
                        : index === 1
                          ? "w-[70%]"
                          : index === 2
                            ? "w-[48%]"
                            : "w-[28%]",
                    )}
                  />
                </div>
                <Skeleton className="h-3.5 w-8 justify-self-end" />
              </div>
            ))}
          </div>
        </article>

        <article
          className={cn(
            widget,
            "border-emerald-100/90 bg-linear-to-br from-white via-white to-emerald-50/45 ring-emerald-100/70",
          )}
        >
          <Skeleton className="mb-5 h-5 w-40" />
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <ul className="w-full flex-1 space-y-2.5">
              {[
                "bg-teal-700",
                "bg-sky-600",
                "bg-amber-600",
                "bg-rose-600",
                "bg-yellow-600",
              ].map((dot, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
                    <Skeleton className="h-3.5 w-24" />
                  </span>
                  <Skeleton className="h-3.5 w-16" />
                </li>
              ))}
            </ul>
            <div className="relative h-44 w-44 shrink-0">
              <div className="absolute inset-0 rounded-full bg-emerald-100" />
              <div className="absolute inset-4 rounded-full bg-linear-to-br from-emerald-50 via-white to-amber-50/60 shadow-inner" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article
          className={cn(
            widget,
            "border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/25 to-teal-50/30 ring-emerald-100/70",
          )}
        >
          <TitleChip tone="emerald" />
          <StatRows />
          <ProgressBar className="bg-linear-to-r from-emerald-500 to-teal-600" />
        </article>

        <article
          className={cn(
            widget,
            "border-amber-100/90 bg-linear-to-br from-white via-amber-50/30 to-orange-50/25 ring-amber-100/70",
          )}
        >
          <TitleChip tone="amber" />
          <StatRows count={5} />
          <ProgressBar className="bg-linear-to-r from-amber-400 to-orange-500" />
        </article>

        <article
          className={cn(
            widget,
            "border-cyan-100/90 bg-linear-to-br from-white via-cyan-50/30 to-sky-50/25 ring-cyan-100/70",
          )}
        >
          <TitleChip tone="cyan" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <StatRows />
            <div>
              <Skeleton className="mb-3 h-3.5 w-28" />
              <ul className="space-y-2">
                {["bg-teal-500", "bg-cyan-500", "bg-amber-500"].map(
                  (dot, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
                        <Skeleton className="h-3.5 w-20" />
                      </span>
                      <Skeleton className="h-3.5 w-8" />
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <article
          className={cn(
            widget,
            "border-orange-100/90 bg-linear-to-br from-white via-orange-50/30 to-amber-50/25 ring-orange-100/70",
          )}
        >
          <TitleChip tone="amber" />
          <ul>
            {[
              "from-amber-100 to-orange-50 ring-amber-200/70",
              "from-emerald-100 to-teal-50 ring-emerald-200/70",
              "from-sky-100 to-cyan-50 ring-sky-200/70",
              "from-violet-100 to-fuchsia-50 ring-violet-200/70",
              "from-rose-100 to-orange-50 ring-rose-200/70",
              "from-slate-100 to-cyan-50 ring-slate-200/80",
            ].map((tone, index) => (
              <li
                key={index}
                className="border-b border-slate-100 last:border-b-0"
              >
                <span className="flex w-full items-center justify-between gap-3 py-3">
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br ring-1",
                        tone,
                      )}
                    >
                      <Skeleton className="h-3.5 w-3.5 rounded-sm bg-white/70" />
                    </span>
                    <Skeleton className="h-3.5 w-28" />
                  </span>
                  <Skeleton className="h-3.5 w-8" />
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article
          className={cn(
            widget,
            "border-sky-100/90 bg-linear-to-br from-white via-sky-50/35 to-indigo-50/25 ring-sky-100/70",
          )}
        >
          <TitleChip tone="sky" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            {[
              ["from-teal-400 to-cyan-200", "from-teal-600 to-emerald-400", "from-emerald-900 to-teal-500"],
              ["from-amber-700 to-amber-300", "from-orange-600 to-amber-400", "from-yellow-700 to-amber-200"],
            ].map((group, groupIndex) => (
              <div key={groupIndex} className="flex-1">
                <Skeleton className="mx-auto mb-4 h-4 w-24" />
                <div className="flex h-40 items-end justify-center gap-5">
                  {group.map((bar, index) => (
                    <div
                      key={index}
                      className="flex h-full w-11 flex-col items-center justify-end"
                    >
                      <div
                        className={cn(
                          "w-8 rounded-t-lg bg-linear-to-t shadow-sm",
                          bar,
                          index === 0
                            ? "h-[62%]"
                            : index === 1
                              ? "h-[78%]"
                              : "h-[45%]",
                        )}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-center gap-5">
                  {group.map((_, index) => (
                    <div key={index} className="flex w-11 flex-col items-center gap-1">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
