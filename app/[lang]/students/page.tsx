import { Suspense } from "react";
import Students from "@/components/students/Students";

export default function StudentsPage() {
  return (
    <Suspense>
      <Students />
    </Suspense>
  );
}
