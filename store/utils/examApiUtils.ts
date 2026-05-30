/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ILessonExam,
  ILessonExamMcOption,
  ILessonExamQuestion,
  ILessonExamSavePayload,
  LessonExamQuestionType,
} from "@/types/lessonExam";

export function normalizeExamOption(item: any): ILessonExamMcOption {
  return {
    id: item?.id != null ? Number(item.id) : undefined,
    option_text: String(item?.option_text ?? item?.text ?? ""),
    is_correct:
      item?.is_correct === true || Number(item?.is_correct ?? 0) === 1,
  };
}

export function normalizeExamQuestion(item: any): ILessonExamQuestion {
  const type = String(item?.type ?? "article") as LessonExamQuestionType;
  const base: ILessonExamQuestion = {
    id: item?.id != null ? Number(item.id) : undefined,
    type:
      type === "multiple_choice" || type === "true_false" ? type : "article",
    question_text: String(item?.question_text ?? ""),
    marks: Math.max(0, Number(item?.marks ?? 0) || 0),
  };

  if (base.type === "multiple_choice") {
    const raw = item?.options ?? item?.Options ?? [];
    const list = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object"
        ? Object.values(raw)
        : [];
    const options = list.map(normalizeExamOption);
    return { ...base, options };
  }

  if (base.type === "true_false") {
    return {
      ...base,
      correct_boolean:
        item?.correct_boolean === true ||
        Number(item?.correct_boolean ?? 0) === 1,
    };
  }

  return base;
}

export function normalizeExam(
  row: any,
  parentIdField?: "lesson_id" | "subject_id" | "lesson_video_id",
): ILessonExam {
  const r = row ?? {};
  const qRaw = r?.questions ?? r?.Questions ?? [];
  const qList = Array.isArray(qRaw)
    ? qRaw
    : qRaw && typeof qRaw === "object"
      ? Object.values(qRaw)
      : [];
  const questions = qList.map(normalizeExamQuestion);

  const exam: ILessonExam = {
    id: r?.id != null ? Number(r.id) : undefined,
    title: String(r?.title ?? ""),
    max_attempts: Math.max(1, Number(r?.max_attempts ?? 1) || 1),
    passing_percentage: Math.min(
      100,
      Math.max(0, Number(r?.passing_percentage ?? 0) || 0),
    ),
    is_active: Boolean(
      r?.is_active === true || Number(r?.is_active ?? 0) === 1,
    ),
    questions,
    message: r?.message ? String(r.message) : undefined,
  };

  if (parentIdField && r[parentIdField] != null) {
    (exam as ILessonExam & Record<string, number>)[parentIdField] = Number(
      r[parentIdField],
    );
  }

  if (parentIdField === "lesson_video_id") {
    const vid =
      r?.lesson_video_id ?? r?.video_id ?? r?.lessonVideoId ?? r?.videoId;
    if (vid != null) {
      (exam as ILessonExam & { lesson_video_id?: number }).lesson_video_id =
        Number(vid);
    }
  }

  return exam;
}

export function appendExamQuestions(
  fd: FormData,
  questions: ILessonExamQuestion[],
) {
  questions.forEach((q, i) => {
    if (q.id != null && q.id > 0) {
      fd.append(`questions[${i}][id]`, String(q.id));
    }
    fd.append(`questions[${i}][type]`, q.type);
    fd.append(`questions[${i}][question_text]`, q.question_text);
    fd.append(`questions[${i}][marks]`, String(q.marks));

    if (q.type === "true_false") {
      fd.append(
        `questions[${i}][correct_boolean]`,
        q.correct_boolean ? "1" : "0",
      );
    }

    if (q.type === "multiple_choice" && q.options) {
      q.options.forEach((opt, j) => {
        if (opt.id != null && opt.id > 0) {
          fd.append(`questions[${i}][options][${j}][id]`, String(opt.id));
        }
        fd.append(
          `questions[${i}][options][${j}][option_text]`,
          opt.option_text,
        );
        fd.append(
          `questions[${i}][options][${j}][is_correct]`,
          opt.is_correct ? "1" : "0",
        );
      });
    }
  });
}

export function buildExamFormData(payload: ILessonExamSavePayload) {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("max_attempts", String(payload.max_attempts));
  fd.append("passing_percentage", String(payload.passing_percentage));
  fd.append("is_active", payload.is_active ? "1" : "0");
  appendExamQuestions(fd, payload.questions);
  return fd;
}

export function buildUpdateExamFormData(payload: ILessonExamSavePayload) {
  const fd = buildExamFormData(payload);
  fd.append("_method", "PUT");
  return fd;
}
