export type LessonExamQuestionType =
  | "multiple_choice"
  | "true_false"
  | "article";

export interface ILessonExamMcOption {
  id?: number;
  option_text: string;
  is_correct: boolean;
}

export interface ILessonExamQuestion {
  id?: number;
  type: LessonExamQuestionType;
  question_text: string;
  marks: number;
  options?: ILessonExamMcOption[];
  /** true_false only */
  correct_boolean?: boolean;
}

export interface ILessonExam {
  id?: number;
  lesson_id?: number;
  title: string;
  max_attempts: number;
  passing_percentage: number;
  is_active: boolean;
  questions: ILessonExamQuestion[];
  message?: string;
}

export interface ILessonExamSavePayload {
  title: string;
  max_attempts: number;
  passing_percentage: number;
  is_active: boolean;
  questions: ILessonExamQuestion[];
}
