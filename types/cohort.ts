export interface ICohort {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  start_date: string;
  end_date: string;
  start_date_hijri?: string;
  end_date_hijri?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ICreateCohortPayload {
  name_ar: string;
  name_en: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface IUpdateCohortPayload {
  name_ar: string;
  name_en: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface IApiMessageResponse {
  message: string;
}
