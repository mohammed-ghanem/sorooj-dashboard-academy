export interface Permission {
  id: number;
  name: string;
  key: string;        // e.g. "roles.create"
}

export interface PermissionState {
  record: Permission[];
  loading: boolean;
  error: string | null;
}


export interface PermissionGroup {
  name: string;
  controls: Permission[];
}