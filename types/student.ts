export interface IStudentCountry {
  id: number;
  name: string;
}

export interface IStudent {
  id: number;
  name: string;
  email: string;
  mobile: string;
  avatar: string | null;
  is_verified: boolean;
  type: string;
  is_active: boolean;
  country: IStudentCountry | null;
  date_of_birth: string | null;
  gender: string | null;
  genderLabel: string | null;
  educationLevel: string | null;
  educationLevelLabel: string | null;
  joinPurpose: string | null;
  joinPurposeLabel: string | null;
  enrollmentStatus: string | null;
  enrollmentStatusLabel: string | null;
  created_at: string | null;
}
