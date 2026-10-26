import { ReactNode } from "react";
import "../../../app/[lang]/globals.css";
import { Providers } from "@/providers/Providers";
import CairoFontLinks from "@/components/shared/CairoFontLinks";

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
    <html lang={lang} dir={dir}>
      <head>
        <CairoFontLinks />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <div>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
