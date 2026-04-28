/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import "./style.css";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ClipboardList,
  FileStack,
  FileText,
  Film,
  PlaySquare,
  Plus,
  Trash2,
} from "lucide-react";

import { useGetSubjectsQuery } from "@/store/subjects/subjectsApi";
import { useGetDoctorsQuery } from "@/store/doctors/doctorsApi";
import { useCreateLessonMutation } from "@/store/lessons/lessonsApi";
import { useSessionReady } from "@/hooks/useSessionReady";

import LessonFormSkeleton from "@/components/skeleton/LessonFormSkeleton";
import { LessonCkEditorSkeleton } from "@/components/skeleton/LessonCkEditorSkeleton";
import PdfDropzone from "@/components/shared/PdfDropzone";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { parseLocalizedNameFromModel } from "@/utils/localizedName";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";

import type { ILessonVideoPayload } from "@/types/lesson";

const CkEditor = dynamic(() => import("@/components/ckEditor/CKEditor"), {
  ssr: false,
  loading: () => <LessonCkEditorSkeleton />,
});

function newKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

type VideoRow = {
  key: string;
  title: string;
  youtube_url: string;
  is_active: boolean;
};

type PdfRow = { key: string; file: File | null };

function rowsToVideos(rows: VideoRow[]): ILessonVideoPayload[] {
  return rows
    .filter((r) => r.title.trim() && r.youtube_url.trim())
    .map((r) => ({
      title: r.title.trim(),
      youtube_url: r.youtube_url.trim(),
      is_active: r.is_active,
    }));
}

export default function CreateLesson() {
  const sessionReady = useSessionReady();
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();

  const pageDir = lang === "ar" ? "rtl" : "ltr";

  const { data: subjects = [], isLoading: loadingSubjects } =
    useGetSubjectsQuery(undefined, { skip: !sessionReady });
  const { data: doctors = [], isLoading: loadingDoctors } = useGetDoctorsQuery(
    undefined,
    {
      skip: !sessionReady,
    },
  );

  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation();

  const [lessonNumber, setLessonNumber] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [doctorId, setDoctorId] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  const [videoRows, setVideoRows] = useState<VideoRow[]>([
    { key: newKey(), title: "", youtube_url: "", is_active: true },
  ]);
  const [pdfRows, setPdfRows] = useState<PdfRow[]>([
    { key: newKey(), file: null },
  ]);

  const cl = translate?.pages.lessons.createLesson;

  const subjectLabel = (row: any) => {
    const loc = parseLocalizedNameFromModel(row);
    return lang === "ar" ? loc.name_ar || loc.name : loc.name_en || loc.name;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (subjectId === "" || Number(subjectId) <= 0) {
      toast.error(
        lang === "ar"
          ? "يرجى اختيار المادة الدراسية"
          : "Please select a subject",
      );
      return;
    }
    if (doctorId === "" || Number(doctorId) <= 0) {
      toast.error(
        lang === "ar"
          ? "يرجى اختيار عضو هيئة التدريس"
          : "Please select an instructor",
      );
      return;
    }

    const videos = rowsToVideos(videoRows);
    const attachments = pdfRows
      .map((r) => r.file)
      .filter((f): f is File => f !== null);

    try {
      const res = await createLesson({
        lesson_number: lessonNumber.trim(),
        title: title.trim(),
        content: content.trim(),
        subject_id: Number(subjectId),
        doctor_id: Number(doctorId),
        is_active: isActive,
        videos,
        attachments,
      }).unwrap();

      toast.success(res?.message);
      router.push(`/${lang}/lessons`);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
        return;
      }
      if (errorData?.message) {
        toast.error(errorData.message);
        return;
      }
    }
  };

  const addVideoRow = () =>
    setVideoRows((prev) => [
      ...prev,
      { key: newKey(), title: "", youtube_url: "", is_active: true },
    ]);

  const removeVideoRow = (key: string) => {
    setVideoRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.key !== key),
    );
  };

  const updateVideoRow = (
    key: string,
    patch: Partial<Omit<VideoRow, "key">>,
  ) => {
    setVideoRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  };

  const addPdfRow = () =>
    setPdfRows((prev) => [...prev, { key: newKey(), file: null }]);

  const removePdfRow = (key: string) => {
    setPdfRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.key !== key),
    );
  };

  if (!sessionReady || loadingSubjects || loadingDoctors) {
    return <LessonFormSkeleton />;
  }

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <Film className="w-6 h-6" />
            </span>
            <span className="leading-tight">{cl?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {cl?.description}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-10 md:space-y-12">
            {/* —— Lesson details —— */}
            <section
              aria-labelledby="section-details"
              className={dash.sectionNeutral}
            >
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <ClipboardList className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="space-y-1 min-w-0">
                  <h2
                    id="section-details"
                    className="text-lg font-bold tracking-tight text-slate-900"
                  >
                    {cl?.sectionLessonDetails}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {cl?.sectionLessonDetailsHint}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {cl?.lessonNumber}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={lessonNumber}
                    onChange={(e) => setLessonNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {cl?.titleField}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {cl?.subject}
                  </Label>
                  <select
                    className={dash.select}
                    value={subjectId === "" ? "" : String(subjectId)}
                    onChange={(e) =>
                      setSubjectId(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  >
                    <option value="">{cl?.selectSubject}</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {subjectLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {cl?.doctor}
                  </Label>
                  <select
                    className={dash.select}
                    value={doctorId === "" ? "" : String(doctorId)}
                    onChange={(e) =>
                      setDoctorId(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  >
                    <option value="">{cl?.selectDoctor}</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* —— Videos —— */}
            <section
              aria-labelledby="section-videos"
              className={dash.sectionVideos}
            >
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-start gap-4 min-w-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
                    <PlaySquare className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="space-y-1 min-w-0">
                    <h2
                      id="section-videos"
                      className="text-lg font-bold text-slate-900"
                    >
                      {cl?.sectionVideosTitle}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {cl?.sectionVideosHint}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className={dash.videoAddBtn}
                  onClick={addVideoRow}
                >
                  <Plus className="w-4 h-4 me-1.5 opacity-90" />
                  {cl?.addVideo}
                </Button>
              </div>

              <div className="space-y-4">
                {videoRows.map((row, idx) => (
                  <div key={row.key} className={dash.videosCard}>
                    <div className="flex justify-between items-center gap-2 mb-4">
                      <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-800 ring-1 ring-violet-100">
                        #{idx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeVideoRow(row.key)}
                        disabled={videoRows.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          {cl?.videoTitle}
                        </Label>
                        <Input
                          className={cn("h-10", dash.input)}
                          value={row.title}
                          onChange={(e) =>
                            updateVideoRow(row.key, { title: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          {cl?.youtubeUrl}
                        </Label>
                        <Input
                          className={cn("h-10", dash.input)}
                          dir="ltr"
                          placeholder="https://..."
                          value={row.youtube_url}
                          onChange={(e) =>
                            updateVideoRow(row.key, {
                              youtube_url: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50/80 px-3 py-2.5">
                      <Checkbox
                        checked={row.is_active}
                        onCheckedChange={(v) =>
                          updateVideoRow(row.key, { is_active: Boolean(v) })
                        }
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {cl?.videoActive}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* —— Rich content (CKEditor) —— */}
            <section
              aria-labelledby="section-content"
              className={dash.sectionRichContent}
            >
              <div className="mb-5 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <FileText className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="space-y-1 min-w-0">
                  <h2
                    id="section-content"
                    className="text-lg font-bold tracking-tight text-slate-900"
                  >
                    {cl?.content}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {cl?.sectionContentHint}
                  </p>
                </div>
              </div>
              <div className="lesson-form-editor">
                <CkEditor
                  editorData={content}
                  handleOnUpdate={setContent}
                  config={{
                    language: lang === "ar" ? "ar" : "en",
                    direction: lang === "ar" ? "rtl" : "ltr",
                  }}
                />
              </div>
            </section>

            {/* Visual separation between videos and PDF */}
            <div className="relative py-6 md:py-8" aria-hidden>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-slate-300/90 to-transparent" />
              <div className="relative mx-auto flex w-fit items-center gap-3 rounded-full border border-slate-200/90 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 shadow-sm">
                <span className="h-1 w-1 rounded-full bg-amber-400" />
                {cl?.sectionPdfDivider}
                <span className="h-1 w-1 rounded-full bg-amber-400" />
              </div>
            </div>

            {/* —— PDF attachments —— */}
            <section
              aria-labelledby="section-pdf"
              className={dash.sectionPdf}
            >
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-start gap-4 min-w-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-600/30">
                    <FileStack className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="space-y-1 min-w-0">
                    <h2
                      id="section-pdf"
                      className="text-lg font-bold text-slate-900"
                    >
                      {cl?.sectionPdfTitle}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {cl?.sectionPdfHint}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={dash.pdfAddBtnOutline}
                  onClick={addPdfRow}
                >
                  <Plus className="w-4 h-4 me-1.5" />
                  {cl?.addPdf}
                </Button>
              </div>

              <div className="space-y-8">
                {pdfRows.map((row, idx) => (
                  <div key={row.key} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label className="text-sm font-semibold text-slate-800">
                        {cl?.pdfFile} · {idx + 1}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => removePdfRow(row.key)}
                        disabled={pdfRows.length <= 1}
                      >
                        <Trash2 className="w-4 h-4 me-1" />
                        {cl?.removePdfSlot}
                      </Button>
                    </div>
                    <PdfDropzone
                      file={row.file}
                      onFileChange={(file) =>
                        setPdfRows((prev) =>
                          prev.map((r) =>
                            r.key === row.key ? { ...r, file } : r,
                          ),
                        )
                      }
                      labels={{
                        hint: cl?.pdfDropHint ?? "",
                        browse: cl?.pdfBrowseBtn ?? "",
                        formatsNote: cl?.pdfFormatsNote ?? "",
                        invalidType: cl?.pdfInvalidType ?? "",
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Publish + submit */}
            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(Boolean(v))}
                />
                <span className="text-sm font-medium text-slate-800">
                  {cl?.isActive}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isCreating || !subjects.length || !doctors.length}
                className={dash.formSubmit}
              >
                {isCreating ? `${cl?.processing}...` : `${cl?.createBtn}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
