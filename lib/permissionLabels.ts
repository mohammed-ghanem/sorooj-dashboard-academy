/** Display labels for permission groups/controls from the API. */

const AR_REPLACEMENTS: Array<[string, string]> = [
  ["تصنيفات الكتب", "أقسام المكتبة العلمية"],
  ["الكتب", "المكتبة العلمية"],
];

const EN_REPLACEMENTS: Array<[string, string]> = [
  ["Book Categories", "Scientific Library Categories"],
  ["Books", "Scientific Library"],
];

export function formatPermissionLabel(
  name: string | null | undefined,
  lang: string = "ar",
): string {
  if (!name?.trim()) return name ?? "";

  const replacements = lang === "ar" ? AR_REPLACEMENTS : EN_REPLACEMENTS;
  let result = name;

  for (const [from, to] of replacements) {
    result = result.split(from).join(to);
  }

  return result;
}
