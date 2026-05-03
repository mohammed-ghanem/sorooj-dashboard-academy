/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  ISubjectExam,
  ISubjectExamMcOption,
  ISubjectExamQuestion,
  ISubjectExamSavePayload,
  SubjectExamQuestionType,
} from "@/types/subjectExam";
import type { IApiMessageResponse } from "@/types/subject";

function normalizeOption(item: any): ISubjectExamMcOption {
  return {
    id: item?.id != null ? Number(item.id) : undefined,
    option_text: String(item?.option_text ?? item?.text ?? ""),
    is_correct:
      item?.is_correct === true || Number(item?.is_correct ?? 0) === 1,
  };
}

function normalizeQuestion(item: any): ISubjectExamQuestion {
  const type = String(item?.type ?? "article") as SubjectExamQuestionType;
  const base: ISubjectExamQuestion = {
    id: item?.id != null ? Number(item.id) : undefined,
    type:
      type === "multiple_choice" || type === "true_false" ? type : "article",
    question_text: String(item?.question_text ?? ""),
    marks: Math.max(0, Number(item?.marks ?? 0) || 0),
  };

  if (base.type === "multiple_choice") {
    const raw = item?.options ?? [];
    const options = (Array.isArray(raw) ? raw : []).map(normalizeOption);
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

function pickExamRaw(response: any): any {
  const outer = response?.data ?? response;
  if (!outer || typeof outer !== "object") return null;
  if ((outer as any).exam != null) return (outer as any).exam;
  if ((outer as any).subject_exam != null) return (outer as any).subject_exam;
  if ((outer as any).lesson_exam != null) return (outer as any).lesson_exam;
  if (Array.isArray((outer as any).questions)) return outer;
  const inner = (outer as any).data;
  if (inner && typeof inner === "object") {
    if (inner.exam != null) return inner.exam;
    if (inner.subject_exam != null) return inner.subject_exam;
    if (Array.isArray(inner.questions)) return inner;
  }
  return null;
}

export function normalizeSubjectExam(row: any): ISubjectExam {
  const r = row ?? {};
  const qRaw = r?.questions ?? [];
  const questions = (Array.isArray(qRaw) ? qRaw : []).map(normalizeQuestion);

  return {
    id: r?.id != null ? Number(r.id) : undefined,
    subject_id: r?.subject_id != null ? Number(r.subject_id) : undefined,
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
}

function appendQuestions(fd: FormData, questions: ISubjectExamQuestion[]) {
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

function buildExamFormData(payload: ISubjectExamSavePayload) {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("max_attempts", String(payload.max_attempts));
  fd.append("passing_percentage", String(payload.passing_percentage));
  fd.append("is_active", payload.is_active ? "1" : "0");
  appendQuestions(fd, payload.questions);
  return fd;
}

function buildUpdateExamFormData(payload: ISubjectExamSavePayload) {
  const fd = buildExamFormData(payload);
  fd.append("_method", "PUT");
  return fd;
}

export const subjectExamsApi = createApi({
  reducerPath: "subjectExamsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["SubjectExam"],
  endpoints: (builder) => ({
    getSubjectExam: builder.query<ISubjectExam, number>({
      query: (subjectId) => ({
        url: `/subjects/${subjectId}/exam`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickExamRaw(response);
        if (raw == null) throw new Error("Exam data not found");
        return normalizeSubjectExam(raw);
      },
      providesTags: (_result, _err, subjectId) => [
        { type: "SubjectExam", id: subjectId },
      ],
    }),

    createSubjectExam: builder.mutation<
      { message?: string; data?: ISubjectExam },
      { subjectId: number; payload: ISubjectExamSavePayload }
    >({
      query: ({ subjectId, payload }) => ({
        url: `/subjects/${subjectId}/exam`,
        method: "post",
        data: buildExamFormData(payload),
      }),
      invalidatesTags: (_r, _e, { subjectId }) => [
        { type: "SubjectExam", id: subjectId },
      ],
    }),

    updateSubjectExam: builder.mutation<
      { message?: string; data?: ISubjectExam },
      { subjectId: number; payload: ISubjectExamSavePayload }
    >({
      query: ({ subjectId, payload }) => ({
        url: `/subjects/${subjectId}/exam`,
        method: "post",
        data: buildUpdateExamFormData(payload),
      }),
      invalidatesTags: (_r, _e, { subjectId }) => [
        { type: "SubjectExam", id: subjectId },
      ],
    }),

    deleteSubjectExam: builder.mutation<IApiMessageResponse, number>({
      query: (subjectId) => ({
        url: `/subjects/${subjectId}/exam`,
        method: "delete",
      }),
      invalidatesTags: (_r, _e, subjectId) => [
        { type: "SubjectExam", id: subjectId },
      ],
    }),
  }),
});

export const {
  useGetSubjectExamQuery,
  useCreateSubjectExamMutation,
  useUpdateSubjectExamMutation,
  useDeleteSubjectExamMutation,
} = subjectExamsApi;
