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

export function formatGregorianDateAr(dateStr?: string) {
  const parsed = parseYmd(dateStr);
  if (!parsed) return dateStr ? dateStr.slice(0, 10) : "—";

  // Use UTC to avoid timezone shifting the day.
  const monthName = new Intl.DateTimeFormat("ar", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)));

  return `${parsed.d} ${monthName} ${parsed.y}`;
}

export function formatHijriDateAr(dateStr?: string) {
  const parsed = parseYmd(dateStr);
  if (!parsed) return dateStr ? dateStr.slice(0, 10) : "—";

  const monthName = hijriMonthsAr[parsed.m - 1] ?? String(parsed.m);
  return `${parsed.d} ${monthName} ${parsed.y}`;
}

export function formatHijriFromGregorianDateAr(dateStr?: string) {
  const parsed = parseYmd(dateStr);
  if (!parsed) return dateStr ? dateStr.slice(0, 10) : "—";

  // Convert selected Gregorian date to Hijri using Islamic calendar.
  const dt = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  const parts = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
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

