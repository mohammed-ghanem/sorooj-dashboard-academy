import type {
  ILessonExam,
  ILessonExamQuestion,
  ILessonExamSavePayload,
} from "@/types/lessonExam";

export type IVideoExam = ILessonExam & {
  lesson_video_id?: number;
};

export type IVideoExamQuestion = ILessonExamQuestion;
export type IVideoExamSavePayload = ILessonExamSavePayload;
