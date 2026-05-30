/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, PlayCircle } from "lucide-react";

import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import { useSessionReady } from "@/hooks/useSessionReady";
import { useGetLessonVideosQuery } from "@/store/lessonVideos/lessonVideosApi";
import { useDeleteVideoExamMutation } from "@/store/videoExams/videoExamsApi";
import { toast } from "sonner";

import IndexListPage from "@/components/shared/IndexListPage";
import { Column, DataTable } from "@/components/datatable/DataTable";
import { TABLE_HEADERS } from "@/constants/tableHeaders";
import { dash } from "@/constants/dashboardUi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import VideoExamActionsCell from "@/components/lessons/videos/exam/VideoExamActionsCell";

import type { ILessonVideoListItem } from "@/types/lessonVideo";

export default function LessonVideos() {
  const sessionReady = useSessionReady();
  const { lessonId: lessonIdParam } = useParams<{ lessonId: string }>();
  const lang = LangUseParams() ?? "ar";
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const pg = translate?.pages.lessons;
  const vx = pg?.videoExam;

  const headers = TABLE_HEADERS[lang as "ar" | "en"].lessonVideos;

  const lessonId = Number(lessonIdParam);
  const invalidId =
    lessonIdParam == null ||
    lessonIdParam === "" ||
    Number.isNaN(lessonId) ||
    lessonId <= 0;

  const { data, isLoading, isError } = useGetLessonVideosQuery(lessonId, {
    skip: !sessionReady || invalidId,
  });
  const [deleteVideoExam] = useDeleteVideoExamMutation();

  const videos = data?.videos ?? [];

  const handleDeleteExam = async (videoId: number) => {
    try {
      const res = await deleteVideoExam({ videoId, lessonId }).unwrap();
      toast.success(res?.message);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.message) {
        toast.error(errorData.message);
        return;
      }
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
      }
    }
  };
  const lesson = data?.lesson;

  const columns: Column<ILessonVideoListItem>[] = [
    {
      key: "title",
      header: headers.title,
      render: (_, row) => (
        <span className="font-medium text-slate-900 line-clamp-2 max-w-md">
          {row.title || "—"}
        </span>
      ),
    },
    {
      key: "youtube_url",
      header: headers.youtubeUrl,
      render: (_, row) =>
        row.youtube_url ? (
          <a
            href={row.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-sky-700 hover:underline line-clamp-1 max-w-[200px]"
          >
            {row.youtube_url}
          </a>
        ) : (
          "—"
        ),
    },
    // {
    //   key: "is_active",
    //   header: headers.status,
    //   align: "center",
    //   render: (_, row) => (
    //     <Badge variant={row.is_active ? "default" : "secondary"}>
    //       {row.is_active ? pg?.active : pg?.inactive}
    //     </Badge>
    //   ),
    // },
    {
      key: "has_exam",
      header: headers.hasExam,
      align: "center",
      render: (_, row) => (
        <Badge
          className={cn(
            "border-transparent text-white shadow-sm",
            row.has_exam ? "bg-emerald-600" : "bg-red-500",
          )}
        >
          {row.has_exam ? vx?.examYes : vx?.examNo}
        </Badge>
      ),
    },
    {
      key: "id",
      header: headers.examActions,
      align: "center",
      render: (_, row) => (
        <VideoExamActionsCell
          videoId={row.id}
          lessonId={lessonId}
          lang={lang}
          examUi={vx}
          onDeleteExam={() => handleDeleteExam(row.id)}
        />
      ),
    },
  ];

  const showSkeleton = !sessionReady || isLoading;

  if (invalidId) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center text-muted-foreground">
        {vx?.lessonNotFound}
      </div>
    );
  }

  const listTitle = lesson
    ? `${vx?.listTitle ?? ""} — ${lesson.lesson_number ? `${lesson.lesson_number} · ` : ""}${lesson.title}`
    : (vx?.listTitle ?? "");

  return (
    <IndexListPage
      icon={PlayCircle}
      title={listTitle}
      description={vx?.listDescription}
      createHref={`/${lang}/lessons`}
      createLabel=""
      showCreate={false}
      showSkeleton={showSkeleton}
      dir={pageDir}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button asChild className={dash.primaryCta}>
          <Link href={`/${lang}/lessons`}>
            <ArrowLeft className="w-5 h-5 me-2 opacity-95 rtl:rotate-180" />
            {vx?.backLessons ?? pg?.viewLesson?.backBtn}
          </Link>
        </Button>
      </div>

      {isError && !showSkeleton ? (
        <p className="text-center text-muted-foreground py-8">{vx?.loadError}</p>
      ) : (
        <DataTable
          data={videos}
          columns={columns}
          isSkeleton={showSkeleton}
          searchPlaceholder={vx?.searchPlaceholder ?? ""}
          className={dash.dataTableOuter}
          tableCardClassName={dash.dataTableCard}
          tableHeaderClassName={dash.dataTableHeader}
        />
      )}
    </IndexListPage>
  );
}
