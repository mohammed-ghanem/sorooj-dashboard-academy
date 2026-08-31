/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base/axiosBaseQuery";
import { subjectsApi } from "@/store/subjects/subjectsApi";
import { lessonsApi } from "@/store/lessons/lessonsApi";
import { scientificTrackCategoriesApi } from "@/store/scientificTrackCategories/scientificTrackCategoriesApi";
import { scientificTrackSubjectsApi } from "@/store/scientificTrackSubjects/scientificTrackSubjectsApi";
import { bookCategoriesApi } from "@/store/bookCategories/bookCategoriesApi";
import { booksApi } from "@/store/books/booksApi";
import {
  homeFeaturesApi,
  homeGoalsApi,
  homeMethodologiesApi,
  homeStudyLevelsApi,
} from "@/store/homePage/homePageApis";
import type { SwapOrderPayload, SwapOrderType } from "@/types/swapOrder";

type Orderable = {
  sort_order?: number | null;
  order?: number | null;
  order_index?: number | null;
  index?: number | null;
};

function swapOrderFields(a: Orderable, b: Orderable) {
  const fields: (keyof Orderable)[] = [
    "sort_order",
    "order",
    "order_index",
    "index",
  ];
  for (const field of fields) {
    const av = a[field];
    const bv = b[field];
    if (av == null && bv == null) continue;
    a[field] = bv ?? av ?? null;
    b[field] = av ?? bv ?? null;
  }
}

function swapRowsInDraft<T extends { id: number } & Orderable>(
  draft: T[],
  first_id: number,
  second_id: number,
) {
  const i = draft.findIndex((row) => row.id === first_id);
  const j = draft.findIndex((row) => row.id === second_id);
  if (i < 0 || j < 0) return;
  swapOrderFields(draft[i], draft[j]);
  [draft[i], draft[j]] = [draft[j], draft[i]];
}

function patchListCache(
  dispatch: (action: unknown) => { undo: () => void },
  api: { util: { updateQueryData: (...args: any[]) => unknown } },
  endpointName: string,
  queryArg: unknown,
  first_id: number,
  second_id: number,
) {
  return dispatch(
    api.util.updateQueryData(endpointName, queryArg, (draft: { id: number }[]) => {
      swapRowsInDraft(draft, first_id, second_id);
    }),
  ) as { undo: () => void };
}

function patchSwapInCaches(
  dispatch: (action: unknown) => { undo: () => void },
  type: SwapOrderType,
  first_id: number,
  second_id: number,
) {
  switch (type) {
    case "subjects":
      return patchListCache(
        dispatch,
        subjectsApi,
        "getSubjects",
        undefined,
        first_id,
        second_id,
      );
    case "lessons": {
      const studyTermPatch = patchListCache(
        dispatch,
        lessonsApi,
        "getLessons",
        { type: "study_term" },
        first_id,
        second_id,
      );
      const categoryPatch = patchListCache(
        dispatch,
        lessonsApi,
        "getLessons",
        { type: "category" },
        first_id,
        second_id,
      );
      return {
        undo: () => {
          studyTermPatch.undo();
          categoryPatch.undo();
        },
      };
    }
    case "scientific_track_categories":
      return patchListCache(
        dispatch,
        scientificTrackCategoriesApi,
        "getScientificTrackCategories",
        undefined,
        first_id,
        second_id,
      );
    case "scientific_track_subjects":
      return patchListCache(
        dispatch,
        scientificTrackSubjectsApi,
        "getScientificTrackSubjects",
        undefined,
        first_id,
        second_id,
      );
    case "book_categories":
      return patchListCache(
        dispatch,
        bookCategoriesApi,
        "getBookCategories",
        undefined,
        first_id,
        second_id,
      );
    case "books":
      return patchListCache(
        dispatch,
        booksApi,
        "getBooks",
        undefined,
        first_id,
        second_id,
      );
    case "home_features":
      return patchListCache(
        dispatch,
        homeFeaturesApi,
        "getItems",
        undefined,
        first_id,
        second_id,
      );
    case "home_goals":
      return patchListCache(
        dispatch,
        homeGoalsApi,
        "getItems",
        undefined,
        first_id,
        second_id,
      );
    case "home_methodologies":
      return patchListCache(
        dispatch,
        homeMethodologiesApi,
        "getItems",
        undefined,
        first_id,
        second_id,
      );
    case "home_study_levels":
      return patchListCache(
        dispatch,
        homeStudyLevelsApi,
        "getItems",
        undefined,
        first_id,
        second_id,
      );
    default:
      return { undo: () => undefined };
  }
}

export const swapOrderApi = createApi({
  reducerPath: "swapOrderApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    swapOrder: builder.mutation<{ message?: string }, SwapOrderPayload>({
      query: ({ type, first_id, second_id }) => {
        const formData = new FormData();
        formData.append("type", type);
        formData.append("ids[0]", String(first_id));
        formData.append("ids[1]", String(second_id));

        return {
          url: "/swap-order",
          method: "post",
          data: formData,
        };
      },
      async onQueryStarted(
        { type, first_id, second_id },
        { dispatch, queryFulfilled },
      ) {
        try {
          await queryFulfilled;
          patchSwapInCaches(dispatch, type, first_id, second_id);
        } catch {
          // Caller handles toast / local revert.
        }
      },
    }),
  }),
});

export const { useSwapOrderMutation } = swapOrderApi;
