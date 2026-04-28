/**
 * Shared Tailwind class groups for dashboard list + form pages.
 * Edit here to restyle the whole admin UI consistently.
 */
export const dash = {
  /** Outer wrapper for most list index pages (inside layout content area). */
  page: "w-full mx-auto py-10 px-4 md:px-4",

  /** Narrower create/edit forms (simple single-column flows). */
  formPageNarrow: "w-full mx-auto py-10 px-4 md:px-4",

  /** Default create/edit width (matches lessons). */
  formPage: "w-full mx-auto py-10 px-4 md:px-4",

  /** Wide create/edit (roles + permission matrix). */
  formPageWide: "w-full  mx-auto py-10 px-4 md:px-4",

  /** Primary list card (Subjects, Lessons, Doctors, …). */
  listCard:
    "overflow-hidden rounded-3xl border-slate-200/80 bg-card shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4 py-0 gap-0",

  /** Gradient header strip on list pages. */
  listHeader:
    "flex flex-col gap-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-emerald-50/45 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-10 space-y-0",

  /** Card body under list header (table zone). */
  listContent: "pb-8 pt-6 px-2 md:pb-10 md:pt-8",

  /** Icon badge in list header (left of title). */
  pageIconBox:
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-800 shadow-inner ring-1 ring-emerald-200/60",

  listTitle:
    "text-xl md:text-2xl font-bold text-slate-900 leading-tight border-0 p-0",

  listDescription: "text-base text-slate-600 leading-relaxed max-w-2xl",

  /** Primary “Create …” button in list header. */
  primaryCta:
    "w-full shrink-0 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-5 text-base font-semibold shadow-lg shadow-emerald-900/20 hover:from-emerald-600 hover:to-teal-600 md:w-auto",

  /** Pass-through to DataTable root `className`. */
  dataTableOuter:
    "[&_input.max-w-sm]:h-11 [&_input.max-w-sm]:rounded-xl [&_input.max-w-sm]:border-slate-200/90 [&_input.max-w-sm]:bg-white/95 [&_input.max-w-sm]:shadow-sm [&_input.max-w-sm]:py-3 [&_select]:rounded-lg [&_select]:border-slate-200/90 [&_tbody_tr:hover]:bg-emerald-50/35",

  dataTableCard:
    "rounded-2xl border-slate-200/90 bg-white shadow-md shadow-slate-900/5 ring-1 ring-slate-900/4",

  dataTableHeader:
    "bg-gradient-to-r from-emerald-50/90 via-slate-50/90 to-white [&_th]:border-slate-200/80 [&_th]:font-semibold [&_th]:text-slate-700",

  /** Row action buttons in DataTable */
  tableView:
    "rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-900/15",
  tableEdit:
    "rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-900/15",

  /** Status column switch */
  statusSwitch: "data-[state=checked]:bg-emerald-600",

  /* —— Form pages (create / edit) —— */

  formCard:
    "overflow-hidden rounded-3xl border-slate-200/80 shadow-xl shadow-slate-900/6 ring-1 ring-slate-900/4",

  formCardHeader:
    "space-y-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 pb-8 pt-8 md:pt-10 md:pb-10 px-6 md:px-10",

  formCardContent: "px-4 py-8 md:px-10 md:py-10",

  /** Text inputs & selects on forms */
  input:
    "rounded-xl border-slate-200 bg-white/90 shadow-sm transition focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400/60",

  select:
    "flex h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400/60",

  /** Main submit on create/edit forms */
  formSubmit:
    "mt-6 w-full md:w-auto md:min-w-[200px] mx-auto flex rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-10 py-6 text-base font-semibold shadow-lg shadow-emerald-900/20 hover:from-emerald-600 hover:to-teal-600",

  /** Neutral “lesson details” style section */
  sectionNeutral:
    "rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 p-6 md:p-8 shadow-sm ring-1 ring-slate-900/3",

  sectionIconWrap:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100",

  /** Violet videos block */
  sectionVideos:
    "rounded-2xl border-2 border-violet-200/70 bg-gradient-to-b from-violet-50/50 via-white to-white p-6 md:p-8 shadow-md shadow-violet-950/6 ring-1 ring-violet-900/4",

  videosCard:
    "rounded-xl border border-violet-100/90 bg-white/95 p-4 md:p-5 shadow-sm ring-1 ring-violet-900/3 transition hover:ring-violet-300/40",

  videoAddBtn:
    "shrink-0 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20",

  /** Rich text / CKEditor section shell */
  sectionRichContent:
    "rounded-2xl border border-emerald-200/75 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 p-6 md:p-8 shadow-sm ring-1 ring-emerald-900/5",

  /** PDF block */
  sectionPdf:
    "rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/25 p-6 md:p-8 shadow-lg shadow-amber-950/5 ring-1 ring-amber-900/6",

  pdfAddBtnOutline:
    "shrink-0 rounded-xl border-amber-300/80 bg-white text-amber-950 hover:bg-amber-50",

  /** Footer strip with checkbox + submit */
  formFooterBar:
    "rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-5 md:px-8 md:py-6",

  /** Read-only field value in view / detail pages */
  viewFieldBox:
    "mt-1 text-sm rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-sm ring-1 ring-slate-900/4",

  /** Back button on read-only view pages (matches lesson view) */
  viewBackButton:
    "rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white px-8 py-6 text-base font-semibold shadow-lg",
} as const;

export type DashKeys = keyof typeof dash;
