import type { IStudent } from "@/types/student";

const ENROLLED_VALUES = new Set(["enrolled", "1", "true", "yes"]);
const NOT_ENROLLED_VALUES = new Set([
  "not_enrolled",
  "unenrolled",
  "not enrolled",
  "0",
  "false",
  "no",
]);

export function isStudentEnrolled(student: IStudent): boolean {
  const raw = String(student.enrollmentStatus ?? "")
    .trim()
    .toLowerCase();
  if (ENROLLED_VALUES.has(raw)) return true;
  if (NOT_ENROLLED_VALUES.has(raw)) return false;

  const label = String(student.enrollmentStatusLabel ?? "").trim();
  if (/غير\s*ملتحق|not\s*enrolled/i.test(label)) return false;
  if (/^ملتحق$|^enrolled$/i.test(label)) return true;
  if (/ملتحق|enrolled/i.test(label) && !/غير|not/i.test(label)) return true;

  return false;
}

export function studentEnrollmentLabel(
  student: IStudent,
  labels: { enrolled: string; notEnrolled: string },
): string {
  if (isStudentEnrolled(student)) return labels.enrolled;
  if (student.enrollmentStatusLabel || student.enrollmentStatus) {
    return student.enrollmentStatusLabel || student.enrollmentStatus || labels.notEnrolled;
  }
  return labels.notEnrolled;
}
