/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSwapOrderMutation } from "@/store/swapOrder/swapOrderApi";
import type { SwapOrderItem, SwapOrderType } from "@/types/swapOrder";

type Props = {
  type: SwapOrderType;
  items: SwapOrderItem[];
  isLoading?: boolean;
  emptyLabel: string;
  positionLabel: string;
  titleLabel: string;
  actionsLabel: string;
  moveUpLabel: string;
  moveDownLabel: string;
  goToLabel: string;
};

function showSwapError(err: any) {
  const errorData = err?.data ?? err;
  if (errorData?.errors) {
    Object.values(errorData.errors).forEach((messages: any) =>
      (messages as string[]).forEach((msg) => toast.error(msg)),
    );
    return;
  }
  toast.error(errorData?.message ?? "Swap failed");
}

export default function SwapOrderList({
  type,
  items,
  isLoading,
  emptyLabel,
  positionLabel,
  titleLabel,
  actionsLabel,
  moveUpLabel,
  moveDownLabel,
  goToLabel,
}: Props) {
  const [rows, setRows] = useState<SwapOrderItem[]>(items);
  const [busy, setBusy] = useState(false);
  const [swapOrder] = useSwapOrderMutation();

  const itemsOrderKey = useMemo(
    () => items.map((item) => item.id).join(","),
    [items],
  );

  useEffect(() => {
    if (busy) return;
    setRows(items);
  }, [items, itemsOrderKey, busy]);

  const swapAdjacent = async (
    list: SwapOrderItem[],
    index: number,
    direction: -1 | 1,
    skipInvalidate: boolean,
  ) => {
    const otherIndex = index + direction;
    const first = list[index];
    const second = list[otherIndex];
    if (!first || !second) {
      throw new Error("Invalid swap indices");
    }

    const res = await swapOrder({
      type,
      first_id: first.id,
      second_id: second.id,
      skipInvalidate,
    }).unwrap();

    const next = [...list];
    [next[index], next[otherIndex]] = [next[otherIndex], next[index]];
    return { next, message: res?.message as string | undefined };
  };

  const move = async (index: number, direction: -1 | 1) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= rows.length || busy) return;

    const previous = rows;
    setBusy(true);

    try {
      const { next, message } = await swapAdjacent(
        rows,
        index,
        direction,
        false,
      );
      setRows(next);
      if (message) toast.success(message);
    } catch (err: any) {
      setRows(previous);
      showSwapError(err);
    } finally {
      setBusy(false);
    }
  };

  const moveTo = async (fromIndex: number, toIndex: number) => {
    if (
      busy ||
      fromIndex === toIndex ||
      toIndex < 0 ||
      toIndex >= rows.length
    ) {
      return;
    }

    const previous = rows;
    const direction: -1 | 1 = toIndex > fromIndex ? 1 : -1;
    let list = [...rows];
    let current = fromIndex;
    setBusy(true);

    try {
      let lastMessage: string | undefined;
      while (current !== toIndex) {
        const isLastStep = current + direction === toIndex;
        const { next, message } = await swapAdjacent(
          list,
          current,
          direction,
          !isLastStep,
        );
        list = next;
        current += direction;
        setRows(list);
        lastMessage = message ?? lastMessage;
      }
      if (lastMessage) toast.success(lastMessage);
    } catch (err: any) {
      setRows(previous);
      showSwapError(err);
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-2 md:p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <p className="px-4 py-10 text-center text-sm text-slate-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto px-1 md:px-2">
      <table className="w-full min-w-160 border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-slate-500">
            <th className="w-16 px-3 py-2 text-start font-medium">
              {positionLabel}
            </th>
            <th className="px-3 py-2 text-start font-medium">{titleLabel}</th>
            <th className="w-56 px-3 py-2 text-start font-medium">
              {actionsLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className={cn(
                "rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80",
                busy && "opacity-70",
              )}
            >
              <td className="rounded-s-xl px-3 py-3 align-middle">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm font-semibold tabular-nums text-emerald-800 ring-1 ring-emerald-100">
                  {index + 1}
                </span>
              </td>
              <td className="px-3 py-3 align-middle font-medium text-slate-900">
                {row.label}
              </td>
              <td className="rounded-e-xl px-3 py-3 align-middle">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-lg"
                    disabled={index === 0 || busy}
                    onClick={() => move(index, -1)}
                    aria-label={moveUpLabel}
                    title={moveUpLabel}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-lg"
                    disabled={index === rows.length - 1 || busy}
                    onClick={() => move(index, 1)}
                    aria-label={moveDownLabel}
                    title={moveDownLabel}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>

                  <label className="sr-only" htmlFor={`go-to-${row.id}`}>
                    {goToLabel}
                  </label>
                  <select
                    id={`go-to-${row.id}`}
                    className="h-9 min-w-20 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
                    value={index + 1}
                    disabled={busy || rows.length < 2}
                    title={goToLabel}
                    aria-label={goToLabel}
                    onChange={(e) => {
                      const target = Number(e.target.value) - 1;
                      if (Number.isNaN(target) || target === index) return;
                      void moveTo(index, target);
                    }}
                  >
                    {rows.map((_, pos) => (
                      <option key={pos} value={pos + 1}>
                        {goToLabel} {pos + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
