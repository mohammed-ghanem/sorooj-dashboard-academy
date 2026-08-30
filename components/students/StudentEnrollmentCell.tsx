"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useChangeStudentEnrollmentMutation } from "@/store/students/studentsApi";
import {
  isStudentEnrolled,
  studentEnrollmentLabel,
} from "@/utils/studentEnrollment";
import type { IStudent } from "@/types/student";
import { cn } from "@/lib/utils";

type Props = {
  student: IStudent;
  labels: {
    enrolled: string;
    notEnrolled: string;
    enrollBtn: string;
    enrollConfirmTitle: string;
    enrollConfirmMessage: string;
    cancelBtn: string;
    confirmBtn: string;
    enrollFailed: string;
  };
};

export default function StudentEnrollmentCell({ student, labels }: Props) {
  const enrolled = isStudentEnrolled(student);
  const [open, setOpen] = useState(false);
  const [changeEnrollment, { isLoading }] =
    useChangeStudentEnrollmentMutation();

  const handleConfirm = async () => {
    try {
      const res = await changeEnrollment(student.id).unwrap();
      toast.success(res.message);
      setOpen(false);
    } catch (err: unknown) {
      const errorData = (err as { data?: { message?: string } })?.data ?? err;
      const message =
        (errorData as { message?: string })?.message ?? labels.enrollFailed;
      toast.error(message);
    }
  };

  const label = studentEnrollmentLabel(student, {
    enrolled: labels.enrolled,
    notEnrolled: labels.notEnrolled,
  });

  if (enrolled) {
    return (
      <div className="flex justify-center">
        <Badge
          className={cn(
            "bg-emerald-600 hover:bg-emerald-600 font-semibold px-3 py-1",
            "pointer-events-none select-none",
          )}
        >
          {label}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Badge className="bg-red-600 hover:bg-red-600 font-semibold px-3 py-1 text-white">
        {label}
      </Badge>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 rounded-lg border-emerald-300 text-emerald-800 hover:bg-emerald-50"
          >
            <UserCheck className="h-4 w-4 me-1" />
            {labels.enrollBtn}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.enrollConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {labels.enrollConfirmMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {labels.cancelBtn}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirm();
              }}
            >
              {labels.confirmBtn}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
