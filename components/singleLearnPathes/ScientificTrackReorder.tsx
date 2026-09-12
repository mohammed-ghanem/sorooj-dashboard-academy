"use client";

import { BookOpenCheck, BookOpenText, Film } from "lucide-react";

import ModuleReorder from "@/components/swapOrder/ModuleReorder";
import { useGetScientificTrackCategoriesQuery } from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
import { useGetScientificTrackSubjectsQuery } from "@/store/scientificTrackSubjects/scientificTrackSubjectsApi";
import { useGetLessonsQuery } from "@/store/lessons/lessonsApi";
import TranslateHook from "@/translate/TranslateHook";
import type { ModuleReorderConfig } from "@/constants/reorderModules";
import type { ILesson } from "@/types/lesson";
import type { IScientificTrackSubject } from "@/types/scientificTrackSubject";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";

export default function ScientificTrackReorder() {
  const translate = TranslateHook();
  const sidebar = translate?.sidebar;

  const config: ModuleReorderConfig = {
    defaultTabKey: "categories",
    tabs: [
      {
        key: "categories",
        label: sidebar?.categories ?? "Categories",
        icon: BookOpenCheck,
        swapType: "scientific_track_categories",
        hintKey: "categoriesHint",
        useGetListQuery: useGetScientificTrackCategoriesQuery,
        getLabel: (item) => item.name,
      },
      {
        key: "subjects",
        label: sidebar?.categorySubjects ?? "Subjects",
        icon: BookOpenText,
        swapType: "scientific_track_subjects",
        hintKey: "subjectsHint",
        useGetListQuery: useGetScientificTrackSubjectsQuery,
        getLabel: (item) => item.name,
        groupBy: {
          groupTitle: sidebar?.categories ?? "Categories",
          getParentId: (item: IScientificTrackSubject) =>
            item.category_id ?? item.category?.id,
          getParentLabel: (item: IScientificTrackSubject) =>
            item.category?.name,
        },
      },
      {
        key: "lessons",
        label: sidebar?.categoryLessons ?? "Lessons",
        icon: Film,
        swapType: "lessons",
        hintKey: "lessonsHint",
        useGetListQuery: useGetLessonsQuery,
        queryArg: { type: "category" },
        getLabel: (item: ILesson) =>
          [item.lesson_number, item.title].filter(Boolean).join(" · "),
        groupBy: {
          groupTitle: sidebar?.categorySubjects ?? "Subjects",
          getParentId: (item: ILesson) => item.subject_id ?? item.subject?.id,
          getParentLabel: (item: ILesson, lang) => {
            if (item.subject) {
              const loc = parseLocalizedNameFromModel(item.subject);
              const label =
                lang === "ar"
                  ? loc.name_ar || loc.name || loc.name_en
                  : loc.name_en || loc.name || loc.name_ar;
              if (label) return label;
            }
            return item.subject_id ? `#${item.subject_id}` : undefined;
          },
        },
      },
    ],
  };

  return <ModuleReorder config={config} />;
}
