"use client";

import { useMemo } from "react";
import { useGetStudyTermsQuery } from "@/store/studyTerms/studyTermsApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import LangUseParams from "@/translate/LangUseParams";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";
import { cn } from "@/lib/utils";
import type { IStudentNamedRef } from "@/types/student";

type Props = {
  terms: IStudentNamedRef[];
  emptyLabel?: string;
  className?: string;
};

export default function CarriedOverTerms({
  terms,
  emptyLabel = "—",
  className,
}: Props) {
  const sessionReady = useSessionReady();
  const lang = LangUseParams() ?? "ar";
  const needsLookup = terms.some((t) => !t.name && t.id);

  const { data: studyTerms = [] } = useGetStudyTermsQuery(undefined, {
    skip: !sessionReady || !needsLookup,
  });

  const labels = useMemo(() => {
    const byId = new Map<number, string>();
    for (const st of studyTerms) {
      const loc = parseLocalizedNameFromModel(st);
      const name =
        lang === "ar"
          ? loc.name_ar || loc.name || loc.name_en
          : loc.name_en || loc.name || loc.name_ar;
      if (name) byId.set(st.id, name);
    }
    return terms.map((t) => t.name || byId.get(t.id) || `#${t.id}`);
  }, [terms, studyTerms, lang]);

  if (terms.length === 0) {
    return <span className="text-slate-400">{emptyLabel}</span>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {labels.map((label, i) => (
        <span
          key={`${terms[i].id}-${i}`}
          className="inline-flex whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
