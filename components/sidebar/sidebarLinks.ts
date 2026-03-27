import { CalendarRange, Home, ShieldCheck, Users } from "lucide-react";

export const mainLinks = (lang: string) => [
  {
    href: `/${lang}`,
    icon: Home,
    key: "dashboard",
  },
  {
    href: `/${lang}/roles`,
    icon: ShieldCheck,
    key: "roles",
  },
  {
    href: `/${lang}/admins`,
    icon: Users,
    key: "admins",
  },
  {
    href: `/${lang}/cohorts`,
    icon: CalendarRange,
    key: "cohorts",
  },
];

export const settingsLinks = (lang: string) => [
  {
    href: `/${lang}/privacy-policy`,
    key: "privacyPolicy",
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
