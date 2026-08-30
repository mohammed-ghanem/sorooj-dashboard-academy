"use client";

import { BookOpenCheck, BookOpenText, Film } from "lucide-react";

import ModuleReorder from "@/components/swapOrder/ModuleReorder";
import { useGetScientificTrackCategoriesQuery } from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
import { useGetScientificTrackSubjectsQuery } from "@/store/scientificTrackSubjects/scientificTrackSubjectsApi";
import { useGetLessonsQuery } from "@/store/lessons/lessonsApi";
import TranslateHook from "@/translate/TranslateHook";
import type { ModuleReorderConfig } from "@/constants/reorderModules";

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
      },
      {
        key: "lessons",
        label: sidebar?.categoryLessons ?? "Lessons",
        icon: Film,
        swapType: "lessons",
        hintKey: "lessonsHint",
        useGetListQuery: useGetLessonsQuery,
        queryArg: { type: "category" },
        getLabel: (item) =>
          [item.lesson_number, item.title].filter(Boolean).join(" · "),
      },
    ],
  };

  return <ModuleReorder config={config} />;
}
