"use client";

import { useMemo, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageDropzoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  existingImageUrl?: string;
  className?: string;
  accept?: string;
  showRemoveButton?: boolean;
};

export default function ImageDropzone({
  file,
  onFileChange,
  existingImageUrl,
  className = "",
  accept = "image/*",
  showRemoveButton = true,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return existingImageUrl || "";
  }, [file, existingImageUrl]);

  const handlePick = (picked: File | null) => {
    if (!picked) return;
    if (!picked.type.startsWith("image/")) return;
    onFileChange(picked);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
      />

      <div
        className={`rounded-lg border-2 border-dashed p-5 text-center transition-colors ${
          isDragging
            ? "border-green-600 bg-green-50"
            : "border-gray-300 bg-background hover:border-green-500"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handlePick(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag and drop image here or click to browse
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-1"
            onClick={() => inputRef.current?.click()}
          >
            Choose image
          </Button>
        </div>
      </div>

      {previewUrl ? (
        <div className="flex items-center gap-3 rounded-md border p-2">
          <img
            src={previewUrl}
            alt="cover preview"
            className="h-24 w-24 rounded-md object-cover border"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">{file ? file.name : "Current cover image"}</p>
            <p className="text-xs text-muted-foreground">
              {file ? `${Math.round(file.size / 1024)} KB` : "No new upload selected"}
            </p>
          </div>
          {showRemoveButton ? (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => {
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
