"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { pathWithoutLang } from "@/components/sidebar/sidebarLinks";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import TranslateHook from "@/translate/TranslateHook";

type PermissionRouteGuardProps = {
  children: ReactNode;
  lang: string;
};

export default function PermissionRouteGuard({
  children,
  lang,
}: PermissionRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const redirectedRef = useRef(false);
  const translate = TranslateHook();
  const { isReady, fullAccess, canAccessPath } = useUserPermissions();

  const deniedMessage =
    translate?.pages?.dashboard?.noPermission ??
    "You do not have permission to access this page.";

  useEffect(() => {
    if (!isReady || fullAccess) return;

    const path = pathWithoutLang(pathname, lang);
    if (canAccessPath(path)) return;

    if (redirectedRef.current) return;
    redirectedRef.current = true;

    toast.error(deniedMessage);
    router.replace(`/${lang}`);
  }, [
    pathname,
    lang,
    isReady,
    fullAccess,
    canAccessPath,
    router,
    deniedMessage,
  ]);

  useEffect(() => {
    redirectedRef.current = false;
  }, [pathname]);

  return <>{children}</>;
}
