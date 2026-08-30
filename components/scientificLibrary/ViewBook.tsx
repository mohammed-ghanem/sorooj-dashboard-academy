"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { BookOpen, Eye, FileStack } from "lucide-react";
import { useGetBookByIdQuery } from "@/store/books/booksApi";
import { useSessionReady } from "@/hooks/useSessionReady";
import LangUseParams from "@/translate/LangUseParams";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import TranslateHook from "@/translate/TranslateHook";
import ViewLessonSkeleton from "@/components/skeleton/ViewLessonSkeleton";
import "ckeditor5/ckeditor5.css";
import "@/components/ckEditor/style.css";

export default function ViewBook() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const translate = TranslateHook();
  const t = translate?.pages.books.viewBook;
  const pg = translate?.pages.books;
  const bookId = Number(id);

  const { data: book, isLoading, isError } = useGetBookByIdQuery(bookId, {
    skip: !sessionReady || !id || Number.isNaN(bookId),
  });

  if (!sessionReady || isLoading) return <ViewLessonSkeleton />;

  if (isError || !book) {
    return (
      <div
        className={cn(dash.formPage, "text-center text-muted-foreground")}
        dir={pageDir}
      >
        {t?.notFound}
      </div>
    );
  }

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl font-bold text-slate-900 md:text-2xl">
            <span className={dash.pageIconBox}>
              <Eye className="h-6 w-6" />
            </span>
            <div className="min-w-0 space-y-2">
              <span className="block leading-tight">{t?.title}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {t?.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 px-4 py-8 md:px-10 md:py-10">
          <section className={dash.sectionNeutral}>
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <span className={dash.sectionIconWrap}>
                <BookOpen className="h-5 w-5" strokeWidth={2} />
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label className="font-semibold text-slate-800">
                  {t?.titleField}
                </Label>
                <div className={dash.viewFieldBox}>{book.title || "—"}</div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.category}
                </Label>
                <div className={dash.viewFieldBox}>
                  {book.category?.name ||
                    (book.category_id ? `#${book.category_id}` : "—")}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.doctor}
                </Label>
                <div className={dash.viewFieldBox}>
                  {book.doctor?.name ||
                    (book.doctor_id ? `#${book.doctor_id}` : "—")}
                </div>
              </div>
            </div>
          </section>

          {book.image ? (
            <>
              <Separator />
              <div>
                <Label className="mb-3 block font-semibold text-slate-800">
                  {t?.image}
                </Label>
                <div className="relative h-56 w-full max-w-md overflow-hidden rounded-xl border">
                  <Image
                    src={book.image}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </>
          ) : null}

          <Separator />

          <section className={dash.sectionRichContent}>
            <Label className="mb-3 block font-semibold text-slate-800">
              {t?.content}
            </Label>
            <div
              className="prose prose-slate max-w-none rounded-xl border bg-white p-4 md:p-6"
              dangerouslySetInnerHTML={{ __html: book.content || "—" }}
            />
          </section>

          {(book.attachments?.length ?? 0) > 0 ? (
            <>
              <Separator />
              <section className={dash.sectionPdf}>
                <div className="mb-4 flex items-center gap-3">
                  <FileStack className="h-5 w-5 text-amber-700" />
                  <Label className="font-semibold text-slate-800">
                    {t?.attachments}
                  </Label>
                </div>
                <ul className="space-y-2">
                  {book.attachments!.map((att) => (
                    <li key={att.id}>
                      <a
                        href={att.file_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-800 underline"
                      >
                        {att.name || att.file_url || `#${att.id}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}

          <Separator />

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4">
            <Label className="font-semibold text-slate-800">{t?.status}</Label>
            {book.is_active ? (
              <Badge className="bg-emerald-600 px-3 py-1 font-semibold hover:bg-emerald-600">
                {pg?.active}
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1 font-semibold">
                {pg?.inactive}
              </Badge>
            )}
          </div>

          {book.created_at ? (
            <>
              <Separator />
              <div>
                <Label className="font-semibold text-slate-800">
                  {t?.createdAt}
                </Label>
                <div className={dash.viewFieldBox}>{book.created_at}</div>
              </div>
            </>
          ) : null}

          <Button
            type="button"
            className={dash.viewBackButton}
            onClick={() => router.back()}
          >
            {t?.backBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
