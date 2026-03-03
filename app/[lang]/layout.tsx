
import type { Metadata } from "next";

import "./globals.css";
import Navbar from "@/components/header/Navbar";
import { Providers } from "../../providers/Providers";
import SideBar from "@/components/sidebar/SideBar";
import { ReactNode } from "react";
import { Cairo } from "next/font/google";
import Footer from "@/components/footer/Footer";

const cairo = Cairo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Sorooj Academy Dashboard",
  description: "Admin dashboard for Sorooj Academy",
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
      <body className="min-h-screen">
        <Providers>
          <div className="flex flex-col md:flex-row h-screen">
            <div className="block w-14 md:w-60 shrink-0">
              <SideBar />
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden
                  ms-14 md:ms-60"></div>
            </div>


            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              {/* Header - Fixed on mobile */}
              <header className="sticky top-0 z-10 bg-white shadow-sm md:shadow-none">
                <Navbar />
              </header>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 mainBackGroundColor">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}