import { Home, ShieldCheck, Users } from "lucide-react";

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
];

export const settingsLinks = (lang: string) => [
  {
    href: `/${lang}/privacy-policy`,
    key: "privacyPolicy",
  },
  {
    href: `/${lang}/profile`,
    key: "profile",
  },
];
