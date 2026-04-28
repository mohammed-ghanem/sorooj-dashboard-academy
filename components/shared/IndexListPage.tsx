"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

export type IndexListPageProps = {
  /** Page icon in header badge */
  icon: LucideIcon;
  title: string;
  /** Shown under title; omit on compact pages */
  description?: string;
  /** Primary CTA — hidden when `showCreate` is false */
  createHref: string;
  createLabel: string;
  showCreate?: boolean;
  showSkeleton: boolean;
  dir?: "rtl" | "ltr";
  children: React.ReactNode;
  className?: string;
};

/**
 * Shared list/index layout: gradient header, optional create button, table body.
 * Uses `dash` tokens from `@/constants/dashboardUi`.
 */
export default function IndexListPage({
  icon: Icon,
  title,
  description,
  createHref,
  createLabel,
  showCreate = true,
  showSkeleton,
  dir,
  children,
  className,
}: IndexListPageProps) {
  return (
    <div className={cn(dash.page, className)} dir={dir}>
      <Card className={dash.listCard}>
        <CardHeader className={dash.listHeader}>
          {showSkeleton ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
              <div className="flex flex-wrap items-center gap-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48 max-w-full" />
                  <Skeleton className="h-4 w-72 max-w-full" />
                </div>
              </div>
              {showCreate ? (
                <Skeleton className="h-11 w-full md:w-44 rounded-xl shrink-0" />
              ) : null}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start gap-4 min-w-0">
                <span className={dash.pageIconBox}>
                  <Icon className="w-6 h-6" />
                </span>
                <div className="space-y-1 min-w-0">
                  <CardTitle className={dash.listTitle}>{title}</CardTitle>
                  {description ? (
                    <CardDescription className={dash.listDescription}>
                      {description}
                    </CardDescription>
                  ) : null}
                </div>
              </div>
              {showCreate ? (
                <Button asChild className={dash.primaryCta}>
                  <Link href={createHref}>
                    <Plus className="w-5 h-5 me-2 opacity-95" />
                    {createLabel}
                  </Link>
                </Button>
              ) : null}
            </>
          )}
        </CardHeader>

        <CardContent className={dash.listContent}>{children}</CardContent>
      </Card>
    </div>
  );
}
