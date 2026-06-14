export interface IAcademicYear {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  program_sequence: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ICreateAcademicYearPayload {
  name_ar: string;
  name_en: string;
  program_sequence: number;
  is_active: boolean;
}

export interface IUpdateAcademicYearPayload {
  name_ar: string;
  name_en: string;
  program_sequence: number;
  is_active: boolean;
}

export interface IApiMessageResponse {
  message: string;
}
