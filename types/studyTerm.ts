export interface IStudyTerm {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  academic_year_id: number;
  // optional nested object if backend provides it
  academic_year?: {
    id?: number;
    name?: string;
    name_ar?: string;
    name_en?: string;
  };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ICreateStudyTermPayload {
  name_ar: string;
  name_en: string;
  academic_year_id: number;
  is_active: boolean;
}

export interface IUpdateStudyTermPayload {
  name_ar: string;
  name_en: string;
  academic_year_id: number;
  is_active: boolean;
}

export interface IApiMessageResponse {
  message: string;
}

