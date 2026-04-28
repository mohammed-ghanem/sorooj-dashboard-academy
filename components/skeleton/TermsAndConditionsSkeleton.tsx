import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TermsAndConditionsEditorSkeleton() {
  return (
    <section className="rounded-2xl border border-emerald-200/75 bg-linear-to-br from-emerald-50/30 via-white to-teal-50/20 p-6 md:p-8 shadow-sm ring-1 ring-emerald-900/5 space-y-3">
      <Skeleton className="h-5 w-48 max-w-full" />
      <Skeleton className="min-h-[200px] w-full rounded-xl" />
    </section>
  );
}

export default function TermsAndConditionsSkeleton() {
  return (
    <div className="w-full mx-auto py-10 px-4 md:px-4">
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4">
        <CardHeader className="space-y-3 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-emerald-50/40 pb-8 pt-8 md:pt-10 md:pb-10 px-6 md:px-10">
          <div className="flex flex-wrap items-start gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <Skeleton className="h-8 w-72 max-w-full" />
          </div>
        </CardHeader>
        <CardContent className="px-4 py-8 md:px-10 md:py-10 space-y-8">
          <TermsAndConditionsEditorSkeleton />
          <TermsAndConditionsEditorSkeleton />
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-5">
            <Skeleton className="h-12 w-full max-w-xs mx-auto rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
