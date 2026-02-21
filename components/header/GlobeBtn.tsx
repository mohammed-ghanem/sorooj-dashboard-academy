"use client"
import { useRouter, usePathname } from "next/navigation"; // For routing
import { Globe } from "lucide-react";
import LangUseParams from "@/translate/LangUseParams"; // Your hook

const GlobeBtn = () => {

    const lang = LangUseParams(); // e.g., "en" or "ar"
    const router = useRouter();
    const pathname = usePathname(); // e.g., "/en/products" or "/ar/about"


    // Toggle between "en" and "ar" in the URL
    const toggleLanguage = () => {
        const newLang = lang === "en" ? "ar" : "en";
        const segments = pathname.split("/").filter(Boolean);

        // Replace first segment if it's a language code
        if (segments[0] === "en" || segments[0] === "ar") {
            segments[0] = newLang;
        } else {
            segments.unshift(newLang);
        }

        router.push("/" + segments.join("/"));
    };
    return (
        <div>
            <Globe className="w-5 h-5 me-2 cursor-pointer iconBar" onClick={toggleLanguage} />
        </div>
    )
}

export default GlobeBtn