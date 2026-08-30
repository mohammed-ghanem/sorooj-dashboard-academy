type Orderable = {
  id: number;
  sort_order?: number | null;
  order?: number | null;
  order_index?: number | null;
  index?: number | null;
};

function pickOrder(item: Orderable): number {
  const candidates = [item.sort_order, item.order, item.order_index, item.index];
  for (const value of candidates) {
    if (value == null) continue;
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export function sortByOrderField<T extends Orderable>(list: T[]): T[] {
  const hasOrder = list.some((item) => pickOrder(item) > 0);
  if (!hasOrder) return list;

  return [...list].sort(
    (a, b) => pickOrder(a) - pickOrder(b) || a.id - b.id,
  );
}

export function readOrderField(item: unknown): number | undefined {
  if (!item || typeof item !== "object") return undefined;
  const row = item as Orderable;
  const order = pickOrder(row);
  return order > 0 ? order : undefined;
}
