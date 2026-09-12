"use client";

import { useMemo } from "react";
import { BookOpenText, Film } from "lucide-react";

import ModuleReorder from "@/components/swapOrder/ModuleReorder";
import { useGetSubjectsQuery } from "@/store/subjects/subjectsApi";
import { useGetLessonsQuery } from "@/store/lessons/lessonsApi";
import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { useSessionReady } from "@/hooks/useSessionReady";
import type { ModuleReorderConfig } from "@/constants/reorderModules";
import type { ILesson } from "@/types/lesson";
import type { ISubject } from "@/types/subject";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

export default function AcademicStudyReorder() {
  const sessionReady = useSessionReady();
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const sidebar = translate?.sidebar;

  const { data: studyTerms = [] } = useGetStudyTermsQuery(undefined, {
    skip: !sessionReady,
  });

  const studyTermMap = useMemo(() => {
    const map = new Map<number, string>();
    studyTerms.forEach((st) => {
      const loc = parseLocalizedNameFromModel(st);
      const label =
        lang === "ar"
          ? loc.name_ar || loc.name || loc.name_en
          : loc.name_en || loc.name || loc.name_ar;
      map.set(st.id, label);
    });
    return map;
  }, [studyTerms, lang]);

  const { data: subjectsList = [] } = useGetSubjectsQuery(undefined, {
    skip: !sessionReady,
  });

  const subjectMap = useMemo(() => {
    const map = new Map<number, string>();
    subjectsList.forEach((s) => {
      const loc = parseLocalizedNameFromModel(s);
      const label =
        lang === "ar"
          ? loc.name_ar || loc.name || loc.name_en
          : loc.name_en || loc.name || loc.name_ar;
      map.set(s.id, label);
    });
    return map;
  }, [subjectsList, lang]);

  const config: ModuleReorderConfig = {
    defaultTabKey: "subjects",
    tabs: [
      {
        key: "subjects",
        label: sidebar?.subjects ?? "Subjects",
        icon: BookOpenText,
        swapType: "subjects",
        hintKey: "subjectsHint",
        useGetListQuery: useGetSubjectsQuery,
        getLabel: (item: ISubject) => item.name,
        groupBy: {
          groupTitle:
            sidebar?.studyTerms ??
            (lang === "ar" ? "المحاور الدراسية" : "Study Terms"),
          getParentId: (item: ISubject) =>
            item.study_term_id ?? item.study_term?.id,
          getParentLabel: (item: ISubject, currentLang) => {
            if (item.study_term) {
              const loc = parseLocalizedNameFromModel(item.study_term);
              const label =
                currentLang === "ar"
                  ? loc.name_ar || loc.name || loc.name_en
                  : loc.name_en || loc.name || loc.name_ar;
              if (label) return label;
            }
            if (item.study_term_id && studyTermMap.has(item.study_term_id)) {
              return studyTermMap.get(item.study_term_id);
            }
            return item.study_term_id ? `#${item.study_term_id}` : undefined;
          },
          uncategorizedLabel:
            lang === "ar" ? "بدون محور دراسي" : "No Study Term",
        },
      },
      {
        key: "lessons",
        label: sidebar?.lessons ?? "Lessons",
        icon: Film,
        swapType: "lessons",
        hintKey: "lessonsHint",
        useGetListQuery: useGetLessonsQuery,
        queryArg: { type: "study_term" },
        getLabel: (item: ILesson) =>
          [item.lesson_number, item.title].filter(Boolean).join(" · "),
        groupBy: {
          groupTitle:
            sidebar?.subjects ?? (lang === "ar" ? "المواد الدراسية" : "Subjects"),
          getParentId: (item: ILesson) => item.subject_id ?? item.subject?.id,
          getParentLabel: (item: ILesson, currentLang) => {
            if (item.subject) {
              const loc = parseLocalizedNameFromModel(item.subject);
              const label =
                currentLang === "ar"
                  ? loc.name_ar || loc.name || loc.name_en
                  : loc.name_en || loc.name || loc.name_ar;
              if (label) return label;
            }
            if (item.subject_id && subjectMap.has(item.subject_id)) {
              return subjectMap.get(item.subject_id);
            }
            return item.subject_id ? `#${item.subject_id}` : undefined;
          },
          uncategorizedLabel: lang === "ar" ? "بدون مادة" : "No Subject",
        },
      },
    ],
  };

  return <ModuleReorder config={config} />;
}
