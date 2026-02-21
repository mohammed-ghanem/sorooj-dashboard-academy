import { ReactNode } from "react";
import '../../../app/[lang]/globals.css'
import { Providers } from "@/providers/Providers";
import { Cairo } from "next/font/google";

const cairo = Cairo({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"], // choose what you need
    variable: "--font-cairo",
});

export default async function AuthLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ lang: string }>; // 👈 params is a Promise now
}) {

    const { lang } = await params; // 👈 await it
    const dir = lang === "ar" ? "rtl" : "ltr";
    return (
        <html lang={lang} dir={dir} className={cairo.variable}>
            <body>
                <Providers>
                    <div>
                        {children}
                    </div>
                </Providers>

            </body>
        </html>
    );
}