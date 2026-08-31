/** Postman: subjects | scientific_track_subjects | lessons | scientific_track_categories | book_categories | books | home_features | home_goals | home_methodologies | home_study_levels */
export type SwapOrderType =
  | "subjects"
  | "lessons"
  | "scientific_track_categories"
  | "scientific_track_subjects"
  | "book_categories"
  | "books"
  | "home_features"
  | "home_goals"
  | "home_methodologies"
  | "home_study_levels";

export type SwapOrderPayload = {
  type: SwapOrderType;
  first_id: number;
  second_id: number;
  /** Skip cache invalidation while chaining adjacent swaps. */
  skipInvalidate?: boolean;
};

export type SwapOrderItem = {
  id: number;
  label: string;
};
