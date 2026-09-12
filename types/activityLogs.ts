export interface IActivityLogCauser {
  id: number;
  name: string;
  email: string;
  type: string;
}

export interface IActivityLogSubject {
  type: string;
  type_name: string;
  id: number | null;
  label: string | null;
}

export type ActivityLogChangeValue = string | number | boolean | null;

export interface IActivityLogChange {
  old: ActivityLogChangeValue;
  new: ActivityLogChangeValue;
}

export interface IActivityLogProperties {
  action?: string | null;
  module?: string | null;
  relation?: string | null;
  role_id?: number | null;
  old_role_id?: number | null;
  password_changed?: boolean | null;
  old?: Record<string, ActivityLogChangeValue>;
  attributes?: Record<string, ActivityLogChangeValue>;
  changes?: Record<string, IActivityLogChange>;
}

export interface IActivityLog {
  id: number;
  description: string;
  event: string;
  action: string;
  module: string;
  log_name: string;
  batch_uuid: string | null;
  causer: IActivityLogCauser | null;
  subject: IActivityLogSubject | null;
  properties: IActivityLogProperties | null;
  created_at: string;
}
