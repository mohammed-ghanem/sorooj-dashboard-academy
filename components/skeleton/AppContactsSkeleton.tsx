import { Skeleton } from "@/components/ui/skeleton";

export default function AppContactsSkeleton() {
  return (
    <div className="p-6 mx-4 my-10 space-y-6 bg-white rounded-2xl border border-solid border-[#ddd]">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-40 rounded-lg" />
    </div>
  );
}
