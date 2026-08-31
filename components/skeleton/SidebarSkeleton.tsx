"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CHIP_TONES = [
  "bg-linear-to-br from-emerald-100 to-teal-50 ring-emerald-200/70",
  "bg-linear-to-br from-violet-100 to-fuchsia-50 ring-violet-200/70",
  "bg-linear-to-br from-sky-100 to-indigo-50 ring-sky-200/70",
  "bg-linear-to-br from-teal-100 to-cyan-50 ring-teal-200/70",
  "bg-linear-to-br from-emerald-100 to-teal-50 ring-emerald-200/70",
  "bg-linear-to-br from-amber-100 to-orange-50 ring-amber-200/70",
  "bg-linear-to-br from-slate-100 to-emerald-50 ring-slate-200/80",
  "bg-linear-to-br from-violet-100 to-fuchsia-50 ring-violet-200/70",
] as const;

const GROUP_TONES = [
  "bg-linear-to-br from-emerald-100 to-teal-50 ring-emerald-200/70",
  "bg-linear-to-br from-amber-100 to-orange-50 ring-amber-200/70",
  "bg-linear-to-br from-cyan-100 to-sky-50 ring-cyan-200/70",
  "bg-linear-to-br from-slate-100 to-emerald-50 ring-slate-200/80",
] as const;

function Chip({ tone, className }: { tone: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1",
        tone,
        className,
      )}
    >
      <Skeleton className="h-3.5 w-3.5 rounded-sm bg-white/70" />
    </span>
  );
}

function SidebarSkeletonItem({
  tone,
  labelWidth = "w-28",
}: {
  tone: string;
  labelWidth?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-0 rounded-xl p-2 md:justify-start md:gap-2">
      <Chip tone={tone} />
      <Skeleton
        className={cn("hidden h-3.5 rounded-md md:block", labelWidth)}
      />
    </div>
  );
}

function SidebarSkeletonGroup({ tone }: { tone: string }) {
  return (
    <div className="flex w-full items-center justify-center gap-2 rounded-xl p-2 md:justify-between">
      <span className="flex min-w-0 flex-1 items-center justify-center gap-2 md:justify-start">
        <Chip tone={tone} />
        <Skeleton className="hidden h-3.5 w-32 rounded-md md:block" />
      </span>
      <Skeleton className="hidden h-3.5 w-3.5 shrink-0 rounded md:block" />
    </div>
  );
}

const SidebarSkeleton = () => {
  return (
    <aside
      className="
        fixed inset-y-0 inset-s-0 z-40
        flex h-screen w-14 flex-col overflow-y-auto border-e border-emerald-100/80
        bg-white
        md:w-60
      "
    >
      <div className="border-b border-slate-100 p-4">
        <div className="flex justify-center">
          <Skeleton className="h-18 w-32 rounded-md" />
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 p-2">
          {CHIP_TONES.map((tone, index) => (
            <li key={`main-${index}`}>
              <SidebarSkeletonItem
                tone={tone}
                labelWidth={index % 3 === 0 ? "w-24" : index % 3 === 1 ? "w-32" : "w-28"}
              />
            </li>
          ))}

          {GROUP_TONES.map((tone, index) => (
            <li key={`group-${index}`}>
              <SidebarSkeletonGroup tone={tone} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarSkeleton;
