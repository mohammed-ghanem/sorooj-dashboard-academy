import { Skeleton } from "@/components/ui/skeleton";

export function DeleteAccountTitleSkeleton() {
  return <Skeleton className="h-8 w-64 " />;
}

export function DeleteAccountEditorSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-48 " />
      <Skeleton className="h-10 w-full " />
      <Skeleton className="h-64 w-full " />
    </div>
  );
}

export function DeleteAccountButtonSkeleton() {
  return <Skeleton className="h-10 w-32 rounded-lg" />;
}

export default function DeleteAccountPageSkeleton() {
  return (
    <div className="p-6 mx-4 my-10 space-y-6 bg-white rounded-2xl border border-solid border-[#ddd]">
      <DeleteAccountTitleSkeleton />
      <DeleteAccountEditorSkeleton />
      <DeleteAccountEditorSkeleton />
      <DeleteAccountButtonSkeleton />
    </div>
  );
}
