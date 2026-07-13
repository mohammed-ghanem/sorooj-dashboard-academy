export interface IScientificTrackSubject {
  id: number;
  name: string;
  about_subject: string;
  category_id: number;
  category?: {
    id?: number;
    name?: string;
  };
  cover?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ICreateScientificTrackSubjectPayload {
  name: string;
  about_subject: string;
  category_id: number;
  is_active: boolean;
  cover?: File | null;
}

export interface IUpdateScientificTrackSubjectPayload {
  name: string;
  about_subject: string;
  category_id: number;
  is_active: boolean;
  cover?: File | null;
}
