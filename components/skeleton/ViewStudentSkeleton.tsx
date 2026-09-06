import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { dash } from "@/constants/dashboardUi";

function CertificateCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-stone-100 ring-1 ring-emerald-950/10">
      <div className="absolute inset-y-0 inset-s-0 w-2.5 bg-emerald-800/35" />
      <div className="flex flex-col gap-4 px-6 py-5 ps-8 sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:py-6">
        <Skeleton className="mx-auto h-21 w-29 shrink-0 rounded-xl sm:mx-0" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-64 max-w-full" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="h-7 w-28 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2 sm:flex-col">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Matches ViewStudent: gradient header, avatar row, diploma certificates, status strips, back. */
export default function ViewStudentSkeleton() {
  return (
    <div className={dash.formPage}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <div className="flex flex-wrap items-start gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="min-w-50 flex-1 space-y-3">
              <Skeleton className="h-8 w-64 max-w-full" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-4 py-8 md:px-10 md:py-10">
          <section className={dash.sectionNeutral}>
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <Skeleton className="h-22 w-22 shrink-0 rounded-2xl" />
              <div className="flex-1 space-y-2 pt-2">
                <Skeleton className="h-6 w-48 max-w-full" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>

          <Separator />

          <section className={dash.sectionNeutral}>
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <CertificateCardSkeleton />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-52" />
                <div className="rounded-3xl border border-dashed border-emerald-800/20 bg-stone-100/70 px-6 py-5">
                  <Skeleton className="h-4 w-56 max-w-full" />
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <div className="max-w-md space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          <Skeleton className="h-12 w-40 rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}
