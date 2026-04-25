export interface ISubject {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  about_subject: string;
  study_term_id: number;
  study_term?: {
    id?: number;
    name?: string;
    name_ar?: string;
    name_en?: string;
  };
  cover?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ICreateSubjectPayload {
  name: string;
  about_subject: string;
  study_term_id: number;
  is_active: boolean;
  cover?: File | null;
}

export interface IUpdateSubjectPayload {
  name: string;
  about_subject: string;
  study_term_id: number;
  is_active: boolean;
  cover?: File | null;
}

export interface IApiMessageResponse {
  message: string;
}
