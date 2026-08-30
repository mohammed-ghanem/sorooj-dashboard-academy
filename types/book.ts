export interface IBookAttachment {
  id: number;
  file_url?: string;
  name?: string;
}

export interface IBook {
  id: number;
  title: string;
  content: string;
  category_id: number;
  doctor_id: number;
  category?: {
    id?: number;
    name?: string;
  };
  doctor?: {
    id?: number;
    name?: string;
  };
  image?: string | null;
  attachments?: IBookAttachment[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ICreateBookPayload {
  title: string;
  content: string;
  category_id: number;
  doctor_id: number;
  is_active: boolean;
  image?: File | null;
  attachments: File[];
}

export interface IUpdateBookPayload {
  title: string;
  content: string;
  category_id: number;
  doctor_id: number;
  is_active: boolean;
  image?: File | null;
  attachments: File[];
}
