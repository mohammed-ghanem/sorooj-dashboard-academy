/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  IAcademicYear,
  ICreateAcademicYearPayload,
  IUpdateAcademicYearPayload,
  IApiMessageResponse,
} from "@/types/academicYear";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

function normalizeAcademicYear(item: any): IAcademicYear {
  const localized = parseLocalizedNameFromModel(item);
  return {
    id: Number(item?.id) || 0,
    name: localized.name,
    name_ar: localized.name_ar,
    name_en: localized.name_en,
    is_active: Boolean(
      item?.is_active === true || Number(item?.is_active ?? 0) === 1
    ),
    created_at: item?.created_at,
    updated_at: item?.updated_at,
    message: item?.message ?? "",
  };
}

function buildAcademicYearFormData(
  data: ICreateAcademicYearPayload | IUpdateAcademicYearPayload
) {
  const fd = new FormData();
  fd.append("name[ar]", data.name_ar);
  fd.append("name[en]", data.name_en);
  fd.append("is_active", data.is_active ? "1" : "0");
  return fd;
}

function pickAcademicYearFromPayload(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.AcademicYear ??
    nested?.academic_year ??
    nested?.data?.AcademicYear ??
    nested?.data?.academic_year ??
    (Array.isArray(nested?.data) ? nested.data[0] : null) ??
    (nested?.id != null ? nested : null)
  );
}

export const academicYearsApi = createApi({
  reducerPath: "academicYearsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AcademicYears", "AcademicYear"],
  endpoints: (builder) => ({
    getAcademicYears: builder.query<IAcademicYear[], void>({
      query: () => ({
        url: "/academic-years",
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
          d?.AcademicYears ??
          d?.academic_years ??
          d?.academicYears ??
          d?.data ??
          d ??
          [];

        const list = Array.isArray(raw) ? raw : [];
        return list.map(normalizeAcademicYear);
      },
      providesTags: ["AcademicYears"],
    }),

    getAcademicYearById: builder.query<IAcademicYear, number>({
      query: (id) => ({
        url: `/academic-years/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickAcademicYearFromPayload(response);

        if (!raw) {
          throw new Error("Academic year data not found");
        }

        return normalizeAcademicYear(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "AcademicYear", id }],
    }),

    createAcademicYear: builder.mutation<
      { message: string; data?: IAcademicYear },
      ICreateAcademicYearPayload
    >({
      query: (data) => ({
        url: "/academic-years",
        method: "post",
        data: buildAcademicYearFormData(data),
      }),
      invalidatesTags: ["AcademicYears"],
    }),

    updateAcademicYear: builder.mutation<
      { message: string; data?: IAcademicYear },
      { id: number; data: IUpdateAcademicYearPayload }
    >({
      query: ({ id, data }) => ({
        url: `/academic-years/${id}`,
        method: "put",
        data: buildAcademicYearFormData(data),
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "AcademicYears",
        { type: "AcademicYear", id },
      ],
    }),

    deleteAcademicYear: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/academic-years/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["AcademicYears"],
    }),

    toggleAcademicYearStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/academic-years/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          academicYearsApi.util.updateQueryData(
            "getAcademicYears",
            undefined,
            (draft: IAcademicYear[]) => {
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
      invalidatesTags: ["AcademicYears"],
    }),
  }),
});

export const {
  useGetAcademicYearsQuery,
  useGetAcademicYearByIdQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
  useDeleteAcademicYearMutation,
  useToggleAcademicYearStatusMutation,
} = academicYearsApi;
