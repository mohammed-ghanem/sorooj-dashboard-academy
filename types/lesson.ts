export interface ILessonVideo {
  id?: number;
  title: string;
  youtube_url: string;
  is_active: boolean;
}

export interface ILessonAttachment {
  id: number;
  file_url?: string;
  name?: string;
}

export interface ILesson {
  id: number;
  lesson_number: string;
  title: string;
  content: string;
  subject_id: number;
  doctor_id: number;
  subject?: {
    id?: number;
    name?: string;
    name_ar?: string;
    name_en?: string;
  };
  doctor?: {
    id?: number;
    name?: string;
  };
  videos: ILessonVideo[];
  attachments?: ILessonAttachment[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

/** Payload video row sent to API (existing rows include id on update) */
export interface ILessonVideoPayload {
  id?: number;
  title: string;
  youtube_url: string;
  is_active: boolean;
}

export interface ICreateLessonPayload {
  lesson_number: string;
  title: string;
  content: string;
  subject_id: number;
  doctor_id: number;
  is_active: boolean;
  videos: ILessonVideoPayload[];
  attachments: File[];
}

export interface IUpdateLessonPayload {
  lesson_number: string;
  title: string;
  content: string;
  subject_id: number;
  doctor_id: number;
  is_active: boolean;
  videos: ILessonVideoPayload[];
  attachments: File[];
}
