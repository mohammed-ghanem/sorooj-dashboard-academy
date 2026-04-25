"use client";

import { Skeleton } from "@/components/ui/skeleton";

const SidebarSkeletonItem = ({
  nested = false,
  showChevron = false,
}: {
  nested?: boolean;
  showChevron?: boolean;
}) => {
  return (
    <div
      className={`
        flex items-center justify-center md:justify-between
        gap-0 md:gap-2 p-2 rounded
        ${nested ? "md:ms-6 ms-3" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded-md" />
        <Skeleton className="hidden md:block h-4 w-28" />
      </div>

      {showChevron && (
        <Skeleton className="hidden md:block w-4 h-4 rounded" />
      )}
    </div>
  );
};

const SidebarSkeleton = () => {
  return (
    <aside
      className="
        fixed inset-y-0 inset-s-0 z-40
        h-screen w-14 md:w-60
        asideBg border-e flex flex-col
      "
    >
      <div className="p-4 flex justify-center">
        <Skeleton className="h-24 w-32 rounded-md" />
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 p-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={`main-${i}`}>
              <SidebarSkeletonItem />
            </li>
          ))}

          <li>
            <SidebarSkeletonItem showChevron />

            <div className="md:ms-6 mt-1 ms-3 space-y-1">
              {Array.from({ length: 2 }).map((_, i) => (
                <SidebarSkeletonItem key={`nested-${i}`} nested />
              ))}
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarSkeleton;
