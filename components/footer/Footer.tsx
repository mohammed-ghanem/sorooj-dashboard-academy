"use client";

import TranslateHook from "@/translate/TranslateHook";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const translate = TranslateHook()
    return (
        <footer className="w-full border-t bg-white py-3 px-4 text-sm text-gray-500">
            <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-center">
                <span>
                    {translate?.footer?.copyright} © 2026 - {currentYear}
                </span>

            </div>
        </footer>
    );
};

export default Footer;