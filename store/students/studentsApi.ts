/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import type {
  IReEnrollmentOption,
  IReEnrollmentOptionsResponse,
  IStudent,
  IStudentAcademicYear,
  IStudentCertificate,
  IStudentCertificateTab,
  IStudentDateRange,
  IStudentNamedRef,
} from "@/types/student";
import type { IApiMessageResponse } from "@/types/academicYear";

function asNamedRef(item: any): IStudentNamedRef | null {
  if (!item || item.id == null) return null;
  return {
    id: Number(item.id) || 0,
    name: String(item.name ?? ""),
  };
}

/** Accepts `[{id,name}]`, `[{study_term:{id,name}}]`, ids, or plain names. */
function asNamedRefList(value: any): IStudentNamedRef[] {
  if (!Array.isArray(value)) return [];
  const out: IStudentNamedRef[] = [];
  const seen = new Set<string>();
  value.forEach((raw, index) => {
    let id = 0;
    let name = "";
    if (typeof raw === "string") {
      name = raw.trim();
    } else if (typeof raw === "number") {
      id = raw;
    } else if (raw && typeof raw === "object") {
      const inner = raw.study_term ?? raw.studyTerm ?? raw;
      id = Number(inner?.id ?? raw?.study_term_id ?? 0) || 0;
      name = String(
        inner?.name ?? inner?._name ?? inner?.name_ar ?? inner?.title ?? "",
      ).trim();
    }
    const key = id ? `id:${id}` : `name:${name || index}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ id, name });
  });
  return out;
}

function asDateRange(item: any): IStudentDateRange | null {
  if (!item || typeof item !== "object") return null;
  const start = item.start_date ?? null;
  const end = item.end_date ?? null;
  if (!start && !end) return null;
  return { start_date: start, end_date: end };
}

function asAcademicYear(item: any): IStudentAcademicYear | null {
  if (!item || item.id == null) return null;
  return {
    id: Number(item.id) || 0,
    sequence: Number(item.sequence ?? 0),
    sequenceLabel: String(item._sequence ?? ""),
    start_date: item.start_date ?? null,
    end_date: item.end_date ?? null,
  };
}

function asBool(value: unknown): boolean | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;
  return Boolean(value);
}

function normalizeCertificate(item: any): IStudentCertificate {
  return {
    id: Number(item?.id) || 0,
    group: String(item?.group ?? ""),
    groupLabel: String(item?._group ?? ""),
    type: String(item?.type ?? ""),
    typeLabel: String(item?._type ?? ""),
    title: String(item?.title ?? ""),
    displayTitle: String(item?.display_title ?? item?.title ?? ""),
    studentName: String(item?.student_name ?? ""),
    serialNumber: String(item?.serial_number ?? ""),
    issuedAt: item?.issued_at ?? null,
    issuedAtLabel: item?._issued_at ?? null,
    imageUrl: item?.image_url ? String(item.image_url) : null,
    pdfUrl: item?.pdf_url ? String(item.pdf_url) : null,
    hasFiles: Boolean(item?.has_files),
    downloadUrl: item?.download_url ? String(item.download_url) : null,
  };
}

function normalizeCertificateTab(item: any): IStudentCertificateTab {
  const certificates = Array.isArray(item?.certificates)
    ? item.certificates.map(normalizeCertificate)
    : [];
  return {
    key: String(item?.key ?? ""),
    label: String(item?.label ?? ""),
    count: Number(item?.count ?? certificates.length) || 0,
    certificates,
  };
}

function normalizeStudent(item: any): IStudent {
  const certificates = Array.isArray(item?.certificates)
    ? item.certificates.map(normalizeCertificate)
    : [];
  const tabs = Array.isArray(item?.tabs)
    ? item.tabs.map(normalizeCertificateTab)
    : [];

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
    enrolled_at: item?.enrolled_at ?? null,
    cohort: asNamedRef(item?.cohort),
    academic_year: asAcademicYear(item?.academic_year),
    study_term: asNamedRef(item?.study_term),
    makeup_exam_period: asDateRange(item?.makeup_exam_period),
    progressPhase: item?.progress_phase ?? null,
    progressPhaseLabel: item?._progress_phase ?? null,
    carried_over_study_terms: asNamedRefList(item?.carried_over_study_terms),
    can_re_enroll: asBool(item?.can_re_enroll) === true,
    has_passed: asBool(item?.has_passed),
    has_completed_program: asBool(item?.has_completed_program),
    has_program_completion_certificate: asBool(
      item?.has_program_completion_certificate,
    ),
    certificates_count: Number(item?.certificates_count ?? certificates.length) || 0,
    academy_count: Number(item?.academy_count ?? 0) || 0,
    independent_count: Number(item?.independent_count ?? 0) || 0,
    tabs,
    certificates,
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

function extractStudentsList(response: any): any[] {
  if (response == null) return [];
  const d = response?.data ?? response;
  const raw =
    (Array.isArray(d?.data) ? d.data : null) ??
    (Array.isArray(d?.data?.data) ? d.data.data : null) ??
    d?.Students ??
    d?.students ??
    (Array.isArray(d) ? d : null) ??
    (Array.isArray(response) ? response : null) ??
    d?.data ??
    [];
  return Array.isArray(raw) ? raw : [];
}

export type IStudentsListParams = {
  name?: string;
  email?: string;
  mobile?: string;
  is_active?: 0 | 1;
  progress_phase?: string;
};

function pickName(obj: any): string {
  if (!obj || typeof obj !== "object") return "";
  const candidates = [
    obj.name,
    obj.cohort_name,
    obj._name,
    obj.label,
    obj.title,
    obj.display_name,
    obj.name_ar,
    obj.name_en,
    obj.name?.ar,
    obj.name?.en,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return "";
}

function normalizeReEnrollmentOption(item: any): IReEnrollmentOption {
  const cohort = item?.cohort ?? null;
  const id = Number(
    item?.cohort_id ?? cohort?.id ?? item?.id ?? item?.value ?? 0,
  );
  const label = pickName(item) || pickName(cohort);
  const ay = item?.academic_year ?? cohort?.academic_year;
  const start = item?.start_date ?? cohort?.start_date;
  const end = item?.end_date ?? cohort?.end_date;
  const description = [ay?._sequence, start && end ? `${start} → ${end}` : ""]
    .filter(Boolean)
    .join(" · ");
  return { id, label, description };
}

export const studentsApi = createApi({
  reducerPath: "studentsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Students", "Student"],
  endpoints: (builder) => ({
    getStudents: builder.query<IStudent[], IStudentsListParams | void>({
      async queryFn(params, _queryApi, _extraOptions, baseQuery) {
        const queryParams = {
          page: 0,
          limit: 0,
          per_page: 0,
          ...(params || {}),
        };

        const firstResult = await baseQuery({
          url: "/students",
          method: "get",
          params: queryParams,
        });

        if (firstResult.error) {
          return { error: firstResult.error as any };
        }

        const body = firstResult.data as any;
        let allRaw = extractStudentsList(body);

        const meta = body?.meta ?? body?.data?.meta ?? body;
        const lastPage = Number(meta?.last_page ?? 1);
        const total = Number(meta?.total ?? allRaw.length);

        if (lastPage > 1 && allRaw.length < total) {
          const promises = [];
          for (let p = 2; p <= lastPage; p++) {
            promises.push(
              baseQuery({
                url: "/students",
                method: "get",
                params: {
                  ...queryParams,
                  page: p,
                },
              }),
            );
          }

          const results = await Promise.all(promises);
          for (const res of results) {
            if (res.data) {
              const pageItems = extractStudentsList(res.data);
              allRaw = allRaw.concat(pageItems);
            }
          }
        }

        // Deduplicate in case of overlapping rows
        const seen = new Set<number>();
        const uniqueRaw: any[] = [];
        for (const item of allRaw) {
          const id = Number(item?.id);
          if (id && !seen.has(id)) {
            seen.add(id);
            uniqueRaw.push(item);
          } else if (!id) {
            uniqueRaw.push(item);
          }
        }

        const list = uniqueRaw.map(normalizeStudent);
        return { data: list };
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

    changeStudentEnrollment: builder.mutation<
      { message: string; student: IStudent },
      number
    >({
      query: (id) => ({
        url: `/students/enrollment/${id}`,
        method: "post",
      }),
      transformResponse: (response: any) => {
        const raw = pickStudentFromResponse(response);
        const message =
          response?.message ??
          response?.data?.message ??
          "Enrollment updated successfully";
        return {
          message: String(message),
          student: raw ? normalizeStudent(raw) : ({} as IStudent),
        };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (!data.student?.id) {
            dispatch(studentsApi.util.invalidateTags(["Students", { type: "Student", id }]));
            return;
          }

          dispatch(
            studentsApi.util.updateQueryData(
              "getStudents",
              undefined,
              (draft: IStudent[]) => {
                const index = draft.findIndex((s) => s.id === id);
                if (index !== -1) {
                  draft[index] = data.student;
                }
              },
            ),
          );
        } catch {
          // Error toast handled in UI.
        }
      },
      invalidatesTags: (_r, _e, id) => ["Students", { type: "Student", id }],
    }),

    getReEnrollmentOptions: builder.query<IReEnrollmentOptionsResponse, number>({
      query: (id) => ({
        url: `/students/${id}/re-enrollment-options`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw = Array.isArray(d?.options)
          ? d.options
          : Array.isArray(d)
            ? d
            : [];
        return {
          options: raw
            .map(normalizeReEnrollmentOption)
            .filter((o: IReEnrollmentOption) => o.id > 0),
          message: String(d?.message ?? ""),
        };
      },
      keepUnusedDataFor: 0,
    }),

    reEnrollStudent: builder.mutation<
      IApiMessageResponse,
      { id: number; cohort_id: number }
    >({
      query: ({ id, cohort_id }) => ({
        url: `/students/re-enroll/${id}`,
        method: "post",
        data: { cohort_id },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Students",
        { type: "Student", id },
      ],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useToggleStudentStatusMutation,
  useDeleteStudentMutation,
  useChangeStudentEnrollmentMutation,
  useLazyGetReEnrollmentOptionsQuery,
  useReEnrollStudentMutation,
} = studentsApi;
