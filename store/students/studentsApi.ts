/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type { IStudent } from "@/types/student";
import type { IApiMessageResponse } from "@/types/academicYear";

function normalizeStudent(item: any): IStudent {
  return {
    id: Number(item?.id) || 0,
    name: item?.name ?? "",
    email: item?.email ?? "",
    mobile: String(item?.mobile ?? ""),
    avatar: item?.avatar ?? null,
    is_verified: Boolean(item?.is_verified),
    type: String(item?.type ?? "student"),
    is_active: Number(item?.is_active ?? 0) === 1,
    country:
      item?.country && item.country.id != null
        ? {
            id: Number(item.country.id),
            name: String(item.country.name ?? ""),
          }
        : null,
    date_of_birth: item?.date_of_birth ?? null,
    gender: item?.gender ?? null,
    genderLabel: item?._gender ?? null,
    educationLevel: item?.education_level ?? null,
    educationLevelLabel: item?._education_level ?? null,
    joinPurpose: item?.join_purpose ?? null,
    joinPurposeLabel: item?._join_purpose ?? null,
    enrollmentStatus: item?.enrollment_status ?? null,
    enrollmentStatusLabel: item?._enrollment_status ?? null,
    created_at: item?.created_at ?? null,
  };
}

function pickStudentFromResponse(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.Student ??
    nested?.student ??
    nested?.data?.Student ??
    nested?.data?.student ??
    (nested?.id != null && !Array.isArray(nested) ? nested : null) ??
    nested?.data
  );
}

export type IStudentsListParams = {
  name?: string;
  email?: string;
  mobile?: string;
  is_active?: 0 | 1;
};

export const studentsApi = createApi({
  reducerPath: "studentsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Students", "Student"],
  endpoints: (builder) => ({
    getStudents: builder.query<IStudent[], IStudentsListParams | void>({
      query: (params) => ({
        url: "/students",
        method: "get",
        params: {
          page: 0,
          limit: 0,
          ...params,
        },
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw =
          (Array.isArray(d?.data) ? d.data : null) ??
          d?.Students ??
          d?.students ??
          d?.data ??
          d ??
          [];
        const list = Array.isArray(raw) ? raw : [];
        return list.map(normalizeStudent);
      },
      providesTags: ["Students"],
    }),

    getStudentById: builder.query<IStudent, number>({
      query: (id) => ({
        url: `/students/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickStudentFromResponse(response);
        if (!raw || raw?.id == null) {
          throw new Error("Student data not found");
        }
        return normalizeStudent(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Student", id }],
    }),

    toggleStudentStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/students/status/${id}`,
        method: "post",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          studentsApi.util.updateQueryData(
            "getStudents",
            undefined,
            (draft: IStudent[]) => {
              const row = draft.find((s) => s.id === id);
              if (row) {
                row.is_active = !row.is_active;
              }
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_r, _e, id) => ["Students", { type: "Student", id }],
    }),

    deleteStudent: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/students/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Students"],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useToggleStudentStatusMutation,
  useDeleteStudentMutation,
} = studentsApi;
