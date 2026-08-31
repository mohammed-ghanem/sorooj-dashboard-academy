type UploadProgressListener = (percent: number) => void;

const listeners = new Set<UploadProgressListener>();
let legacyListener: UploadProgressListener | null = null;

export function subscribeUploadProgress(listener: UploadProgressListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setUploadProgressListener(next: UploadProgressListener | null) {
  if (legacyListener) listeners.delete(legacyListener);
  legacyListener = next;
  if (next) listeners.add(next);
}

export function reportUploadProgress(percent: number) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  listeners.forEach((listener) => listener(value));
}
