import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ViewAcademicYearSkeleton() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <Separator />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
