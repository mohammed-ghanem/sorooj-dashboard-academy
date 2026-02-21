/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import en from '@/app/dictionaries/en.json';  // Import English dictionary
import ar from '@/app/dictionaries/ar.json';  // Import Arabic dictionary
import { useEffect, useState } from 'react';
import LangUseParams from './LangUseParams';



const TranslateHook = () => {

    const lang = LangUseParams() // Access dynamic [lang] parameter
    const [dictionary, setDictionary] = useState<any>(null);

    useEffect(() => {
        // Dynamically set the dictionary based on the current language
        if (lang === 'en') {
            setDictionary(en);
        } else if (lang === 'ar') {
            setDictionary(ar);
        }
    }, [lang]);

    return (dictionary)
}

export default TranslateHook