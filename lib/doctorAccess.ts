import { ALWAYS_ALLOWED_PATHS } from "@/lib/permissions";
import { isDoctorPortal } from "@/lib/portal";

const DOCTOR_MODULES = new Set([
  "subjects",
  "lessons",
  "exam_article_reviews",
  "scientific_tracks",
  "scientific_track_subjects",
  "scientific_track_lessons",
]);

const SUBJECT_WRITE_PATHS = [
  "/academic-study/subjects/create",
  "/singleLearnPath/subjects/create",
];

const SUBJECT_EDIT_PREFIXES = [
  "/academic-study/subjects/edit/",
  "/singleLearnPath/subjects/edit/",
];

const ALLOWED_PREFIXES = [
  "/academic-study/subjects",
  "/academic-study/lessons",
  "/singleLearnPath/subjects",
  "/singleLearnPath/lessons",
  "/exam-article-reviews",
  "/profile",
  "/update-profile",
  "/change-password",
];

function normalizePath(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

function isSubjectWritePath(path: string): boolean {
  if (SUBJECT_WRITE_PATHS.includes(path)) return true;
  return SUBJECT_EDIT_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function canDoctorAccessPath(path: string): boolean {
  const normalized = normalizePath(path);
  if (normalized === "/") return true;
  if (ALWAYS_ALLOWED_PATHS.has(normalized)) return true;
  if (isSubjectWritePath(normalized)) return false;
  return ALLOWED_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function doctorHasModule(module: string): boolean {
  return DOCTOR_MODULES.has(module);
}

export function canDoctorMutateSubjects(): boolean {
  return !isDoctorPortal();
}
