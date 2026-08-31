"use client";

import { useEffect, useState } from "react";
import { subscribeUploadProgress } from "@/lib/uploadProgressBus";

export function useFormSubmitProgress(isSubmitting: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => subscribeUploadProgress(setProgress), []);

  useEffect(() => {
    if (!isSubmitting) setProgress(0);
  }, [isSubmitting]);

  return progress;
}
