export interface IExamAttemptRequestStudent {
  id: number;
  name: string;
  email: string;
}

export interface IExamAttemptRequestReviewer {
  id: number;
  name: string;
  email?: string;
}

export interface IExamAttemptRequestExam {
  id: number;
  title: string;
  max_attempts: number;
  examable_type: string;
  trans_examable_type?: string;
  examable_id: number;
  examable_label: string;
  attempts_used: number;
  effective_max_attempts: number;
  can_start_new_attempt: boolean;
  /** Optional parent ids when API includes them */
  study_term_id?: number | null;
  subject_id?: number | null;
  lesson_id?: number | null;
}

export type ExamAttemptRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | string;

export interface IExamAttemptRequest {
  id: number;
  status: ExamAttemptRequestStatus;
  trans_status: string;
  extra_attempts: number | null;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  student: IExamAttemptRequestStudent;
  reviewer: IExamAttemptRequestReviewer | null;
  exam: IExamAttemptRequestExam;
}

export type ReviewExamAttemptRequestPayload = {
  id: number;
  status: "approved" | "rejected";
  extra_attempts?: number;
  reason?: string;
};
