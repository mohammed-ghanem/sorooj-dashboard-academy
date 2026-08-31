import type { HomePageSectionKey } from "@/types/homePageSection";
import { createHomePageSectionApi } from "./createHomePageSectionApi";

export const homeFeaturesApi = createHomePageSectionApi({
  reducerPath: "homeFeaturesApi",
  endpoint: "home-features",
  listTag: "HomeFeatures",
  itemTag: "HomeFeature",
});

export const homeGoalsApi = createHomePageSectionApi({
  reducerPath: "homeGoalsApi",
  endpoint: "home-goals",
  listTag: "HomeGoals",
  itemTag: "HomeGoal",
});

export const homeMethodologiesApi = createHomePageSectionApi({
  reducerPath: "homeMethodologiesApi",
  endpoint: "home-methodologies",
  listTag: "HomeMethodologies",
  itemTag: "HomeMethodology",
});

export const homeStudyLevelsApi = createHomePageSectionApi({
  reducerPath: "homeStudyLevelsApi",
  endpoint: "home-study-levels",
  listTag: "HomeStudyLevels",
  itemTag: "HomeStudyLevel",
});

export const {
  useGetItemsQuery: useGetHomeFeaturesQuery,
  useGetItemByIdQuery: useGetHomeFeatureByIdQuery,
  useCreateItemMutation: useCreateHomeFeatureMutation,
  useUpdateItemMutation: useUpdateHomeFeatureMutation,
  useDeleteItemMutation: useDeleteHomeFeatureMutation,
  useToggleItemStatusMutation: useToggleHomeFeatureStatusMutation,
} = homeFeaturesApi;

export const {
  useGetItemsQuery: useGetHomeGoalsQuery,
  useGetItemByIdQuery: useGetHomeGoalByIdQuery,
  useCreateItemMutation: useCreateHomeGoalMutation,
  useUpdateItemMutation: useUpdateHomeGoalMutation,
  useDeleteItemMutation: useDeleteHomeGoalMutation,
  useToggleItemStatusMutation: useToggleHomeGoalStatusMutation,
} = homeGoalsApi;

export const {
  useGetItemsQuery: useGetHomeMethodologiesQuery,
  useGetItemByIdQuery: useGetHomeMethodologyByIdQuery,
  useCreateItemMutation: useCreateHomeMethodologyMutation,
  useUpdateItemMutation: useUpdateHomeMethodologyMutation,
  useDeleteItemMutation: useDeleteHomeMethodologyMutation,
  useToggleItemStatusMutation: useToggleHomeMethodologyStatusMutation,
} = homeMethodologiesApi;

export const {
  useGetItemsQuery: useGetHomeStudyLevelsQuery,
  useGetItemByIdQuery: useGetHomeStudyLevelByIdQuery,
  useCreateItemMutation: useCreateHomeStudyLevelMutation,
  useUpdateItemMutation: useUpdateHomeStudyLevelMutation,
  useDeleteItemMutation: useDeleteHomeStudyLevelMutation,
  useToggleItemStatusMutation: useToggleHomeStudyLevelStatusMutation,
} = homeStudyLevelsApi;

export function getHomePageSectionHooks(key: HomePageSectionKey) {
  switch (key) {
    case "features":
      return {
        useGetItemsQuery: useGetHomeFeaturesQuery,
        useGetItemByIdQuery: useGetHomeFeatureByIdQuery,
        useCreateItemMutation: useCreateHomeFeatureMutation,
        useUpdateItemMutation: useUpdateHomeFeatureMutation,
        useDeleteItemMutation: useDeleteHomeFeatureMutation,
        useToggleItemStatusMutation: useToggleHomeFeatureStatusMutation,
      };
    case "goals":
      return {
        useGetItemsQuery: useGetHomeGoalsQuery,
        useGetItemByIdQuery: useGetHomeGoalByIdQuery,
        useCreateItemMutation: useCreateHomeGoalMutation,
        useUpdateItemMutation: useUpdateHomeGoalMutation,
        useDeleteItemMutation: useDeleteHomeGoalMutation,
        useToggleItemStatusMutation: useToggleHomeGoalStatusMutation,
      };
    case "methodologies":
      return {
        useGetItemsQuery: useGetHomeMethodologiesQuery,
        useGetItemByIdQuery: useGetHomeMethodologyByIdQuery,
        useCreateItemMutation: useCreateHomeMethodologyMutation,
        useUpdateItemMutation: useUpdateHomeMethodologyMutation,
        useDeleteItemMutation: useDeleteHomeMethodologyMutation,
        useToggleItemStatusMutation: useToggleHomeMethodologyStatusMutation,
      };
    case "study-levels":
      return {
        useGetItemsQuery: useGetHomeStudyLevelsQuery,
        useGetItemByIdQuery: useGetHomeStudyLevelByIdQuery,
        useCreateItemMutation: useCreateHomeStudyLevelMutation,
        useUpdateItemMutation: useUpdateHomeStudyLevelMutation,
        useDeleteItemMutation: useDeleteHomeStudyLevelMutation,
        useToggleItemStatusMutation: useToggleHomeStudyLevelStatusMutation,
      };
  }
}
