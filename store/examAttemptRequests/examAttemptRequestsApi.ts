/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  IExamAttemptRequest,
  ReviewExamAttemptRequestPayload,
} from "@/types/examAttemptRequest";

function normalizeStudent(item: any): IExamAttemptRequest["student"] {
  return {
    id: Number(item?.id ?? 0),
    name: String(item?.name ?? ""),
    email: String(item?.email ?? ""),
  };
}

function normalizeReviewer(item: any): IExamAttemptRequest["reviewer"] {
  const raw = item?.reviewer ?? item?.reviewed_by;
  if (!raw || typeof raw !== "object") return null;
  const name = String(raw.name ?? raw.full_name ?? "");
  const id = Number(raw.id ?? 0);
  if (!name && !id) return null;
  return {
    id,
    name,
    email: String(raw.email ?? ""),
  };
}

function normalizeExam(item: any): IExamAttemptRequest["exam"] {
  const exam = item?.exam ?? {};
  const studyTermId =
    exam?.study_term_id ??
    exam?.study_term?.id ??
    exam?.studyTermId ??
    exam?.studyTerm?.id ??
    null;
  const subjectId =
    exam?.subject_id ??
    exam?.subject?.id ??
    exam?.subjectId ??
    null;
  const lessonId =
    exam?.lesson_id ??
    exam?.lesson?.id ??
    exam?.lessonId ??
    null;

  return {
    id: Number(exam?.id ?? 0),
    title: String(exam?.title ?? ""),
    max_attempts: Number(exam?.max_attempts ?? 0),
    examable_type: String(exam?.examable_type ?? ""),
    trans_examable_type: String(
      exam?.trans_examable_type ?? exam?.transExamableType ?? "",
    ),
    examable_id: Number(exam?.examable_id ?? 0),
    examable_label: String(exam?.examable_label ?? ""),
    attempts_used: Number(exam?.attempts_used ?? 0),
    effective_max_attempts: Number(
      exam?.effective_max_attempts ?? exam?.max_attempts ?? 0,
    ),
    can_start_new_attempt: Boolean(exam?.can_start_new_attempt),
    study_term_id:
      studyTermId == null || studyTermId === ""
        ? null
        : Number(studyTermId) || null,
    subject_id:
      subjectId == null || subjectId === "" ? null : Number(subjectId) || null,
    lesson_id:
      lessonId == null || lessonId === "" ? null : Number(lessonId) || null,
  };
}

function normalizeRequest(item: any): IExamAttemptRequest {
  return {
    id: Number(item?.id),
    status: String(item?.status ?? "pending"),
    trans_status: String(item?.trans_status ?? ""),
    extra_attempts:
      item?.extra_attempts == null ? null : Number(item.extra_attempts),
    rejection_reason:
      item?.rejection_reason == null || item?.rejection_reason === ""
        ? null
        : String(item.rejection_reason),
    created_at: String(item?.created_at ?? ""),
    reviewed_at:
      item?.reviewed_at == null || item?.reviewed_at === ""
        ? null
        : String(item.reviewed_at),
    student: normalizeStudent(item?.student ?? {}),
    reviewer: normalizeReviewer(item),
    exam: normalizeExam(item),
  };
}

/** Unwrap Laravel/Postman list payloads for exam-attempt-requests. */
function extractList(response: any): any[] {
  if (response == null) return [];

  const candidates = [
    response?.data,
    response?.data?.data,
    response?.data?.exam_attempt_requests,
    response?.exam_attempt_requests,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function pickOne(response: any): any {
  if (response == null) return null;
  const outer = response?.data ?? response;
  const candidates = [
    outer?.exam_attempt_request,
    outer?.ExamAttemptRequest,
    outer?.data?.exam_attempt_request,
    outer?.data,
    outer,
  ];
  for (const c of candidates) {
    if (c && typeof c === "object" && !Array.isArray(c) && c.id != null) {
      return c;
    }
  }
  return null;
}

function dedupeById(list: any[]): any[] {
  const seen = new Set<number>();
  const unique: any[] = [];
  for (const item of list) {
    const id = Number(item?.id);
    if (id && !seen.has(id)) {
      seen.add(id);
      unique.push(item);
    } else if (!id) {
      unique.push(item);
    }
  }
  return unique;
}

function readMeta(body: any) {
  return body?.meta ?? body?.data?.meta ?? null;
}

export const examAttemptRequestsApi = createApi({
  reducerPath: "examAttemptRequestsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ExamAttemptRequests"],
  endpoints: (builder) => ({
    getExamAttemptRequests: builder.query<IExamAttemptRequest[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        // This endpoint treats limit/per_page=0 as "return nothing".
        // Match Postman: fetch page 1, then remaining pages if needed.
        const firstResult = await baseQuery({
          url: "/exam-attempt-requests",
          method: "get",
          params: { page: 1 },
        });

        if (firstResult.error) {
          return { error: firstResult.error as any };
        }

        const body = firstResult.data as any;
        let allRaw = extractList(body);

        const meta = readMeta(body);
        const lastPage = Math.max(1, Number(meta?.last_page ?? 1));
        const total = Number(meta?.total ?? allRaw.length);

        if (lastPage > 1 && allRaw.length < total) {
          const promises = [];
          for (let p = 2; p <= lastPage; p++) {
            promises.push(
              baseQuery({
                url: "/exam-attempt-requests",
                method: "get",
                params: { page: p },
              }),
            );
          }
          const results = await Promise.all(promises);
          for (const res of results) {
            if (res.data) {
              allRaw = allRaw.concat(extractList(res.data));
            }
          }
        }

        return {
          data: dedupeById(allRaw).map(normalizeRequest),
        };
      },
      providesTags: ["ExamAttemptRequests"],
    }),

    getExamAttemptRequest: builder.query<IExamAttemptRequest, number>({
      query: (id) => ({
        url: `/exam-attempt-requests/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickOne(response);
        if (!raw || raw?.id == null) {
          throw new Error("Exam attempt request not found");
        }
        return normalizeRequest(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "ExamAttemptRequests", id }],
    }),

    reviewExamAttemptRequest: builder.mutation<
      { message: string },
      ReviewExamAttemptRequestPayload
    >({
      query: ({ id, status, extra_attempts, reason }) => {
        const fd = new FormData();
        fd.append("status", status);
        if (status === "approved" && extra_attempts != null) {
          fd.append("extra_attempts", String(extra_attempts));
        }
        if (status === "rejected" && reason) {
          fd.append("reason", reason);
        }
        return {
          url: `/exam-attempt-requests/${id}/review`,
          method: "post",
          data: fd,
        };
      },
      invalidatesTags: ["ExamAttemptRequests"],
    }),
  }),
});

export const {
  useGetExamAttemptRequestsQuery,
  useGetExamAttemptRequestQuery,
  useReviewExamAttemptRequestMutation,
} = examAttemptRequestsApi;
