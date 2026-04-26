import { Skeleton } from "@/components/ui/skeleton";

export default function DoctorFormSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="rounded-2xl border p-6 space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-40 mx-auto" />
      </div>
    </div>
  );
}
