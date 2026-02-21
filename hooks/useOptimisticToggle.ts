import { useState } from "react";

type ToggleFn<T> = (item: T, next: boolean) => Promise<void>;
type GetIdFn<T> = (item: T) => number;
type GetStatusFn<T> = (item: T) => boolean;

export function useOptimisticToggle<T>({
    getId,
    getStatus,
    onToggle,
  }: {
    getId: (item: T) => number;
    getStatus: (item: T) => boolean;
    onToggle: (item: T, next: boolean) => Promise<void>;
  }) {
    const [optimisticMap, setOptimisticMap] = useState<Record<number, boolean>>({});
    const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  
    const getOptimisticStatus = (item: T) =>
      optimisticMap[getId(item)] ?? getStatus(item);
  
    const toggle = async (item: T, next: boolean) => {
      const id = getId(item);
  
      if (pendingIds.has(id)) return;
  
      // ⛔ تجاهل event المكرر
      if (getOptimisticStatus(item) === next) return;
  
      setOptimisticMap((p) => ({ ...p, [id]: next }));
      setPendingIds((p) => new Set(p).add(id));
  
      try {
        await onToggle(item, next);
      } catch {
        setOptimisticMap((p) => ({ ...p, [id]: getStatus(item) }));
        throw new Error();
      } finally {
        setPendingIds((p) => {
          const s = new Set(p);
          s.delete(id);
          return s;
        });
      }
    };
  
    return {
      getOptimisticStatus,
      toggle,
      isPending: (item: T) => pendingIds.has(getId(item)),
    };
  }
  