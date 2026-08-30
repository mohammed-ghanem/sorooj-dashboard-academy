"use client";

import { BookOpenText, Film } from "lucide-react";

import ModuleReorder from "@/components/swapOrder/ModuleReorder";
import { useGetSubjectsQuery } from "@/store/subjects/subjectsApi";
import { useGetLessonsQuery } from "@/store/lessons/lessonsApi";
import TranslateHook from "@/translate/TranslateHook";
import type { ModuleReorderConfig } from "@/constants/reorderModules";

export default function AcademicStudyReorder() {
  const translate = TranslateHook();
  const sidebar = translate?.sidebar;

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
        getLabel: (item) => item.name,
      },
      {
        key: "lessons",
        label: sidebar?.lessons ?? "Lessons",
        icon: Film,
        swapType: "lessons",
        hintKey: "lessonsHint",
        useGetListQuery: useGetLessonsQuery,
        queryArg: { type: "study_term" },
        getLabel: (item) =>
          [item.lesson_number, item.title].filter(Boolean).join(" · "),
      },
    ],
  };

  return <ModuleReorder config={config} />;
}
