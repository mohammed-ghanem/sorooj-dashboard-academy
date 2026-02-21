"use client";

import { Skeleton } from "@/components/ui/skeleton";

const SidebarSkeletonItem = ({ nested = false }: { nested?: boolean }) => {
  return (
    <div
      className={`
        flex items-center justify-center md:justify-start
        gap-0 md:gap-3 p-2
        ${nested ? "md:ms-6" : ""}
      `}
    >
      <Skeleton className="w-6 h-6 rounded-md" />
      <Skeleton className="hidden md:block h-5 w-32" />
    </div>
  );
};

const SidebarSkeleton = () => {
  return (
    <div className="p-2 space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <SidebarSkeletonItem key={i} />
      ))}

      <SidebarSkeletonItem />

      {Array.from({ length: 2 }).map((_, i) => (
        <SidebarSkeletonItem key={`nested-${i}`} nested />
      ))}
    </div>
  );
};

export default SidebarSkeleton;
