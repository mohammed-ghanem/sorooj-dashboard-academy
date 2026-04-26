import {
  BookOpenCheck,
  BookOpenText,
  CalendarRange,
  ShieldUser,
  GraduationCap,
  Home,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";

export const mainLinks = (lang: string) => [
  {
    href: `/${lang}`,
    icon: Home,
    key: "dashboard",
  },
  {
    href: `/${lang}/doctors`,
    icon: ShieldUser,
    key: "doctors",
  },
  {
    href: `/${lang}/cohorts`,
    icon: CalendarRange,
    key: "cohorts",
  },
  {
    href: `/${lang}/academic-years`,
    icon: GraduationCap,
    key: "academicYears",
  },
  {
    href: `/${lang}/study-terms`,
    icon: BookOpenCheck,
    key: "studyTerms",
  },
  {
    href: `/${lang}/subjects`,
    icon: BookOpenText,
    key: "subjects",
  },
  {
    href: `/${lang}/students`,
    icon: UserCircle,
    key: "students",
  },
  {
    href: `/${lang}/admins`,
    icon: Users,
    key: "admins",
  },
  {
    href: `/${lang}/roles`,
    icon: ShieldCheck,
    key: "roles",
  },
];

export const settingsLinks = (lang: string) => [
  {
    href: `/${lang}/privacy-policy`,
    key: "privacyPolicy",
  },
  {
    href: `/${lang}/app-contacts`,
    key: "appContacts",
  },
  {
    href: `/${lang}/terms-conditions`,
    key: "termsAndConditions",
  },
  {
    href: `/${lang}/delete-account`,
    key: "deleteAccount",
  },
  {
    href: `/${lang}/contact-us`,
    key: "contactUs",
  },
  {
    href: `/${lang}/profile`,
    key: "profile",
  },
];
