/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { axiosBaseQuery } from "@/store/base/axiosBaseQuery";


export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Profile"],
    endpoints: (builder) => ({

        // ---------------- LOGIN ----------------
        login: builder.mutation<any, { email: string; password: string }>({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                data: body,
                withCsrf: true,
            }),
            async onQueryStarted(_, { queryFulfilled }) {

                const { data }: any = await queryFulfilled;

                const token = data?.data?.access_token;
                if (token) {
                    Cookies.set("access_token", token, {
                        expires: 7,
                        secure: process.env.NODE_ENV === "production",
                    });
                }
            },
        }),
        // ---------------- LOGOUT ----------------
        logout: builder.mutation<any, void>({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
                auth: true, // لإضافة Authorization header
                withCsrf: true, // للـ CSRF protection
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    console.log("✅ Logout successful");

                    // يمكنك هنا تنظيف أي بيانات cached أخرى إذا لزم الأمر
                    dispatch(authApi.util.invalidateTags(['Profile']));
                } catch (error) {
                    console.error("❌ Logout failed:", error);
                }
            },
        }),
        // ---------------- SEND RESET CODE ----------------
        sendResetCode: builder.mutation<any, { email: string }>({
            query: (body) => ({
                url: "/auth/forget-password",
                method: "POST",
                data: body,
                withCsrf: true,
            }),
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data }: any = await queryFulfilled;
                    console.log("📩 Send reset code response:", data);

                    // حفظ token في cookies
                    const token = data?.data?.access_token;
                    if (token) {
                        console.log("💾 Saving reset token:", token);
                        Cookies.set("reset_token", token, {
                            expires: 1,
                            secure: process.env.NODE_ENV === "production",
                            path: "/",
                        });
                    }
                } catch (error) {
                    console.error("Failed to send reset code:", error);
                }
            },
        }),

        // ---------------- VERIFY CODE ----------------
        verifyCode: builder.mutation<any, { code: string }>({
            query: (body) => {
                // الحصول على token من cookies
                const token = Cookies.get("reset_token");
                console.log("🔑 Using reset_token for verify:", token ? "YES" : "NO");

                return {
                    url: "/auth/verify-otp",
                    method: "POST",
                    data: {
                        code: body.code,
                        // بعض backends تتطلب email أيضاً
                        email: Cookies.get("reset_email") || ""
                    },
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    withCsrf: true,
                };
            },
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    console.log("🚀 Starting verifyCode with:", arg);
                    const { data }: any = await queryFulfilled;
                    console.log("✅ Verify OTP success:", data);

                    // إذا كان هناك token جديد، احفظه
                    const newToken = data?.data?.access_token || data?.access_token;
                    if (newToken) {
                        console.log("🔄 New token received:", newToken);
                        Cookies.set("reset_token", newToken, {
                            expires: 1,
                            secure: process.env.NODE_ENV === "production",
                            path: "/",
                        });
                    }
                } catch (error: any) {
                    console.error("❌ Verify OTP failed:", error);
                    console.error("Error details:", error?.error || error);
                }
            },
        }),
        // ---------------- RESEND OTP ----------------
        resendOtp: builder.mutation<any, { email: string }>({
            query: (body) => {
                const token = Cookies.get("reset_token");

                return {
                    url: "/auth/resend-otp", // تأكد أنه نفس الموجود في Postman
                    method: "POST",
                    data: { email: body.email },
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : undefined,
                    withCsrf: true,
                };
            },
        }),

        // ---------------- RESET PASSWORD ----------------
        resetPassword: builder.mutation<
            any,
            { email: string; code: string; password: string; password_confirmation: string }
        >({
            query: (body) => {
                const token = Cookies.get("reset_token");
                return {
                    url: "/auth/reset-password",
                    method: "POST",
                    data: body,
                    headers: token ? {
                        Authorization: `Bearer ${token}`,
                    } : undefined,
                    withCsrf: true,  // ✅ هذا مهم
                };
            },
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    Cookies.remove("reset_token");
                } catch (error) {
                    console.error("Reset password failed:", error);
                }
            },
        }),

        // ---------------- CHANGE PASSWORD ----------------
        changePassword: builder.mutation<
            any,
            {
                old_password: string;
                password: string;
                password_confirmation: string;
            }
        >({
            query: (body) => ({
                url: "/auth/change-password",
                method: "POST",
                data: body,
                auth: true,
                withCsrf: true,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data }: any = await queryFulfilled;

                    // 1. إذا كان هناك access_token جديد في الاستجابة، قم بتحديثه
                    const newToken = data?.data?.access_token || data?.access_token;
                    if (newToken) {
                        Cookies.set("access_token", newToken, {
                            expires: 7,
                            secure: process.env.NODE_ENV === "production",
                            path: "/",
                        });
                        console.log("✅ Access token updated after password change");
                    }
                    // get data for user for update cache
                    dispatch(authApi.util.invalidateTags(['Profile']));

                } catch (error) {
                    console.error("❌ Password change failed:", error);
                }
            },
        }),

        // ---------------- GET PROFILE ----------------
        getProfile: builder.query<any, void>({
            query: () => ({
                url: "/auth/profile",
                method: "GET",
                auth: true, // add Authorization header automatically
            }),
            transformResponse: (response: any) => {

                if (response?.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: ["Profile"], // update caching for this query

        }),

        // ---------------- UPDATE PROFILE ----------------
        updateProfile: builder.mutation<
            any,
            FormData
            
        >({
            query: (body) => ({
                url: "/auth/update-profile",
                method: "POST",
                data: body,
                auth: true, // سيضيف Authorization header تلقائياً
                withCsrf: true, // لإضافة CSRF token
                headers: {
                    "Content-Type": "multipart/form-data", // تأكد من أن نوع المحتوى هو multipart/form-data
                    
                },
            }),
            invalidatesTags: ["Profile"], // يلغي cache البروفايل بعد التحديث
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    console.log("✅ Profile updated successfully:", data);
                } catch (error) {
                    console.error("❌ Failed to update profile:", error);
                }
            },
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useSendResetCodeMutation,
    useVerifyCodeMutation,
    useResetPasswordMutation,
    useChangePasswordMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
    useResendOtpMutation,
} = authApi;
