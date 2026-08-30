import {

  BookOpenCheck,

  BookOpenText,

  CalendarRange,

  Film,

  ShieldUser,

  GraduationCap,

  Home,

  ShieldCheck,

  UserCircle,

  Users,

  FileText,

  Library,

  BookOpen,

  ArrowUpDown,

  type LucideIcon,

} from "lucide-react";



export type SidebarLinkItem = {

  href: string;

  icon: LucideIcon;

  key: string;

  module?: string;

  always?: boolean;

};



export type SettingsLinkItem = {

  href: string;

  key: string;

  module?: string;

  always?: boolean;

};



export const mainLinks = (lang: string): SidebarLinkItem[] => [

  {

    href: `/${lang}`,

    icon: Home,

    key: "dashboard",

    always: true,

  },

  {

    href: `/${lang}/doctors`,

    icon: ShieldUser,

    key: "doctors",

    module: "doctors",

  },

  {

    href: `/${lang}/cohorts`,

    icon: CalendarRange,

    key: "cohorts",

    module: "cohorts",

  },

  {

    href: `/${lang}/academic-years`,

    icon: GraduationCap,

    key: "academicYears",

    module: "academic_years",

  },

  {

    href: `/${lang}/students`,

    icon: UserCircle,

    key: "students",

    module: "students",

  },

  {

    href: `/${lang}/exam-article-reviews`,

    icon: FileText,

    key: "examArticleReviews",

    module: "exam_article_reviews",

  },

  {

    href: `/${lang}/admins`,

    icon: Users,

    key: "admins",

    module: "admins",

  },

  {

    href: `/${lang}/roles`,

    icon: ShieldCheck,

    key: "roles",

    module: "roles",

  },

];



export const academicStudyLinks = (lang: string): SidebarLinkItem[] => [

  {

    href: `/${lang}/academic-study/study-terms`,

    icon: BookOpenCheck,

    key: "studyTerms",

    module: "study_terms",

  },

  {

    href: `/${lang}/academic-study/subjects`,

    icon: BookOpenText,

    key: "subjects",

    module: "subjects",

  },

  {

    href: `/${lang}/academic-study/lessons`,

    icon: Film,

    key: "lessons",

    module: "lessons",

  },

  {

    href: `/${lang}/academic-study/reorder`,

    icon: ArrowUpDown,

    key: "changeOrder",

    module: "study_terms",

  },

];



export const independentTracksLinks = (lang: string): SidebarLinkItem[] => [

  {

    href: `/${lang}/singleLearnPath/categories`,

    icon: BookOpenCheck,

    key: "categories",

    module: "scientific_tracks",

  },

  {

    href: `/${lang}/singleLearnPath/subjects`,

    icon: BookOpenText,

    key: "categorySubjects",

    module: "scientific_tracks",

  },

  {

    href: `/${lang}/singleLearnPath/lessons`,

    icon: Film,

    key: "categoryLessons",

    module: "scientific_tracks",

  },

  {

    href: `/${lang}/singleLearnPath/reorder`,

    icon: ArrowUpDown,

    key: "changeOrder",

    module: "scientific_tracks",

  },

];



export const scientificLibraryLinks = (lang: string): SidebarLinkItem[] => [

  {

    href: `/${lang}/scientific-library/categories`,

    icon: Library,

    key: "bookCategories",

    module: "book_categories",

  },

  {

    href: `/${lang}/scientific-library/books`,

    icon: BookOpen,

    key: "books",

    module: "books",

  },

  {

    href: `/${lang}/scientific-library/reorder`,

    icon: ArrowUpDown,

    key: "changeOrder",

    module: "scientific_library",

  },

];



export const settingsLinks = (lang: string): SettingsLinkItem[] => [

  {

    href: `/${lang}/privacy-policy`,

    key: "privacyPolicy",

    module: "privacy_policy",

  },

  {

    href: `/${lang}/app-contacts`,

    key: "appContacts",

    module: "app_contacts",

  },

  {

    href: `/${lang}/terms-conditions`,

    key: "termsAndConditions",

    module: "terms_and_conditions",

  },

  {

    href: `/${lang}/delete-account`,

    key: "deleteAccount",

    module: "delete_account",

  },

  {

    href: `/${lang}/contact-us`,

    key: "contactUs",

    module: "contact_us",

  },

  {

    href: `/${lang}/profile`,

    key: "profile",

    always: true,

  },

];



/** Strip `/{lang}` prefix for path comparisons. */

export function pathWithoutLang(pathname: string, lang: string) {

  const prefix = `/${lang}`;

  if (pathname === prefix) return "/";

  if (pathname.startsWith(`${prefix}/`)) {

    return pathname.slice(prefix.length) || "/";

  }

  return pathname || "/";

}



export function isNavHrefActive(pathname: string, href: string, lang: string) {

  const path = pathWithoutLang(pathname, lang);

  const target = pathWithoutLang(href, lang);



  if (target === "/") return path === "/";

  if (path === target) return true;



  if (!path.startsWith(`${target}/`)) return false;



  if (target.endsWith("/reorder")) return true;



  return !path.startsWith(`${target}/reorder`);

}



export function isLinkGroupActive(

  pathname: string,

  links: { href: string }[],

  lang: string,

) {

  return links.some((link) => isNavHrefActive(pathname, link.href, lang));

}


