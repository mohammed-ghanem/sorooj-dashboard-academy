import { Skeleton } from "@/components/ui/skeleton";
import {Card,CardContent,CardHeader} from "@/components/ui/card";

  import { Separator } from "@/components/ui/separator";
const ChangePasswordSkeleton = () => {
    return (
        <div className="flex items-center justify-center bg-muted/40 px-4">
          <Card className="w-full max-w-3xl rounded-2xl">
            <CardHeader className="space-y-3 text-center">
              <Skeleton className="h-7 w-2/3 mx-auto" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
    
            <Separator />
    
            <CardContent className="pt-6 space-y-5">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
    
              <div className="flex gap-3 justify-end">
                <Skeleton className="h-10 w-28 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
}

export default ChangePasswordSkeleton
