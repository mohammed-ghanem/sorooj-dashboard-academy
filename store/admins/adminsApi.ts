/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import { IAdmin, ICreateAdminPayload, IUpdateAdminPayload, IApiMessageResponse } from "@/types/admins";

/* =======================
   NORMALIZER
======================= */
function normalizeItem(item: any): IAdmin {
  const user = item?.user ?? item;

  return {
    id: Number(user?.id) || 0,
    name: user?.name ?? "",
    email: user?.email ?? "",
    image: user?.image ?? null,
    mobile: user?.mobile ?? "",
    roles: user?.roles ?? user?.type ?? "",
    roles_ids: user?.roles_ids,
    is_active: Boolean(
      Number(user?.is_active ?? user?.isActive ?? 0)
    ),
    created_at: user?.created_at ?? user?.createdAt,
    updated_at: user?.updated_at ?? user?.updatedAt,
    message: item?.message ?? "",
  };
}

 
function normalizeAdmin(item: any): IAdmin {
  const user = item?.user ?? item;

  // fetch roles
  let roles_ids: number[] = [];

  if (user?.roles_ids) {
    if (Array.isArray(user.roles_ids)) {
      roles_ids = user.roles_ids.map((r: any) => Number(r.id));
    } else if (typeof user.roles_ids === 'object') {
      roles_ids = Object.values(user.roles_ids)
        .filter((r: any) => r && r.id)
        .map((r: any) => Number(r.id));
    }
  }

  return {
    id: Number(user?.id),
    name: user?.name ?? "",
    email: user?.email ?? "",
    image: user?.image ?? null,
    mobile: user?.mobile ?? "",
    roles: user?.roles ?? "",
    roles_ids, // old roles
    is_active: Number(user?.is_active) === 1,
    created_at: user?.created_at,
    updated_at: user?.updated_at,
    message: "",
  };
}

/* =======================
   API
======================= */
export const adminsApi = createApi({
  reducerPath: "adminsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Admins", "Admin"],
  endpoints: (builder) => ({

    /* =======================
       GET ADMINS
    ======================= */
    getAdmins: builder.query<IAdmin[], void>({
      query: () => ({
        url: "/admins",
        method: "get",
        params: {
          page: 0,
          limit: 0,
        },

      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.data ??
          response?.data ??
          response?.admins ??
          [];

        return Array.isArray(raw)
          ? raw.map(normalizeItem)
          : [];
      },
      providesTags: ["Admins"],
    }),

    /* =======================
       GET ADMIN BY ID (EDIT)
    ======================= */

    getAdminById: builder.query<IAdmin, number>({
      query: (id) => ({
        url: `/admins/${id}`,
        method: "get",
      }),
      transformResponse: (response: any) => {
        const raw =
          response?.data?.Admin ??
          response?.data?.data ??
          response?.data?.data?.user ??
          response?.data?.user;

        if (!raw) {
          throw new Error("Admin data not found");
        }

        return normalizeAdmin(raw);
      },
      providesTags: (_r, _e, id) => [
        { type: "Admin", id },
      ],
    }),




    /* =======================
       CREATE ADMIN
    ======================= */
    createAdmin: builder.mutation<
      { message: string; data?: IAdmin },
      ICreateAdminPayload
    >({
      query: (data) => {
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("mobile", data.mobile);
        formData.append("password", data.password);
        formData.append(
          "password_confirmation",
          data.password_confirmation
        );
        formData.append(
          "is_active",
          data.is_active ? "1" : "0"
        );

        data.role_id.forEach((id) =>
          formData.append("role_id[]", String(id))
        );

        return {
          url: "/admins",
          method: "post",
          data: formData,
        };
      },
      invalidatesTags: ["Admins"],
    }),

    /* =======================
       UPDATE ADMIN (EDIT)
    ======================= */
    updateAdmin: builder.mutation<
      { message: string; data?: IAdmin },
      { id: number; data: IUpdateAdminPayload }
    >({
      query: ({ id, data }) => {
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("mobile", data.mobile);
        formData.append(
          "is_active",
          data.is_active ? "1" : "0"
        );

        data.role_id.forEach((rid) =>
          formData.append("role_id[]", String(rid))
        );

        return {
          url: `/admins/${id}`,
          method: "put",
          data: formData,
        };
      },
      invalidatesTags: (_r, _e, { id }) => [
        "Admins",
        { type: "Admin", id },
      ],
    }),

    /* =======================
       DELETE ADMIN
    ======================= */
    deleteAdmin: builder.mutation<IApiMessageResponse, number>({
      query: (id) => ({
        url: `/admins/${id}`,
        method: "delete",
      }),
      invalidatesTags: ["Admins"],
    }),

    /* =======================
       TOGGLE STATUS (OPTIMISTIC)
    ======================= */
    toggleAdminStatus: builder.mutation<
      { message: string },
      number
    >({
      query: (id) => ({
        url: `/admins/status/${id}`,
        method: "post",
      }),

      async onQueryStarted(
        id,
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          adminsApi.util.updateQueryData(
            "getAdmins",
            undefined,
            (draft: any[]) => {
              const admin = draft.find(
                (a) => a.id === id
              );
              if (admin) {
                admin.is_active = !admin.is_active;
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

      invalidatesTags: ["Admins"],
    }),
  }),
});

/* =======================
   EXPORT HOOKS
======================= */
export const {
  useGetAdminsQuery,
  useGetAdminByIdQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useToggleAdminStatusMutation,
} = adminsApi;