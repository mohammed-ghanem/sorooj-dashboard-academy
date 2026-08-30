export interface IScientificTrackCategory {
  id: number;
  name: string;
  about_category: string;
  sort_order?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ICreateScientificTrackCategoryPayload {
  name: string;
  about_category: string;
  is_active: boolean;
}

export interface IUpdateScientificTrackCategoryPayload {
  name: string;
  about_category: string;
  is_active: boolean;
}
