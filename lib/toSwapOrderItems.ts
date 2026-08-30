import type { SwapOrderItem } from "@/types/swapOrder";

export function toSwapOrderItems<T extends { id: number }>(
  list: T[],
  getLabel: (item: T) => string,
): SwapOrderItem[] {
  // Preserve API/cache array order — do not re-sort here or swaps appear to revert.
  return list.map((item) => ({
    id: item.id,
    label: getLabel(item) || `#${item.id}`,
  }));
}
