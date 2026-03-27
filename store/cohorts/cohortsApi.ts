/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  ICohort,
  ICreateCohortPayload,
  IUpdateCohortPayload,
  IApiMessageResponse,
} from "@/types/cohort";

function normalizeCohort(item: any): ICohort {
  return {
    id: Number(item?.id) || 0,
    name: item?.name ?? "",
    name_ar: item?.name_ar ?? "",
    name_en: item?.name_en ?? "",
    start_date: item?.start_date ?? "",
    end_date: item?.end_date ?? "",
    start_date_hijri: item?.start_date_hijri,
    end_date_hijri: item?.end_date_hijri,
    is_active: Boolean(
      item?.is_active === true || Number(item?.is_active ?? 0) === 1
    ),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
    message: item?.message ?? "",
  };
}

/** Laravel expects the same keys as Postman (form body). Use FormData so axios
 *  drops default `application/json` and sends multipart — URLSearchParams was
 *  sent with JSON Content-Type and the server saw empty fields. */
function buildCohortFormData(data: ICreateCohortPayload | IUpdateCohortPayload) {
  const fd = new FormData();
  fd.append("name[ar]", data.name_ar);
  fd.append("name[en]", data.name_en);
  fd.append("start_date", data.start_date);
  fd.append("end_date", data.end_date);
  fd.append("is_active", data.is_active ? "1" : "0");
  return fd;
}

/** GET show/update responses nest the model under `data.Cohort` (see API JSON). */
function pickCohortFromPayload(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.Cohort ??
    nested?.cohort ??
    nested?.data?.Cohort ??
    nested?.data?.cohort ??
    (Array.isArray(nested?.data) ? nested.data[0] : null) ??
    (nested?.id != null ? nested : null)
  );
}

export const cohortsApi = createApi({
  reducerPath: "cohortsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Cohorts", "Cohort"],
  endpoints: (builder) => ({
    getCohorts: builder.query<ICohort[], void>({
      query: () => ({
        url: "/cohorts",
        method: "get",
        params: {
          page: 0,
          limit: 0,
        },
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw =
          (Array.isArray(d?.data) ? d.data : null) ??
          d?.data?.data ??
          d?.Cohorts ??
          d?.cohorts ??
          d?.data ??
          d ??
          [];

        const list = Array.isArray(raw) ? raw : [];
        return list.map(normalizeCohort);
      },
      providesTags: ["Cohorts"],
    }),

    getCohortById: builder.query<ICohort, number>({
      query: (id) => ({
        url: `/cohorts/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickCohortFromPayload(response);

        if (!raw) {
          throw new Error("Cohort data not found");
        }

        return normalizeCohort(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Cohort", id }],
    }),

    createCohort: builder.mutation<
      { message: string; data?: ICohort },
      ICreateCohortPayload
    >({
      query: (data) => ({
        url: "/cohorts",
        method: "post",
        data: buildCohortFormData(data),
      }),
      invalidatesTags: ["Cohorts"],
    }),

    updateCohort: builder.mutation<
      { message: string; data?: ICohort },
      { id: number; data: IUpdateCohortPayload }
    >({
      query: ({ id, data }) => ({
        url: `/cohorts/${id}`,
        method: "put",
        data: buildCohortFormData(data),
      }),
      invalidatesTags: (_r, _e, { id }) => ["Cohorts", { type: "Cohort", id }],
    }),

    deleteCohort: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/cohorts/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Cohorts"],
    }),

    toggleCohortStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/cohorts/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cohortsApi.util.updateQueryData(
            "getCohorts",
            undefined,
            (draft: ICohort[]) => {
              const row = draft.find((c) => c.id === id);
              if (row) {
                row.is_active = !row.is_active;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Cohorts"],
    }),
  }),
});

export const {
  useGetCohortsQuery,
  useGetCohortByIdQuery,
  useCreateCohortMutation,
  useUpdateCohortMutation,
  useDeleteCohortMutation,
  useToggleCohortStatusMutation,
} = cohortsApi;
