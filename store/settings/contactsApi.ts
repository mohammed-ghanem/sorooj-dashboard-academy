/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";

export interface IContact {
    id: number;
    name: string;
    email: string;
    mobile: string;
    message: string;
    type: string;
    type_label: string;
    created_at: string;
}

function normalizeContact(item: any): IContact {
    return {
        id: Number(item?.id),
        name: item?.name ?? "",
        email: item?.email ?? "",
        mobile: item?.mobile ?? "",
        message: item?.message ?? "",
        type: item?.type ?? "",
        type_label: item?._type ?? "",
        created_at: item?.created_at ?? "",
    };
}

export const contactsApi = createApi({
    reducerPath: "contactsApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Contacts"],
    endpoints: (builder) => ({

        /* ======================
           GET CONTACTS
        ====================== */
        getContacts: builder.query<IContact[], void>({
            query: () => ({
                url: "contacts",
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
                    [];

                return Array.isArray(raw)
                    ? raw.map(normalizeContact)
                    : [];
            },

            providesTags: ["Contacts"],
        }),
        //  delete contact mutation 

        deleteContact: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `contacts/${id}`,
                method: "delete",
            }),
            invalidatesTags: ["Contacts"],
        }),

    }),
});

export const { useGetContactsQuery, useDeleteContactMutation } = contactsApi;