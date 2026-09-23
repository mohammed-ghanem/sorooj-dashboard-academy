import { ReactNode } from "react";
import "../../../app/[lang]/globals.css";
import { Providers } from "@/providers/Providers";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export default async function AuthLayout({
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
      <body className={`${cairo.className} min-h-screen antialiased`}>
        <Providers>
          <div>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
