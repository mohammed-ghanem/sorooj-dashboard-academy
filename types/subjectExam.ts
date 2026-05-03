export type SubjectExamQuestionType =
  | "multiple_choice"
  | "true_false"
  | "article";

export interface ISubjectExamMcOption {
  id?: number;
  option_text: string;
  is_correct: boolean;
}

export interface ISubjectExamQuestion {
  id?: number;
  type: SubjectExamQuestionType;
  question_text: string;
  marks: number;
  options?: ISubjectExamMcOption[];
  correct_boolean?: boolean;
}

export interface ISubjectExam {
  id?: number;
  subject_id?: number;
  title: string;
  max_attempts: number;
  passing_percentage: number;
  is_active: boolean;
  questions: ISubjectExamQuestion[];
  message?: string;
}

export interface ISubjectExamSavePayload {
  title: string;
  max_attempts: number;
  passing_percentage: number;
  is_active: boolean;
  questions: ISubjectExamQuestion[];
}
