export interface IDoctor {
  id: number;
  name: string;
  email: string;
  mobile: string;
  avatar?: string | null;
  position: string;
  about_doctor: string;
  specialization: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ICreateDoctorPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
  password_confirmation: string;
  avatar?: File | null;
  is_active: boolean;
  position: string;
  about_doctor: string;
  specialization: string;
}

export interface IUpdateDoctorPayload {
  name: string;
  email: string;
  mobile: string;
  password?: string;
  password_confirmation?: string;
  avatar?: File | null;
  is_active: boolean;
  position: string;
  about_doctor: string;
  specialization: string;
}

export interface IApiMessageResponse {
  message: string;
}
