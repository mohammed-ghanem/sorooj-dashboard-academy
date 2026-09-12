/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  IActivityLog,
  IActivityLogCauser,
  IActivityLogProperties,
  IActivityLogSubject,
} from "@/types/activityLogs";

function normalizeCauser(item: any): IActivityLogCauser | null {
  if (!item || typeof item !== "object") return null;
  return {
    id: Number(item.id) || 0,
    name: item.name ?? "",
    email: item.email ?? "",
    type: item.type ?? "",
  };
}

function normalizeSubject(item: any): IActivityLogSubject | null {
  if (!item || typeof item !== "object") return null;
  return {
    type: item.type ?? "",
    type_name: item.type_name ?? "",
    id: item.id == null ? null : Number(item.id),
    label: item.label ?? null,
  };
}

function normalizeProperties(item: any): IActivityLogProperties | null {
  if (!item || typeof item !== "object") return null;
  return {
    action: item.action ?? null,
    module: item.module ?? null,
    relation: item.relation ?? null,
    role_id: item.role_id ?? null,
    old_role_id: item.old_role_id ?? null,
    password_changed: item.password_changed ?? null,
    old: item.old ?? undefined,
    attributes: item.attributes ?? undefined,
    changes: item.changes ?? undefined,
  };
}

function normalizeActivityLog(item: any): IActivityLog {
  return {
    id: Number(item?.id) || 0,
    description: item?.description ?? "",
    event: item?.event ?? "",
    action: item?.action ?? "",
    module: item?.module ?? "",
    log_name: item?.log_name ?? "",
    batch_uuid: item?.batch_uuid ?? null,
    causer: normalizeCauser(item?.causer),
    subject: normalizeSubject(item?.subject),
    properties: normalizeProperties(item?.properties),
    created_at: item?.created_at ?? "",
  };
}

function extractList(res: any): any[] {
  const payload = res?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
}

function extractOne(res: any): any | null {
  const payload = res?.data;
  const candidate =
    payload?.data ??
    payload?.activity_log ??
    payload?.log ??
    payload ??
    res?.activity_log ??
    null;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }
  return candidate;
}

export const activityLogsApi = createApi({
  reducerPath: "activityLogsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ActivityLogs", "ActivityLog"],
  endpoints: (builder) => ({
    getActivityLogs: builder.query<IActivityLog[], void>({
      query: () => ({
        url: "/activity-logs",
        method: "get",
        params: {
          page: 0,
          limit: 0,
        },
      }),
      transformResponse: (res: any) =>
        extractList(res).map(normalizeActivityLog),
      providesTags: ["ActivityLogs"],
    }),

    getActivityLogById: builder.query<IActivityLog | null, number>({
      query: (id) => ({
        url: `/activity-logs/${id}`,
        method: "get",
      }),
      transformResponse: (res: any) => {
        const raw = extractOne(res);
        return raw ? normalizeActivityLog(raw) : null;
      },
      providesTags: (_result, _error, id) => [{ type: "ActivityLog", id }],
    }),
  }),
});

export const { useGetActivityLogsQuery, useGetActivityLogByIdQuery } =
  activityLogsApi;
