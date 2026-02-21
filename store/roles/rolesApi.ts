/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import { Role } from "./types";

export const rolesApi = createApi({
  reducerPath: "rolesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Roles" , "Role"],
  endpoints: (builder) => ({

    /* ===================== GET ALL ROLES ===================== */

    getRoles: builder.query<Role[], void>({
      query: () => ({
        url: "/roles",
        method: "get",
        params: {
          page: 0,
          limit: 0,
        },
      }), 
      transformResponse: (res: any ) => {
        return (
          res?.data?.data?.roles ??
          res?.data?.roles ??
          res?.data?.data ??
          res?.roles ??
          []
        );
      },
      providesTags: ["Roles"],

      keepUnusedDataFor: 300, // five minutes

    }),

    /* ===================== GET ROLE BY ID ===================== */

    getRoleById: builder.query<Role | null, { id: number; lang: any }>({
      query: ({id}) => ({
        url: `/roles/${id}`,
        method: "get",
      }),
      transformResponse: (res: any) => {
        return (
          res?.data?.data?.role ??
          res?.data?.role ??
          res?.data?.data ??
          res?.role ??
          null
        );
      },
      providesTags: (result, error, arg) => [
        { type: "Role", id: arg.id },
      ],
      keepUnusedDataFor: 300,
    }),


    /* ===================== CREATE ROLE ===================== */
    createRole: builder.mutation<any, any>({
      query: (body) => ({
        url: "/roles",
        method: "post",
        data: {
          name: {
            ar: body.name_ar,
            en: body.name_en,
          },
          description: "",
          is_active: true,
          role_permissions: body.permissions,
        },
      }),
      invalidatesTags: ["Roles"],
    }),

    /* ===================== UPDATE ROLE ===================== */
    updateRole: builder.mutation<any, { id: number; body: any }>({
      query: ({ id, body }) => {
        const formData = new FormData();
        formData.append("_method", "put");
        formData.append("name[en]", body.name_en);
        formData.append("name[ar]", body.name_ar);


        body.permissions.forEach((p: number) =>
          formData.append("role_permissions[]", String(p))
        );

        return {
          url: `/roles/${id}`,
          method: "post",
          data: formData,
        };
      },
       invalidatesTags: (result, error, arg) => [
        "Roles",
        { type: "Role", id: arg.id },
      ],
      
    }),

    /* ===================== DELETE ROLE ===================== */
    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "delete",
      }),

      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          rolesApi.util.updateQueryData(
            "getRoles",
            undefined,
            (draft: Role[]) => {
              const index = draft.findIndex(
                (role) => role.id === id
              );
              if (index !== -1) {
                draft.splice(index, 1);
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),


    /* ===================== TOGGLE STATUS ===================== */
    toggleRoleStatus: builder.mutation<
      void,
      { id: number; is_active: boolean }
    >({
      query: ({ id, is_active }) => {
        const formData = new FormData();
        formData.append("is_active", is_active ? "1" : "0");

        return {
          url: `/roles/toggle-role/${id}`,
          method: "post",
          data: formData,
        };
      },

      invalidatesTags: (result, error, arg) => [
        { type: "Role", id: arg.id },
      ],

      async onQueryStarted(
        { id },
        { dispatch, queryFulfilled }

      ) {
        const patch = dispatch(
          rolesApi.util.updateQueryData(
            "getRoles",
            undefined,
            (draft: Role[]) => {
              const role = draft.find((r) => r.id === id);
              if (role) {
                role.is_active = role.is_active ? 0 : 1;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useToggleRoleStatusMutation,
} = rolesApi;
