"use client";

import { useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PdfDropzoneLabels = {
  hint: string;
  browse: string;
  formatsNote: string;
  invalidType: string;
};

const defaultLabels: PdfDropzoneLabels = {
  hint: "Drag & drop your PDF here",
  browse: "Browse files",
  formatsNote: "PDF only",
  invalidType: "Please upload a PDF file only.",
};

function isPdfFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PdfDropzoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  labels?: Partial<PdfDropzoneLabels>;
  disabled?: boolean;
  className?: string;
};

export default function PdfDropzone({
  file,
  onFileChange,
  labels,
  disabled,
  className,
}: PdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const L: PdfDropzoneLabels = {
    hint: labels?.hint?.trim() ? labels.hint : defaultLabels.hint,
    browse: labels?.browse?.trim() ? labels.browse : defaultLabels.browse,
    formatsNote: labels?.formatsNote?.trim()
      ? labels.formatsNote
      : defaultLabels.formatsNote,
    invalidType: labels?.invalidType?.trim()
      ? labels.invalidType
      : defaultLabels.invalidType,
  };

  const handlePick = (picked: File | null) => {
    if (!picked) return;
    if (!isPdfFile(picked)) {
      toast.error(L.invalidType);
      return;
    }
    onFileChange(picked);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handlePick(e.target.files?.[0] ?? null);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />

      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        className={cn(
          "group relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 outline-none",
          "focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2",
          disabled && "pointer-events-none opacity-50",
          isDragging
            ? "scale-[1.01] border-amber-500 bg-gradient-to-br from-amber-100/90 via-orange-50 to-amber-50 shadow-lg shadow-amber-500/15"
            : "border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 hover:border-amber-400/70 hover:shadow-md hover:shadow-amber-900/5"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (disabled) return;
          const dropped = e.dataTransfer.files?.[0] ?? null;
          handlePick(dropped);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_30%_20%,#f59e0b_0%,transparent_55%),radial-gradient(circle_at_80%_80%,#ea580c_0%,transparent_50%)]" />

        <div className="relative flex flex-col items-center gap-3 px-4 py-8 md:py-10">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner transition-transform duration-300",
              isDragging
                ? "bg-amber-500 text-white scale-110"
                : "bg-white/90 text-amber-700 ring-1 ring-amber-200/80 group-hover:scale-105"
            )}
          >
            <Upload className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <div className="text-center space-y-1 max-w-sm">
            <p className="text-sm font-semibold text-slate-800">{L.hint}</p>
            <p className="text-xs text-muted-foreground">{L.formatsNote}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="pointer-events-auto mt-1 border border-amber-200/80 bg-white/90 text-amber-900 shadow-sm hover:bg-amber-50"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            {L.browse}
          </Button>
        </div>
      </div>

      {file ? (
        <div
          className="flex items-center gap-3 rounded-xl border border-amber-200/60 bg-white/95 px-3 py-2.5 shadow-sm ring-1 ring-amber-900/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700 ring-1 ring-red-100">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={disabled}
            onClick={() => {
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
