import {
    Card,
    CardHeader,
    CardContent,
  } from "@/components/ui/card";
  import { Skeleton } from "@/components/ui/skeleton";
  import { Separator } from "@/components/ui/separator";
  
  export default function AdminFormSkeleton() {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" /> 
          </CardHeader>
  
          <CardContent className="space-y-6">
            {/* BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
  
            {/* PHONE */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
  
            <Separator />
  
            {/* ROLES */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 border rounded-lg p-3"
                  >
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
  
            {/* STATUS */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
  
            {/* ACTION */}
            <Skeleton className="h-10 w-40 mx-auto rounded-md" />
          </CardContent>
        </Card>
      </div>
    );
  }
  