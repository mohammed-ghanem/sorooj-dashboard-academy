import type { LessonTrackType } from "@/types/lesson";

/** Academic study UI prefix under `app/[lang]/academic-study`. */
export const ACADEMIC_STUDY_PREFIX = "academic-study";

export const ACADEMIC_STUDY_TERMS_PATH = `${ACADEMIC_STUDY_PREFIX}/study-terms`;
export const ACADEMIC_STUDY_SUBJECTS_PATH = `${ACADEMIC_STUDY_PREFIX}/subjects`;

/** Academic lessons index + nested exam/videos UI. */
export const ACADEMIC_LESSONS_BASE_PATH = `${ACADEMIC_STUDY_PREFIX}/lessons`;

/** Independent scientific-track lessons index. */
export const SCIENTIFIC_LESSONS_BASE_PATH = "singleLearnPath/lessons";

const ALLOWED_LESSONS_LIST_PATHS = new Set([
  ACADEMIC_LESSONS_BASE_PATH,
  SCIENTIFIC_LESSONS_BASE_PATH,
  // Legacy value before academic-study move — map via resolve
  "lessons",
]);

/**
 * Query key used on shared `/lessons/exam|videos/...` routes so navigation
 * returns to the scientific lessons list.
 */
export const LESSONS_LIST_QUERY_KEY = "list";

export function lessonsBasePathForTrack(track: LessonTrackType): string {
  return track === "category"
    ? SCIENTIFIC_LESSONS_BASE_PATH
    : ACADEMIC_LESSONS_BASE_PATH;
}

/** Sanitize `?list=` from the URL; fall back to academic lessons. */
export function resolveLessonsListBasePath(
  listParam: string | string[] | null | undefined,
): string {
  const raw = Array.isArray(listParam) ? listParam[0] : listParam;
  if (!raw) return ACADEMIC_LESSONS_BASE_PATH;
  // Legacy list value before academic-study move
  if (raw === "lessons") return ACADEMIC_LESSONS_BASE_PATH;
  if (ALLOWED_LESSONS_LIST_PATHS.has(raw)) return raw;
  return ACADEMIC_LESSONS_BASE_PATH;
}

/**
 * Root used for lesson exam / video pages — always under the track's lessons base.
 * - Academic → `/[lang]/academic-study/lessons`
 * - Scientific → `/[lang]/singleLearnPath/lessons`
 */
export function lessonsNestedUiRoot(
  lang: string,
  lessonsBasePath: string,
): string {
  return `/${lang}/${lessonsBasePath || ACADEMIC_LESSONS_BASE_PATH}`;
}

export function withLessonsListQuery(
  path: string,
  _lessonsBasePath: string,
): string {
  // Nested exam/videos now live under each track's lessons base — no shared
  // `/lessons/*` query needed anymore.
  return path;
}

export function lessonExamHref(
  lang: string,
  lessonId: number | string,
  lessonsBasePath: string,
  suffix = "",
): string {
  const root = lessonsNestedUiRoot(lang, lessonsBasePath);
  return withLessonsListQuery(
    `${root}/exam/${lessonId}${suffix}`,
    lessonsBasePath,
  );
}

export function lessonVideosHref(
  lang: string,
  lessonId: number | string,
  lessonsBasePath: string,
): string {
  const root = lessonsNestedUiRoot(lang, lessonsBasePath);
  return withLessonsListQuery(`${root}/videos/${lessonId}`, lessonsBasePath);
}

export function lessonVideoExamHref(
  lang: string,
  lessonId: number | string,
  videoId: number | string,
  lessonsBasePath: string,
  suffix = "",
): string {
  const root = lessonsNestedUiRoot(lang, lessonsBasePath);
  return withLessonsListQuery(
    `${root}/videos/${lessonId}/exam/${videoId}${suffix}`,
    lessonsBasePath,
  );
}

export function resolveLessonsBaseFromPathname(
  pathname: string,
  lang: string,
  listParam?: string | string[] | null,
): string {
  const path =
    (pathname.replace(`/${lang}`, "") || "/").replace(/\/$/, "") || "/";

  if (
    path === `/${ACADEMIC_LESSONS_BASE_PATH}` ||
    path.startsWith(`/${ACADEMIC_LESSONS_BASE_PATH}/`)
  ) {
    return ACADEMIC_LESSONS_BASE_PATH;
  }

  if (
    path === `/${SCIENTIFIC_LESSONS_BASE_PATH}` ||
    path.startsWith(`/${SCIENTIFIC_LESSONS_BASE_PATH}/`)
  ) {
    return SCIENTIFIC_LESSONS_BASE_PATH;
  }

  return resolveLessonsListBasePath(listParam);
}
