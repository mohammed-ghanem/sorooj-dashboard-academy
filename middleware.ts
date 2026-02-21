import { NextResponse, type NextRequest } from "next/server";
import { i18n } from "@/i18n-config";
import { defaultLocale } from "./constants/locales";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  /* =====================
     تجاهل static / api
  ====================== */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const resetToken = request.cookies.get("reset_token")?.value;
  const resetDone = request.cookies.get("reset_done")?.value;

  const localeInPath = i18n.locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );

  /* =====================================================
     1️⃣ بدون locale
  ====================================================== */
  if (!localeInPath) {
    const publicRoutes = ["/login", "/forget-password"];

    const isPublic = publicRoutes.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );

    const isVerifyPage = pathname === "/verify-code";
    const isResetPage = pathname === "/reset-password";

    // verify / reset بدون reset_token
    if ((isVerifyPage || isResetPage) && !resetToken) {
      return NextResponse.redirect(
        new URL(`/forget-password${search}`, request.url)
      );
    }

    // منع الرجوع لـ verify بعد reset
    if (isVerifyPage && resetDone) {
      return NextResponse.redirect(
        new URL(`/login${search}`, request.url)
      );
    }

    // غير مسجل
    if (!accessToken && !isPublic && !isVerifyPage && !isResetPage) {
      return NextResponse.redirect(
        new URL(`/login${search}`, request.url)
      );
    }

    // مسجل ويحاول دخول public
    if (accessToken && isPublic) {
      return NextResponse.redirect(new URL(`/`, request.url));
    }

    const res = NextResponse.rewrite(
      new URL(`/${defaultLocale}${pathname}${search}`, request.url)
    );
    res.cookies.set("lang", defaultLocale, { path: "/" });
    return res;
  }

  /* =====================================================
     2️⃣ مع locale
  ====================================================== */
  const locale = localeInPath;

  const setLangCookie = (res: NextResponse, lang: string) => {
    res.cookies.set("lang", lang, { path: "/" });
    return res;
  };

  // منع ظهور defaultLocale في الرابط
  if (locale === defaultLocale) {
    const dest = pathname.replace(`/${defaultLocale}`, "") || "/";
    const res = NextResponse.redirect(
      new URL(`${dest}${search}`, request.url)
    );
    return setLangCookie(res, defaultLocale);
  }

  const publicRoutes = [
    `/${locale}/login`,
    `/${locale}/forget-password`,
  ];

  const isPublic = publicRoutes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const isVerifyPage = pathname === `/${locale}/verify-code`;
  const isResetPage = pathname === `/${locale}/reset-password`;

  // verify / reset بدون reset_token
  if ((isVerifyPage || isResetPage) && !resetToken) {
    return NextResponse.redirect(
      new URL(`/${locale}/forget-password${search}`, request.url)
    );
  }

  // منع الرجوع لـ verify بعد reset
  if (isVerifyPage && resetDone) {
    return NextResponse.redirect(
      new URL(`/${locale}/login${search}`, request.url)
    );
  }

  // غير مسجل
  if (!accessToken && !isPublic && !isVerifyPage && !isResetPage) {
    return NextResponse.redirect(
      new URL(`/${locale}/login${search}`, request.url)
    );
  }

  // مسجل ويحاول دخول public
  if (accessToken && isPublic) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const res = NextResponse.next();
  res.cookies.set("lang", locale, { path: "/" });
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};





















// import { NextResponse, type NextRequest } from "next/server";
// import { i18n } from "@/i18n-config";
// import { defaultLocale } from "./constants/locales";

// export function middleware(request: NextRequest) {
//   const { pathname, search } = request.nextUrl;

//   // تجاهل static / api
//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/api") ||
//     pathname.includes(".")
//   ) {
//     return NextResponse.next();
//   }

//   const accessToken = request.cookies.get("access_token")?.value;
//   const resetToken = request.cookies.get("reset_token")?.value;

//   const localeInPath = i18n.locales.find(
//     (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
//   );

//   /* =====================
//      1️⃣ لا يوجد locale في الرابط
//   ====================== */
//   if (!localeInPath) {
//     const publicRoutes = [
//       "/login",
//       "/forget-password",
//       "/verify-code",
//       "/reset-password",
//     ];

//     const isPublic = publicRoutes.some(
//       (p) => pathname === p || pathname.startsWith(p + "/")
//     );

//     // مستخدم غير مسجل → اسمح فقط بالصفحات العامة
//     if (!accessToken && !isPublic) {
//       return NextResponse.redirect(
//         new URL(`/login${search}`, request.url)
//       );
//     }

//     // مستخدم مسجل ويحاول دخول login
//     if (accessToken && isPublic) {
//       return NextResponse.redirect(new URL(`/`, request.url));
//     }

//     // rewrite داخلي فقط بدون redirect
//     const res = NextResponse.rewrite(
//       new URL(`/${defaultLocale}${pathname}${search}`, request.url)
//     );
//     res.cookies.set("lang", defaultLocale, { path: "/" });
//     return res;
//   }

//   /* =====================
//      2️⃣ locale موجود في الرابط
//   ====================== */
//   const locale = localeInPath;

//     // set lang cookie
//   const setLangCookie = (res: NextResponse, lang: string) => {
//     res.cookies.set("lang", lang, { path: "/" });
//     return res;
//   };

//     if (localeInPath === defaultLocale) {
//     const dest = pathname.replace(`/${defaultLocale}`, "") || "/";
//     const res = NextResponse.redirect(new URL(`${dest}${search}`, request.url));
//     return setLangCookie(res, defaultLocale);
//   }

//   const publicRoutes = [
//     `/${locale}/login`,
//     `/${locale}/forget-password`,
//     `/${locale}/verify-code`,
//     `/${locale}/reset-password`,
//   ];

//   const isPublic = publicRoutes.some((p) => pathname.startsWith(p));

//   // reset flow
//   if (resetToken && !isPublic) {
//     return NextResponse.redirect(
//       new URL(`/${locale}/verify-code${search}`, request.url)
//     );
//   }

//   // غير مسجل
//   if (!accessToken && !isPublic) {
//     return NextResponse.redirect(
//       new URL(`/${locale}/login${search}`, request.url)
//     );
//   }

//   // مسجل ويحاول دخول صفحة عامة
//   if (accessToken && isPublic) {
//     return NextResponse.redirect(new URL(`/${locale}`, request.url));
//   }

//   const res = NextResponse.next();
//   res.cookies.set("lang", locale, { path: "/" });
//   return res;
// }

// export const config = {
//   matcher: ["/((?!api|_next|favicon.ico).*)"],
// };