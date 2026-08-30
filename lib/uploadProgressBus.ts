type UploadProgressListener = (percent: number) => void;

let listener: UploadProgressListener | null = null;

export function setUploadProgressListener(next: UploadProgressListener | null) {
  listener = next;
}

export function reportUploadProgress(percent: number) {
  listener?.(Math.max(0, Math.min(100, Math.round(percent))));
}
