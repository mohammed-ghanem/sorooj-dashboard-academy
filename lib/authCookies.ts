import Cookies from "js-cookie";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const OTP_LOGIN_COOKIE = "otp_login";
export const ACCESS_TOKEN_EXPIRES_DAYS = 1;

export function setAccessToken(token: string) {
  Cookies.set(ACCESS_TOKEN_COOKIE, token, {
    expires: ACCESS_TOKEN_EXPIRES_DAYS,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export function clearAuthSession() {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
  Cookies.remove("reset_token", { path: "/" });
  Cookies.remove("user", { path: "/" });
  Cookies.remove(OTP_LOGIN_COOKIE, { path: "/" });

  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("auth_state");
  }
}
