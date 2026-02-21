import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-4 space-y-3">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
          <Skeleton className="h-5 w-24 mx-auto rounded-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-5 w-48" />

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </div>

          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileSkeleton;
