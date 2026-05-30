/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Normalizes Laravel / Postman exam JSON wrappers (e.g. `data.Exam`, nested `data`,
 * PascalCase keys) for GET show endpoints on `/lessons/{id}/exam` and `/subjects/{id}/exam`.
 */
function looksLikeExamRoot(o: unknown): o is Record<string, unknown> {
  if (!o || typeof o !== "object" || Array.isArray(o)) return false;
  const r = o as Record<string, unknown>;
  if (Array.isArray(r.questions) || Array.isArray(r.Questions)) return true;
  if (
    typeof r.title === "string" &&
    (r.max_attempts != null || r.maxAttempts != null)
  )
    return true;
  return false;
}

export function pickExamRawFromResponse(response: any): any {
  if (response == null) return null;

  const tryNode = (node: any): any => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return null;

    const keyOrder = [
      "exam",
      "Exam",
      "lesson_exam",
      "LessonExam",
      "lessonExam",
      "subject_exam",
      "SubjectExam",
      "subjectExam",
      "video_exam",
      "VideoExam",
      "videoExam",
      "lesson_video_exam",
      "LessonVideoExam",
    ] as const;
    for (const k of keyOrder) {
      const v = node[k];
      if (v != null && typeof v === "object" && !Array.isArray(v)) return v;
    }

    if (looksLikeExamRoot(node)) return node;

    const inner = node.data;
    if (inner != null && typeof inner === "object") {
      const fromInner = tryNode(inner);
      if (fromInner != null) return fromInner;
    }

    for (const v of Object.values(node)) {
      if (looksLikeExamRoot(v)) return v;
    }

    return null;
  };

  const outer = response?.data ?? response;
  return tryNode(outer);
}
