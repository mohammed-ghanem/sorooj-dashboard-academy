/* eslint-disable @typescript-eslint/no-explicit-any */

function looksLikeReviewRow(o: unknown): o is Record<string, unknown> {
  if (!o || typeof o !== "object" || Array.isArray(o)) return false;
  const r = o as Record<string, unknown>;
  return (
    r.id != null &&
    (r.article_answer != null ||
      r.article_review_status != null ||
      r.exam_attempt_id != null ||
      r.student != null ||
      r.question_text != null ||
      r.question != null)
  );
}

function mergeAttemptAnswerShell(node: Record<string, unknown>) {
  const attemptAnswer =
    node.attempt_answer ??
    node.exam_attempt_answer ??
    node.attemptAnswer;

  if (!attemptAnswer || typeof attemptAnswer !== "object" || Array.isArray(attemptAnswer)) {
    return node;
  }

  const aa = attemptAnswer as Record<string, unknown>;
  const question =
    node.question ?? aa.question ?? node.exam_question ?? aa.exam_question;

  return {
    ...node,
    ...aa,
    question,
    question_text:
      node.question_text ??
      aa.question_text ??
      (typeof question === "string"
        ? question
        : (question as Record<string, unknown> | undefined)?.question_text),
    article_answer:
      node.article_answer ??
      aa.article_answer ??
      aa.answer ??
      aa.student_answer,
    student: node.student ?? aa.student,
    exam: node.exam ?? aa.exam,
  };
}

/**
 * Unwraps Laravel / Postman wrappers for exam-article-reviews show & index payloads.
 */
export function pickExamArticleReviewFromResponse(response: any): any {
  if (response == null) return null;

  const tryNode = (node: any): any => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return null;

    const keyOrder = [
      "exam_article_review",
      "ExamArticleReview",
      "examArticleReview",
      "article_review",
      "ArticleReview",
      "review",
    ] as const;

    for (const k of keyOrder) {
      const v = node[k];
      if (v != null && typeof v === "object" && !Array.isArray(v)) {
        return tryNode(mergeAttemptAnswerShell(v as Record<string, unknown>));
      }
    }

    const merged = mergeAttemptAnswerShell(node as Record<string, unknown>);
    if (looksLikeReviewRow(merged)) return merged;

    const inner = node.data;
    if (inner != null && typeof inner === "object") {
      const fromInner = tryNode(inner);
      if (fromInner != null) return fromInner;
    }

    return null;
  };

  const outer = response?.data ?? response;
  return tryNode(outer);
}

export function pickExamArticleReviewsListFromResponse(response: any): any[] {
  if (response == null) return [];

  const outer = response?.data ?? response;
  const raw =
    outer?.data ??
    outer?.exam_article_reviews ??
    outer?.ExamArticleReviews ??
    (Array.isArray(outer) ? outer : null);

  if (Array.isArray(raw)) return raw;

  const single = pickExamArticleReviewFromResponse(response);
  return single ? [single] : [];
}
