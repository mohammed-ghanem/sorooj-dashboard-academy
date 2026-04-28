import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function ProfileSkeleton() {
  return (
    <div className="w-full mx-auto py-10 px-4 md:px-4">
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
        <CardHeader className="space-y-3 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-emerald-50/40 pb-8 pt-8 md:pt-10 md:pb-10 px-6 md:px-10">
          <div className="flex flex-wrap items-start gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Skeleton className="h-8 w-40 max-w-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-8 md:px-10 md:py-10 space-y-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
            <div className="space-y-2 text-center md:text-start w-full max-w-sm">
              <Skeleton className="h-6 w-48 mx-auto md:mx-0" />
              <Skeleton className="h-6 w-32 mx-auto md:mx-0 rounded-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3">
            <div className="mb-6 flex gap-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-2" />

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-5">
            <Skeleton className="h-12 w-full max-w-xs mx-auto rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileSkeleton;
