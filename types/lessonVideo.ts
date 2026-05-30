export interface ILessonVideoListItem {
  id: number;
  lesson_id: number;
  title: string;
  youtube_url: string;
  order_index?: number;
  is_active: boolean;
  has_exam: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ILessonVideosIndex {
  lesson: {
    id: number;
    title: string;
    lesson_number: string;
  };
  videos: ILessonVideoListItem[];
}
