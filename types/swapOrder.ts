/** Postman: subjects | scientific_track_subjects | lessons | scientific_track_categories | book_categories | books */
export type SwapOrderType =
  | "subjects"
  | "lessons"
  | "scientific_track_categories"
  | "scientific_track_subjects"
  | "book_categories"
  | "books";

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
