import { Skeleton } from "@/components/ui/skeleton";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";
import AcademyStatisticsSkeleton from "./AcademyStatisticsSkeleton";

const QUICK_TONES = [
  {
    card: "border-emerald-100 bg-linear-to-br from-white via-emerald-50/40 to-teal-50/30 ring-emerald-100/80",
    icon: "bg-linear-to-br from-emerald-100 to-teal-50 ring-emerald-200/80",
    rail: "bg-linear-to-b from-emerald-400 to-teal-700",
  },
  {
    card: "border-teal-100 bg-linear-to-br from-white via-teal-50/40 to-cyan-50/30 ring-teal-100/80",
    icon: "bg-linear-to-br from-teal-100 to-cyan-50 ring-teal-200/80",
    rail: "bg-linear-to-b from-teal-400 to-cyan-700",
  },
  {
    card: "border-cyan-100 bg-linear-to-br from-white via-cyan-50/40 to-sky-50/30 ring-cyan-100/80",
    icon: "bg-linear-to-br from-cyan-100 to-sky-50 ring-cyan-200/80",
    rail: "bg-linear-to-b from-cyan-400 to-teal-700",
  },
  {
    card: "border-amber-100 bg-linear-to-br from-white via-amber-50/45 to-orange-50/30 ring-amber-100/80",
    icon: "bg-linear-to-br from-amber-100 to-orange-50 ring-amber-200/80",
    rail: "bg-linear-to-b from-amber-400 to-orange-600",
  },
  {
    card: "border-orange-100 bg-linear-to-br from-white via-orange-50/40 to-amber-50/30 ring-orange-100/80",
    icon: "bg-linear-to-br from-orange-100 to-amber-50 ring-orange-200/80",
    rail: "bg-linear-to-b from-orange-400 to-amber-700",
  },
  {
    card: "border-yellow-100 bg-linear-to-br from-white via-yellow-50/45 to-amber-50/30 ring-yellow-100/80",
    icon: "bg-linear-to-br from-yellow-100 to-amber-50 ring-yellow-200/80",
    rail: "bg-linear-to-b from-yellow-400 to-amber-600",
  },
  {
    card: "border-violet-100 bg-linear-to-br from-white via-violet-50/40 to-fuchsia-50/25 ring-violet-100/80",
    icon: "bg-linear-to-br from-violet-100 to-fuchsia-50 ring-violet-200/80",
    rail: "bg-linear-to-b from-violet-400 to-indigo-700",
  },
  {
    card: "border-sky-100 bg-linear-to-br from-white via-sky-50/45 to-indigo-50/25 ring-sky-100/80",
    icon: "bg-linear-to-br from-sky-100 to-indigo-50 ring-sky-200/80",
    rail: "bg-linear-to-b from-sky-400 to-indigo-600",
  },
] as const;

export default function DashboardSkeleton() {
  return (
    <div className={dash.page}>
      <div className="space-y-8 md:space-y-10">
        <AcademyStatisticsSkeleton />

        <section className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {QUICK_TONES.map((tone, index) => (
              <div
                key={index}
                className={cn(
                  "relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border p-4 shadow-sm ring-1",
                  tone.card,
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-s-0 top-4 bottom-4 w-1 rounded-full opacity-80",
                    tone.rail,
                  )}
                />
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl ring-1",
                    tone.icon,
                  )}
                >
                  <Skeleton className="h-5 w-5 rounded-sm bg-white/70" />
                </span>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
