"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useGetProfileQuery } from "@/store/auth/authApi";
import { ACCESS_TOKEN_COOKIE, clearAuthSession } from "@/lib/authCookies";
import {
  handleSessionExpired,
  isVoluntaryLogout,
} from "@/lib/handleSessionExpired";
import { extractProfileUser } from "@/lib/profileUser";

type AuthSessionGuardProps = {
  children: ReactNode;
  lang: string;
};

export default function AuthSessionGuard({
  children,
  lang,
}: AuthSessionGuardProps) {
  const router = useRouter();
  const redirectedRef = useRef(false);
  const token = Cookies.get(ACCESS_TOKEN_COOKIE);

  const { data, isLoading, isFetching, isError } = useGetProfileQuery(
    undefined,
    {
      skip: !token,
    },
  );

  const redirectToLogin = useCallback(() => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    clearAuthSession();
    router.replace(`/${lang}/login`);
    router.refresh();
  }, [lang, router]);

  useEffect(() => {
    if (!token) {
      redirectToLogin();
      return;
    }

    if (isLoading || isFetching) return;

    if (isVoluntaryLogout()) {
      redirectToLogin();
      return;
    }

    const user = extractProfileUser(data);
    if (isError || !user) {
      handleSessionExpired();
    }
  }, [token, isLoading, isFetching, isError, data, redirectToLogin]);

  return <>{children}</>;
}
