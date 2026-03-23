/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";

export interface IContact {
    id: number;
    name: string;
    email: string;
    mobile: string;
    message: string;
    reply?: string | null;
    is_reply?: boolean;
    status?: string;
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
        reply: item?.reply ?? null,
        is_reply: item?.is_reply ?? false,
        status: item?.status ?? "",
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


        // reply to contact mutation
        replyContact: builder.mutation<
            { message: string },
            { id: number; reply: string }
        >({
            query: ({ id, reply }) => ({
                url: `contacts/reply/${id}`, // عدل حسب الباك اند عندك
                method: "post",
                data: { reply },
            }),
            invalidatesTags: ["Contacts"],
        }),

    }),
});

export const { useGetContactsQuery, useDeleteContactMutation, useReplyContactMutation } = contactsApi;