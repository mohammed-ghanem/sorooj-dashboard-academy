import type { CategoryModuleType } from "@/constants/categoryModules";

export interface IBookCategory {
  id: number;
  name: string;
  about_category: string;
  type?: CategoryModuleType | string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ICreateBookCategoryPayload {
  name: string;
  about_category: string;
  is_active: boolean;
}

export interface IUpdateBookCategoryPayload {
  name: string;
  about_category: string;
  is_active: boolean;
}
