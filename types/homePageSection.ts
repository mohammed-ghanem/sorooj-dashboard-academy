export type HomePageSectionKey =
  | "features"
  | "goals"
  | "methodologies"
  | "study-levels";

export interface IHomePageItem {
  id: number;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  is_active: boolean;
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface IHomePageItemPayload {
  title: string;
  description: string;
  is_active: boolean;
  icon?: File | null;
  image?: File | null;
}
