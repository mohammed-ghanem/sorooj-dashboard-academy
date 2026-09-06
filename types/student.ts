export interface IStudentCountry {
  id: number;
  name: string;
}

export interface IStudentNamedRef {
  id: number;
  name: string;
}

export interface IStudentAcademicYear {
  id: number;
  sequence: number;
  sequenceLabel: string;
  start_date: string | null;
  end_date: string | null;
}

export interface IStudentDateRange {
  start_date: string | null;
  end_date: string | null;
}

export interface IStudentCertificate {
  id: number;
  group: string;
  groupLabel: string;
  type: string;
  typeLabel: string;
  title: string;
  displayTitle: string;
  studentName: string;
  serialNumber: string;
  issuedAt: string | null;
  issuedAtLabel: string | null;
  imageUrl: string | null;
  pdfUrl: string | null;
  hasFiles: boolean;
  downloadUrl: string | null;
}

export interface IStudentCertificateTab {
  key: string;
  label: string;
  count: number;
  certificates: IStudentCertificate[];
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
  enrolled_at: string | null;
  cohort: IStudentNamedRef | null;
  academic_year: IStudentAcademicYear | null;
  study_term: IStudentNamedRef | null;
  makeup_exam_period: IStudentDateRange | null;
  progressPhase: string | null;
  progressPhaseLabel: string | null;
  has_passed: boolean | null;
  has_completed_program: boolean | null;
  has_program_completion_certificate: boolean | null;
  certificates_count: number;
  academy_count: number;
  independent_count: number;
  tabs: IStudentCertificateTab[];
  certificates: IStudentCertificate[];
  created_at: string | null;
}
