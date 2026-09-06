/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import {
  IDoctor,
  ICreateDoctorPayload,
  IUpdateDoctorPayload,
  IApiMessageResponse,
} from "@/types/doctor";

function parseIsActive(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "active", "yes"].includes(normalized)) return true;
    if (["0", "false", "inactive", "no", ""].includes(normalized)) return false;
    const numeric = Number(normalized);
    if (Number.isFinite(numeric)) return numeric === 1;
  }
  return false;
}

function normalizeDoctor(item: any): IDoctor {
  const doctor = item?.Doctor ?? item?.doctor ?? item?.user ?? item;
  const activeRaw =
    doctor?.is_active ??
    doctor?.isActive ??
    doctor?.status ??
    item?.is_active ??
    item?.isActive ??
    item?.status;

  return {
    id: Number(doctor?.id ?? item?.id) || 0,
    name: doctor?.name ?? "",
    email: doctor?.email ?? "",
    mobile: String(doctor?.mobile ?? ""),
    avatar: doctor?.avatar ?? null,
    position: doctor?.position ?? "",
    about_doctor: doctor?.about_doctor ?? "",
    specialization: doctor?.specialization ?? "",
    is_active: parseIsActive(activeRaw),
    created_at: doctor?.created_at,
    updated_at: doctor?.updated_at,
    message: item?.message ?? "",
  };
}

function pickDoctorFromPayload(response: any): any {
  const nested = response?.data ?? response;
  return (
    nested?.Doctor ??
    nested?.doctor ??
    nested?.data?.Doctor ??
    nested?.data?.doctor ??
    (Array.isArray(nested?.data) ? nested.data[0] : null) ??
    (nested?.id != null ? nested : null)
  );
}

function buildDoctorFormData(data: ICreateDoctorPayload | IUpdateDoctorPayload) {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("email", data.email);
  fd.append("mobile", data.mobile);
  fd.append("is_active", data.is_active ? "1" : "0");
  fd.append("position", data.position);
  fd.append("about_doctor", data.about_doctor);
  fd.append("specialization", data.specialization);

  if ("password" in data && data.password) {
    fd.append("password", data.password);
  }
  if ("password_confirmation" in data && data.password_confirmation) {
    fd.append("password_confirmation", data.password_confirmation);
  }
  if (data.avatar) {
    fd.append("avatar", data.avatar);
  }
  return fd;
}

export const doctorsApi = createApi({
  reducerPath: "doctorsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Doctors", "Doctor"],
  endpoints: (builder) => ({
    getDoctors: builder.query<IDoctor[], void>({
      query: () => ({
        url: "/doctors",
        method: "get",
        params: { page: 0, limit: 0 },
      }),
      transformResponse: (response: any) => {
        const d = response?.data ?? response;
        const raw =
          (Array.isArray(d?.data) ? d.data : null) ??
          d?.Doctors ??
          d?.doctors ??
          d?.data ??
          d ??
          [];

        return (Array.isArray(raw) ? raw : []).map(normalizeDoctor);
      },
      providesTags: ["Doctors"],
    }),

    getDoctorById: builder.query<IDoctor, number>({
      query: (id) => ({
        url: `/doctors/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw = pickDoctorFromPayload(response);
        if (!raw) {
          throw new Error("Doctor data not found");
        }
        return normalizeDoctor(raw);
      },
      providesTags: (_r, _e, id) => [{ type: "Doctor", id }],
    }),

    createDoctor: builder.mutation<{ message: string; data?: IDoctor }, ICreateDoctorPayload>({
      query: (data) => ({
        url: "/doctors",
        method: "post",
        data: buildDoctorFormData(data),
      }),
      invalidatesTags: ["Doctors"],
    }),

    updateDoctor: builder.mutation<
      { message: string; data?: IDoctor },
      { id: number; data: IUpdateDoctorPayload }
    >({
      query: ({ id, data }) => {
        const formData = buildDoctorFormData(data);
        formData.append("_method", "PUT");
        return {
          url: `/doctors/${id}`,
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: (_r, _e, { id }) => ["Doctors", { type: "Doctor", id }],
    }),

    deleteDoctor: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/doctors/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Doctors"],
    }),

    toggleDoctorStatus: builder.mutation<
      { message: string },
      { id: number; is_active: boolean; reason?: string }
    >({
      query: ({ id, is_active, reason }) => {
        const formData = new FormData();
        formData.append("is_active", is_active ? "1" : "0");
        formData.append(
          "reason",
          reason?.trim() || (is_active ? "activate" : "deactivate"),
        );
        return {
          url: `/doctors/status/${id}`,
          method: "post",
          data: formData,
        };
      },
      async onQueryStarted({ id, is_active }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          doctorsApi.util.updateQueryData("getDoctors", undefined, (draft: IDoctor[]) => {
            const row = draft.find((d) => d.id === id);
            if (row) {
              row.is_active = is_active;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_r, _e, { id }) => ["Doctors", { type: "Doctor", id }],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useToggleDoctorStatusMutation,
} = doctorsApi;
