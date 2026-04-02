/**
 * Laravel often returns localized `name` as `{ ar, en }` while sometimes also
 * sending `name_ar` / `name_en`. Normalize to plain strings for UI rendering.
 */
export function parseLocalizedNameFromModel(item: any): {
  name: string;
  name_ar: string;
  name_en: string;
} {
  if (!item) {
    return { name: "", name_ar: "", name_en: "" };
  }

  const rawName = item.name;
  let name_ar = item.name_ar;
  let name_en = item.name_en;

  if (rawName && typeof rawName === "object" && !Array.isArray(rawName)) {
    const ar = (rawName as { ar?: unknown }).ar;
    const en = (rawName as { en?: unknown }).en;
    if (name_ar == null || name_ar === "") name_ar = ar;
    if (name_en == null || name_en === "") name_en = en;
  }

  const name_ar_s = name_ar != null ? String(name_ar) : "";
  const name_en_s = name_en != null ? String(name_en) : "";

  const nameStr =
    typeof rawName === "string" && rawName
      ? rawName
      : name_ar_s || name_en_s || "";

  return {
    name: nameStr,
    name_ar: name_ar_s,
    name_en: name_en_s,
  };
}
