
import type { Metadata } from "next";

import "./globals.css";
import Navbar from "@/components/header/Navbar";
import { Providers } from "../../providers/Providers";
import AuthSessionGuard from "@/components/auth/AuthSessionGuard";
import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard";
import SideBar from "@/components/sidebar/SideBar";
import { ReactNode } from "react";
import { Cairo } from "next/font/google";
import Footer from "@/components/footer/Footer";


// Variable Cairo = one file (all weights) instead of 4 separate downloads.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Sorooj Academy Dashboard",
  description: "dashboard for Sorooj Academy",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} className={cairo.variable}>
      <body className={`${cairo.className} min-h-screen overflow-hidden antialiased`}>
        <Providers>
          <AuthSessionGuard lang={lang}>
          <PermissionRouteGuard lang={lang}>
          <div className="flex flex-col md:flex-row h-screen">
            <div className="block w-14 md:w-60 shrink-0">
              <SideBar />
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden
                  ms-14 md:ms-60"></div>
            </div>


            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              {/* Header - Fixed on mobile */}
              <header className="sticky top-0 z-10 shrink-0 bg-white shadow-sm md:shadow-none">
                <Navbar />
              </header>

              {/* Main Content */}
              <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3 sm:p-4 md:p-6 mainBackGroundColor">
                <div className="w-full mx-auto">
                  {children}
                </div>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </div>
          </PermissionRouteGuard>
          </AuthSessionGuard>
        </Providers>
      </body>
    </html>
  );
}