/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type { IExamArticleReview } from "@/types/examArticleReview";
import {
  pickExamArticleReviewFromResponse,
  pickExamArticleReviewsListFromResponse,
} from "@/store/utils/pickExamArticleReviewFromResponse";

function normalizeStudent(item: any) {
  return {
    id: Number(item?.id ?? 0),
    name: String(item?.name ?? ""),
    email: String(item?.email ?? ""),
  };
}

function normalizeExam(item: any) {
  return {
    title: String(item?.title ?? ""),
    examable_label: String(item?.examable_label ?? ""),
  };
}

function questionTextFromItem(item: any): string {
  const question = item?.question ?? item?.exam_question ?? item?.attempt_question;
  if (typeof question === "string") return question;
  return String(
    item?.question_text ??
      question?.question_text ??
      item?.exam_question?.question_text ??
      item?.attempt_question?.question_text ??
      "",
  );
}

function articleAnswerFromItem(item: any): string {
  return String(
    item?.article_answer ??
      item?.answer ??
      item?.student_answer ??
      item?.essay_answer ??
      item?.attempt_answer?.article_answer ??
      item?.attempt_answer?.answer ??
      "",
  );
}

function normalizeExamArticleReview(item: any): IExamArticleReview {
  const marksAwarded = item?.marks_awarded;
  return {
    id: Number(item?.id),
    exam_attempt_id: Number(item?.exam_attempt_id ?? 0),
    attempt_status: String(item?.attempt_status ?? ""),
    trans_attempt_status: String(item?.trans_attempt_status ?? ""),
    article_review_status: String(item?.article_review_status ?? ""),
    trans_article_review_status: String(
      item?.trans_article_review_status ?? "",
    ),
    question_text: questionTextFromItem(item),
    article_answer: articleAnswerFromItem(item),
    marks_possible: Number(item?.marks_possible ?? 0),
    marks_awarded:
      marksAwarded === null || marksAwarded === undefined
        ? null
        : Number(marksAwarded),
    submitted_at: String(item?.submitted_at ?? ""),
    student: normalizeStudent(item?.student ?? {}),
    exam: normalizeExam(item?.exam ?? {}),
    is_correct:
      item?.is_correct === null || item?.is_correct === undefined
        ? null
        : item?.is_correct === true || Number(item?.is_correct) === 1,
  };
}

export const examArticleReviewsApi = createApi({
  reducerPath: "examArticleReviewsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ExamArticleReviews"],
  endpoints: (builder) => ({
    getExamArticleReviews: builder.query<IExamArticleReview[], void>({
      query: () => ({
        url: "exam-article-reviews",
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickExamArticleReviewsListFromResponse(response);
        return raw.map((row) => normalizeExamArticleReview(row));
      },
      providesTags: ["ExamArticleReviews"],
    }),

    getExamArticleReview: builder.query<IExamArticleReview, number>({
      query: (id) => ({
        url: `exam-article-reviews/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickExamArticleReviewFromResponse(response);
        if (!raw || raw?.id == null) {
          throw new Error("Exam article review not found");
        }
        return normalizeExamArticleReview(raw);
      },
      providesTags: (_result, _error, id) => [
        { type: "ExamArticleReviews", id },
      ],
    }),

    reviewExamArticle: builder.mutation<
      { message: string },
      { id: number; is_correct: 0 | 1 }
    >({
      query: ({ id, is_correct }) => {
        const fd = new FormData();
        fd.append("is_correct", String(is_correct));
        return {
          url: `exam-article-reviews/${id}/review`,
          method: "post",
          data: fd,
        };
      },
      invalidatesTags: ["ExamArticleReviews"],
    }),
  }),
});

export const {
  useGetExamArticleReviewsQuery,
  useGetExamArticleReviewQuery,
  useReviewExamArticleMutation,
} = examArticleReviewsApi;
