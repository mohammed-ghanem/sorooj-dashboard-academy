const hijriMonthsAr = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

function parseYmd(dateStr?: string) {
  if (!dateStr) return null;
  const clean = dateStr.slice(0, 10);
  const [yStr, mStr, dStr] = clean.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  return { y, m, d, clean };
}

/** Gregorian date for tables/UI (UTC). */
export function formatGregorianDateUi(
  dateStr: string | undefined,
  lang: "ar" | "en",
): string {
  const parsed = parseYmd(dateStr);
  if (!parsed) return dateStr ? String(dateStr).slice(0, 10) : "—";
  if (lang === "ar") {
    const monthName = new Intl.DateTimeFormat("ar", {
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)));
    return `${parsed.d} ${monthName} ${parsed.y}`;
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)));
}

export function formatGregorianDateAr(dateStr?: string) {
  return formatGregorianDateUi(dateStr, "ar");
}

/** Hijri (Islamic calendar) from a Gregorian `YYYY-MM-DD`, localized month names. */
export function formatHijriFromGregorianUi(
  dateStr: string | undefined,
  lang: "ar" | "en",
): string {
  const parsed = parseYmd(dateStr);
  if (!parsed) return dateStr ? String(dateStr).slice(0, 10) : "—";
  const dt = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  const locale = lang === "ar" ? "ar-SA-u-ca-islamic" : "en-SA-u-ca-islamic";
  const parts = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(dt);

  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;

  return day && month && year ? `${day} ${month} ${year}` : "—";
}

export function formatHijriDateAr(dateStr?: string) {
  const parsed = parseYmd(dateStr);
  if (!parsed) return dateStr ? dateStr.slice(0, 10) : "—";

  const monthName = hijriMonthsAr[parsed.m - 1] ?? String(parsed.m);
  return `${parsed.d} ${monthName} ${parsed.y}`;
}

export function formatHijriFromGregorianDateAr(dateStr?: string) {
  return formatHijriFromGregorianUi(dateStr, "ar");
}

/** Hijri calendar year only (numeric), from a Gregorian `YYYY-MM-DD` (uses UTC). */
export function formatHijriYearOnlyFromGregorianUi(
  dateStr: string | undefined,
  lang: "ar" | "en",
): string {
  const parsed = parseYmd(dateStr);
  if (!parsed) return "";

  const dt = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  const locale =
    lang === "ar" ? "ar-SA-u-ca-islamic" : "en-u-ca-islamic";
  const parts = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(dt);

  const year = parts.find((p) => p.type === "year")?.value;
  return year ? year.trim() : "";
}

export function formatHijriYearOnlyFromGregorianDateAr(dateStr?: string): string {
  return formatHijriYearOnlyFromGregorianUi(dateStr, "ar");
}

/** First four digits from `YYYY-MM-DD` (cohort year fields). */
export function gregorianYearFromIsoDate(iso?: string): string {
  if (!iso) return "";
  const head = iso.slice(0, 10);
  const m = head.match(/^(\d{4})/);
  return m ? m[1] : "";
}

/** Store a picked Gregorian year as 1 January (API-friendly date string). */
export function isoDateFromGregorianYear(y: string): string {
  const s = String(y).trim();
  if (!/^\d{4}$/.test(s)) return "";
  return `${s}-01-01`;
}
