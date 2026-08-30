/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BookOpen,
  ClipboardList,
  FileStack,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { useGetBookCategoriesQuery } from "@/store/bookCategories/bookCategoriesApi";
import { useGetDoctorsQuery } from "@/store/doctors/doctorsApi";
import {
  useGetBookByIdQuery,
  useUpdateBookMutation,
  useDeleteBookAttachmentMutation,
} from "@/store/books/booksApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import { setUploadProgressListener } from "@/lib/uploadProgressBus";
import LessonFormSkeleton from "@/components/skeleton/LessonFormSkeleton";
import { LessonCkEditorSkeleton } from "@/components/skeleton/LessonCkEditorSkeleton";
import PdfDropzone from "@/components/shared/PdfDropzone";
import ImageDropzone from "@/components/shared/ImageDropzone";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
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
import { Separator } from "@/components/ui/separator";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { cn } from "@/lib/utils";
import { dash } from "@/constants/dashboardUi";
import { LIBRARY_BOOKS_BASE_PATH } from "@/constants/categoryModules";
import "@/components/lessons/style.css";

const CkEditor = dynamic(() => import("@/components/ckEditor/CKEditor"), {
  ssr: false,
  loading: () => <LessonCkEditorSkeleton />,
});

function newKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

type PdfRow = { key: string; file: File | null };

export default function EditBook() {
  const sessionReady = useSessionReady();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const lang = LangUseParams() as "ar" | "en";
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const bookId = Number(id);
  const t = translate?.pages.books.editBook;
  const pg = translate?.pages.books;

  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadingLabel =
    t?.uploadingFiles ??
    (lang === "ar" ? "جاري رفع الملفات..." : "Uploading files...");

  const {
    data: book,
    isLoading: loadingBook,
    isError: bookError,
  } = useGetBookByIdQuery(bookId, {
    skip: !sessionReady || !id || Number.isNaN(bookId),
  });
  const { data: categories = [], isLoading: loadingCategories } =
    useGetBookCategoriesQuery(undefined, {
      skip: !sessionReady,
    });
  const { data: doctors = [], isLoading: loadingDoctors } = useGetDoctorsQuery(
    undefined,
    { skip: !sessionReady },
  );
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const [deleteAttachment] = useDeleteBookAttachmentMutation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [doctorId, setDoctorId] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [pdfRows, setPdfRows] = useState<PdfRow[]>([
    { key: newKey(), file: null },
  ]);

  useEffect(() => {
    if (!book) return;
    setTitle(book.title ?? "");
    setContent(book.content ?? "");
    setCategoryId(book.category_id || "");
    setDoctorId(book.doctor_id || "");
    setIsActive(Boolean(book.is_active));
  }, [book]);

  const addPdfRow = () =>
    setPdfRows((prev) => [...prev, { key: newKey(), file: null }]);
  const removePdfRow = (key: string) => {
    setPdfRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.key !== key),
    );
  };

  const handleDeletePdf = async (attachmentId: number) => {
    try {
      const res = await deleteAttachment({ bookId, attachmentId }).unwrap();
      toast.success(res?.message);
    } catch (err: any) {
      toast.error(err?.data?.message ?? pg?.deleteAttachmentFailed);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryId === "" || doctorId === "") return;

    const attachments = pdfRows
      .map((r) => r.file)
      .filter((f): f is File => f !== null);

    const toastId = toast.loading(`${t?.processing}...`);
    setUploadProgress(0);
    setUploadProgressListener((percent) => {
      setUploadProgress(percent);
      toast.loading(`${uploadingLabel} ${percent}%`, { id: toastId });
    });

    try {
      const res = await updateBook({
        id: bookId,
        data: {
          title: title.trim(),
          content: content.trim(),
          category_id: Number(categoryId),
          doctor_id: Number(doctorId),
          is_active: isActive,
          image,
          attachments,
        },
      }).unwrap();
      toast.success(res?.message, { id: toastId });
      router.push(`/${lang}/${LIBRARY_BOOKS_BASE_PATH}`);
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          (messages as string[]).forEach((msg) => toast.error(msg, { id: toastId })),
        );
      } else if (errorData?.message) {
        toast.error(errorData.message, { id: toastId });
      } else {
        toast.error(
          lang === "ar" ? "فشل حفظ التغييرات" : "Failed to save changes",
          { id: toastId },
        );
      }
    } finally {
      setUploadProgressListener(null);
      setUploadProgress(0);
    }
  };

  if (
    !sessionReady ||
    loadingBook ||
    loadingCategories ||
    loadingDoctors
  ) {
    return <LessonFormSkeleton />;
  }

  if (bookError || !book) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {pg?.viewBook?.notFound}
      </div>
    );
  }

  const existingAttachments = book.attachments ?? [];

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-center gap-4 text-xl font-bold text-slate-900 md:text-2xl">
            <span className={dash.pageIconBox}>
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="leading-tight">{t?.title}</span>
          </CardTitle>
          <CardDescription className={dash.listDescription}>
            {t?.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={submit} className="space-y-10 md:space-y-12">
            <section className={dash.sectionNeutral}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {t?.titleField}
                  </Label>
                  <Input
                    className={cn("h-11", dash.input)}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {t?.category}
                  </Label>
                  <select
                    className={dash.select}
                    value={categoryId === "" ? "" : String(categoryId)}
                    onChange={(e) =>
                      setCategoryId(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                  >
                    <option value="">{t?.selectCategory}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-800">
                    {t?.doctor}
                  </Label>
                  <select
                    className={dash.select}
                    value={doctorId === "" ? "" : String(doctorId)}
                    onChange={(e) =>
                      setDoctorId(e.target.value ? Number(e.target.value) : "")
                    }
                  >
                    <option value="">{t?.selectDoctor}</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className={dash.sectionRichContent}>
              <div className="mb-5 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <FileText className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {t?.content}
                </h2>
              </div>
              <div className="lesson-form-editor">
                <CkEditor
                  editorData={content}
                  handleOnUpdate={setContent}
                  config={{ language: lang === "ar" ? "ar" : "en" }}
                />
              </div>
            </section>

            <section className={dash.sectionNeutral}>
              <Label className="mb-3 block text-sm font-semibold text-slate-800">
                {t?.image}
              </Label>
              <ImageDropzone
                file={image}
                onFileChange={setImage}
                existingImageUrl={book.image ?? undefined}
              />
            </section>

            <section className={cn(dash.sectionPdf, "space-y-6")}>
              <div className="rounded-xl border border-amber-100/90 bg-white/80 p-4 ring-1 ring-amber-900/5 md:p-5">
                <Label className="text-sm font-semibold text-slate-800">
                  {t?.existingPdfs}
                </Label>
                {existingAttachments.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">—</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {existingAttachments.map((att) => (
                      <li
                        key={att.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-100/90 bg-amber-50/40 px-3 py-2.5 text-sm"
                      >
                        <a
                          href={att.file_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="max-w-60 truncate font-medium text-emerald-800 underline"
                        >
                          {att.name || att.file_url || `#${att.id}`}
                        </a>
                        <DeleteConfirmDialog
                          title={pg?.deleteTitle ?? ""}
                          description={pg?.deleteAttachmentMessage ?? ""}
                          confirmText={pg?.deleteBtn ?? ""}
                          cancelText={pg?.cancelBtn ?? ""}
                          onConfirm={() => handleDeletePdf(att.id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-amber-100/80 pt-6">
                <Label className="text-base font-bold text-slate-900">
                  {t?.newPdfs}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={dash.pdfAddBtnOutline}
                  onClick={addPdfRow}
                >
                  <Plus className="me-1.5 h-4 w-4" />
                  {t?.addPdf}
                </Button>
              </div>

              {pdfRows.map((row, idx) => (
                <div key={row.key} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-sm font-semibold text-slate-800">
                      {t?.pdfFile} · {idx + 1}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => removePdfRow(row.key)}
                      disabled={pdfRows.length <= 1}
                    >
                      <Trash2 className="me-1 h-4 w-4" />
                      {pg?.removePdfSlot}
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
                      hint: t?.pdfDropHint ?? "",
                      browse: t?.browsePdf ?? "",
                      formatsNote: t?.pdfFormatsNote ?? "",
                      invalidType: t?.pdfInvalidType ?? "",
                    }}
                  />
                </div>
              ))}
            </section>

            <Separator />

            {isUpdating && uploadProgress > 0 ? (
              <div className="space-y-2 rounded-xl border border-amber-200/70 bg-amber-50/40 px-3 py-3">
                <div className="flex items-center justify-between text-xs text-amber-950">
                  <span>{uploadingLabel}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className={dash.formFooterBar}>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(Boolean(v))}
                />
                <span className="text-sm font-medium text-slate-800">
                  {t?.isActive}
                </span>
              </div>
              <Button
                type="submit"
                disabled={isUpdating}
                className={dash.formSubmit}
              >
                {isUpdating
                  ? uploadProgress > 0
                    ? `${uploadingLabel} ${uploadProgress}%`
                    : `${t?.processing}...`
                  : t?.editBtn}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
