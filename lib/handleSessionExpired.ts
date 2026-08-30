import Cookies from "js-cookie";
import { toast } from "sonner";
import { clearAuthSession } from "@/lib/authCookies";

let redirecting = false;
let voluntaryLogout = false;

export function markVoluntaryLogout() {
  voluntaryLogout = true;
}

export function isVoluntaryLogout() {
  return voluntaryLogout;
}

const PUBLIC_AUTH_PATHS = [
  "/login",
  "/forget-password",
  "/verify-code",
  "/reset-password",
];

const PUBLIC_AUTH_API = [
  "/auth/login",
  "/auth/logout",
  "/auth/forget-password",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/reset-password",
];

export function isPublicAuthApiUrl(url: string) {
  const path = url.split("?")[0];
  return PUBLIC_AUTH_API.some(
    (endpoint) => path === endpoint || path.endsWith(endpoint),
  );
}

export function isUnauthenticatedError(status?: number, data?: unknown) {
  if (status === 401) return true;

  const text = JSON.stringify(data ?? "").toLowerCase();
  return text.includes("unauthenticated");
}

export function handleSessionExpired(options?: { requestUrl?: string }) {
  if (typeof window === "undefined") return;
  if (redirecting || voluntaryLogout) return;
  if (options?.requestUrl && isPublicAuthApiUrl(options.requestUrl)) return;

  const path = window.location.pathname;
  if (PUBLIC_AUTH_PATHS.some((page) => path.includes(page))) return;

  redirecting = true;
  clearAuthSession();

  const lang = Cookies.get("lang") === "en" ? "en" : "ar";
  toast.error(
    lang === "ar"
      ? "انتهت الجلسة. سجّل الدخول مرة أخرى."
      : "Your session has ended. Please sign in again.",
  );

  window.location.assign(`/${lang}/login`);
}
