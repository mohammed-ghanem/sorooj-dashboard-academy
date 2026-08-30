"use client";

import { useMemo } from "react";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetStudentsQuery } from "@/store/students/studentsApi";
import { useGetDoctorsQuery } from "@/store/doctors/doctorsApi";
import { useGetCohortsQuery } from "@/store/cohorts/cohortsApi";
import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import { useGetSubjectsQuery } from "@/store/subjects/subjectsApi";
import { useGetLessonsQuery } from "@/store/lessons/lessonsApi";
import { useGetScientificTrackCategoriesQuery } from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
import { useGetScientificTrackSubjectsQuery } from "@/store/scientificTrackSubjects/scientificTrackSubjectsApi";
import type { DashboardModuleStat, DashboardStats } from "./types";

function countActiveInactive<T extends { is_active: boolean }>(
  items: T[] | undefined,
) {
  const list = items ?? [];
  const active = list.filter((item) => item.is_active).length;
  return { count: list.length, active, inactive: list.length - active };
}

function countAddedThisWeek<T extends { created_at?: string | null }>(
  items: T[] | undefined,
) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return (items ?? []).filter((item) => {
    if (!item.created_at) return false;
    return new Date(item.created_at).getTime() >= weekAgo;
  }).length;
}

function buildModule(
  key: string,
  items: { is_active: boolean }[] | undefined,
  color: DashboardModuleStat["color"],
): DashboardModuleStat {
  const { count, active, inactive } = countActiveInactive(items);
  return { key, count, active, inactive, color };
}

export function useDashboardStats(): DashboardStats {
  const sessionReady = useSessionReady();
  const skip = !sessionReady;

  const studentsQuery = useGetStudentsQuery(undefined, { skip });
  const doctorsQuery = useGetDoctorsQuery(undefined, { skip });
  const cohortsQuery = useGetCohortsQuery(undefined, { skip });
  const studyTermsQuery = useGetStudyTermsQuery(undefined, { skip });
  const subjectsQuery = useGetSubjectsQuery(undefined, { skip });
  const academicLessonsQuery = useGetLessonsQuery(
    { type: "study_term" },
    { skip },
  );
  const trackLessonsQuery = useGetLessonsQuery({ type: "category" }, { skip });
  const categoriesQuery = useGetScientificTrackCategoriesQuery(undefined, {
    skip,
  });
  const trackSubjectsQuery = useGetScientificTrackSubjectsQuery(undefined, {
    skip,
  });

  const isLoading =
    !sessionReady ||
    [
      studentsQuery,
      doctorsQuery,
      cohortsQuery,
      studyTermsQuery,
      subjectsQuery,
      academicLessonsQuery,
      trackLessonsQuery,
      categoriesQuery,
      trackSubjectsQuery,
    ].some((query) => query.isLoading);

  return useMemo(() => {
    const students = studentsQuery.data ?? [];
    const doctors = doctorsQuery.data ?? [];
    const cohorts = cohortsQuery.data ?? [];
    const studyTerms = studyTermsQuery.data ?? [];
    const subjects = subjectsQuery.data ?? [];
    const academicLessons = academicLessonsQuery.data ?? [];
    const trackLessons = trackLessonsQuery.data ?? [];
    const categories = categoriesQuery.data ?? [];
    const trackSubjects = trackSubjectsQuery.data ?? [];

    const modules: DashboardModuleStat[] = [
      buildModule("studyTerms", studyTerms, "emerald"),
      buildModule("academicSubjects", subjects, "teal"),
      buildModule("academicLessons", academicLessons, "cyan"),
      buildModule("trackCategories", categories, "sky"),
      buildModule("trackSubjects", trackSubjects, "amber"),
      buildModule("trackLessons", trackLessons, "lime"),
    ];

    const publishingActive = modules.reduce((sum, mod) => sum + mod.active, 0);
    const publishingInactive = modules.reduce(
      (sum, mod) => sum + mod.inactive,
      0,
    );

    const publishedThisWeek =
      countAddedThisWeek(studyTerms) +
      countAddedThisWeek(subjects) +
      countAddedThisWeek(academicLessons) +
      countAddedThisWeek(categories) +
      countAddedThisWeek(trackSubjects) +
      countAddedThisWeek(trackLessons);

    const totalLearningItems = modules.reduce((sum, mod) => sum + mod.count, 0);

    return {
      isLoading,
      totals: {
        students: students.length,
        doctors: doctors.length,
        lessons: academicLessons.length + trackLessons.length,
        cohorts: cohorts.length,
        totalLearningItems,
      },
      modules,
      publishing: {
        active: publishingActive,
        inactive: publishingInactive,
        publishedThisWeek,
      },
    };
  }, [
    isLoading,
    studentsQuery.data,
    doctorsQuery.data,
    cohortsQuery.data,
    studyTermsQuery.data,
    subjectsQuery.data,
    academicLessonsQuery.data,
    trackLessonsQuery.data,
    categoriesQuery.data,
    trackSubjectsQuery.data,
  ]);
}
