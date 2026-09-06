"use client";

import { useState } from "react";
import { Award, Calendar, Download, Eye, Hash, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IStudentCertificate } from "@/types/student";

function isLikelyImageUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return (
    /\.(avif|gif|jpe?g|png|webp|svg)$/.test(clean) || !/\.pdf$/.test(clean)
  );
}

type StudentCertificateCardProps = {
  cert: IStudentCertificate;
  labels: {
    type?: string;
    serial?: string;
    issued?: string;
    viewImage?: string;
    downloadPdf?: string;
    close?: string;
  };
  dir?: "ltr" | "rtl";
};

export default function StudentCertificateCard({
  cert,
  labels,
  dir,
}: StudentCertificateCardProps) {
  const [open, setOpen] = useState(false);
  const pdfHref = cert.pdfUrl || cert.downloadUrl;
  const imageHref = cert.imageUrl;
  const title = cert.displayTitle || cert.title || "—";
  const issued = cert.issuedAtLabel || cert.issuedAt;
  const type = cert.typeLabel || cert.type;
  const showImage = Boolean(imageHref && isLikelyImageUrl(imageHref));

  return (
    <>
      <article className="group relative overflow-hidden rounded-3xl bg-[#f7f4ec] shadow-[0_18px_40px_-24px_rgba(6,78,59,0.45)] ring-1 ring-emerald-950/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-20px_rgba(6,78,59,0.5)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(6,78,59,0.14) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-e-10 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(180,148,74,0.22),transparent_68%)]"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 inset-s-0 w-2.5 bg-[linear-gradient(180deg,#0f766e_0%,#b45309_48%,#065f46_100%)]"
        />

        <span
          aria-hidden
          className="absolute inset-s-5 top-4 h-3.5 w-3.5 border-s-2 border-t-2 border-emerald-800/35"
        />
        <span
          aria-hidden
          className="absolute inset-e-4 top-4 h-3.5 w-3.5 border-e-2 border-t-2 border-emerald-800/35"
        />
        <span
          aria-hidden
          className="absolute inset-s-5 bottom-4 h-3.5 w-3.5 border-s-2 border-b-2 border-emerald-800/35"
        />
        <span
          aria-hidden
          className="absolute inset-e-4 bottom-4 h-3.5 w-3.5 border-e-2 border-b-2 border-emerald-800/35"
        />

        <div className="relative flex flex-col gap-4 px-6 py-5 ps-8 sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:py-6">
          <div className="relative mx-auto h-21 w-29 shrink-0 sm:mx-0">
            <div
              aria-hidden
              className="absolute inset-0 translate-x-1 translate-y-1 -rotate-6 rounded-xl bg-emerald-950/10"
            />
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-white shadow-md ring-2 ring-white -rotate-3 transition duration-300 group-hover:-rotate-6">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageHref!}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,#ecfdf5_0%,#f8fafc_55%,#fefce8_100%)]">
                  <Award className="h-9 w-9 text-emerald-800" strokeWidth={1.4} />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -inset-e-2 flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(145deg,#f6d365_0%,#b45309_100%)] shadow-md ring-2 ring-[#f7f4ec]">
              <Award className="h-4 w-4 text-white" strokeWidth={2.2} />
            </div>
          </div>

          <div className="min-w-0 flex-1 text-start">
            {type ? (
              <p
                className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800"
                title={labels.type}
              >
                {type}
              </p>
            ) : null}
            <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">
              {title}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {cert.serialNumber ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-emerald-800/30 bg-white/70 px-2.5 py-1 font-mono text-[11px] tracking-wider text-emerald-950"
                  dir="ltr"
                  title={labels.serial}
                >
                  <Hash className="h-3 w-3 shrink-0 text-amber-700" />
                  {cert.serialNumber}
                </span>
              ) : null}
              {issued ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-950/5 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                  title={labels.issued}
                >
                  <Calendar className="h-3 w-3 shrink-0 text-emerald-800" />
                  {issued}
                </span>
              ) : null}
            </div>
          </div>

          {imageHref || pdfHref ? (
            <div className="flex shrink-0 items-center justify-end gap-2 sm:flex-col sm:items-stretch">
              {imageHref ? (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-emerald-800/20 bg-white/80 px-3 text-xs font-semibold text-emerald-950 cursor-pointer transition hover:bg-white sm:flex-none"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden />
                  {labels.viewImage}
                </button>
              ) : null}
              {pdfHref ? (
                <a
                  href={pdfHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#0f766e_0%,#065f46_100%)] px-3 text-xs font-semibold text-white shadow-sm shadow-emerald-950/20 transition hover:opacity-90 sm:flex-none"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  {labels.downloadPdf}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          dir={dir}
          className="max-h-[min(90vh,calc(100%-2rem))] max-w-[calc(100%-2rem)] gap-4 overflow-y-auto rounded-3xl border-emerald-900/10 bg-[#f7f4ec] p-5 sm:max-w-2xl sm:p-6"
        >
          <DialogTitle className="text-center text-lg font-semibold text-slate-900">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {labels.viewImage}
          </DialogDescription>

          <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-emerald-950/10">
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageHref!}
                alt={title}
                className="max-h-[65vh] w-auto object-contain"
              />
            ) : (
              <Award className="h-16 w-16 text-emerald-800" strokeWidth={1.25} />
            )}
          </div>

          {issued ? (
            <p className="text-center text-sm text-slate-500">{issued}</p>
          ) : null}

          {pdfHref ? (
            <div className="flex justify-center">
              <a
                href={pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#0f766e_0%,#065f46_100%)] px-4 py-2 text-sm font-semibold text-white"
              >
                <Download className="h-4 w-4" aria-hidden />
                {labels.downloadPdf}
              </a>
            </div>
          ) : null}

          <DialogClose asChild>
            <button
              type="button"
              className="absolute top-4 right-4 rounded-full border border-emerald-900/15 bg-white p-1 transition hover:bg-emerald-50 rtl:right-auto rtl:left-4"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{labels.close}</span>
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
