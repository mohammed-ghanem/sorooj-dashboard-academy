export interface IExamArticleReviewStudent {
  id: number;
  name: string;
  email: string;
}

export interface IExamArticleReviewExam {
  title: string;
  examable_label: string;
}

export interface IExamArticleReview {
  id: number;
  exam_attempt_id: number;
  attempt_status: string;
  trans_attempt_status: string;
  article_review_status: string;
  trans_article_review_status: string;
  question_text: string;
  article_answer: string;
  marks_possible: number;
  marks_awarded: number | null;
  submitted_at: string;
  student: IExamArticleReviewStudent;
  exam: IExamArticleReviewExam;
  is_correct?: boolean | null;
}
