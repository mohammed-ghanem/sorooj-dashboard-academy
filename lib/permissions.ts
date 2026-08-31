/* eslint-disable @typescript-eslint/no-explicit-any */

import { extractProfileUser, type ProfileUser } from "@/lib/profileUser";

export const CONTENT_MODULES = [
  "doctors",
  "cohorts",
  "academic_years",
  "students",
  "exam_article_reviews",
  "admins",
  "roles",
  "study_terms",
  "subjects",
  "lessons",
  "scientific_track_categories",
  "scientific_track_subjects",
  "book_categories",
  "books",
] as const;

/** Always reachable for any authenticated user. */
export const ALWAYS_ALLOWED_PATHS = new Set([
  "/",
  "/profile",
  "/update-profile",
  "/change-password",
]);

const MODULE_ROUTE_ALIASES: Record<string, string[]> = {
  doctors: ["doctors"],
  cohorts: ["cohorts"],
  students: ["students"],
  admins: ["admins"],
  roles: ["roles"],
  "academic-years": ["academic_years"],
  "exam-article-reviews": ["exam_article_reviews"],
  "academic-study": ["study_terms", "subjects", "lessons"],
  singleLearnPath: [
    "scientific_track_categories",
    "scientific_track_subjects",
    "lessons",
  ],
  "scientific-library": ["book_categories", "books"],
  "privacy-policy": ["privacy_policy", "settings"],
  "terms-conditions": ["terms_and_conditions", "settings"],
  "app-contacts": ["app_contacts", "settings"],
  "contact-us": ["contact_us", "settings"],
  "delete-account": ["delete_account", "settings"],
  settings: ["settings", "home_page"],
};

function addPermissionKey(out: Set<string>, value: string) {
  const key = value.trim().toLowerCase();
  if (key) out.add(key);
}

const MODULE_LABEL_HINTS: Record<string, string[]> = {
  doctors: ["doctors", "doctor", "هيئة", "تدريس", "عضو"],
  cohorts: ["cohorts", "cohort", "دفعات", "دفعة"],
  academic_years: ["academic_years", "academic-years", "أعوام", "عام"],
  students: ["students", "student", "طلاب", "طالب"],
  exam_article_reviews: [
    "exam_article_reviews",
    "exam-article-reviews",
    "أسئلة",
    "مقالية",
  ],
  admins: ["admins", "admin_users", "مستخدم", "المستخدمين"],
  roles: ["roles", "صلاحيات", "الأدوار"],
  study_terms: ["study_terms", "study-terms", "محاور", "محور"],
  subjects: ["subjects", "subject", "مواد", "مادة"],
  lessons: ["lessons", "lesson", "دروس", "درس"],
  scientific_track_categories: [
    "scientific_track_categories",
    "scientific-track-categories",
    "scientific_track",
    "scientific-track",
    "مسارات علمية",
    "المسارات العلمية",
    "مسارات",
    "تصنيفات المسارات",
    "أقسام المسارات",
  ],
  scientific_track_subjects: [
    "scientific_track_subjects",
    "scientific-track-subjects",
    "مواد المسارات",
    "مواد المسار",
  ],
  scientific_tracks: [
    "scientific_tracks",
    "scientific-tracks",
    "scientific_track",
    "scientific-track",
    "independent_tracks",
    "مسارات علمية",
    "المسارات العلمية",
    "مسارات علمية مستقلة",
    "تصنيفات المسارات",
    "مواد المسارات",
  ],
  book_categories: [
    "book_categories",
    "book-categories",
    "تصنيفات الكتب",
    "أقسام المكتبة",
    "المكتبة العلمية",
  ],
  books: [
    "books",
    "book",
    "كتب",
    "كتاب",
    "الكتب",
    "المكتبة العلمية",
    "scientific library",
  ],
  scientific_library: [
    "scientific_library",
    "scientific-library",
    "المكتبة العلمية",
    "تصنيفات الكتب",
    "الكتب",
  ],
  privacy_policy: ["privacy_policy", "privacy", "خصوصية", "سياسة"],
  terms_and_conditions: ["terms_and_conditions", "terms", "شروط", "أحكام"],
  app_contacts: ["app_contacts", "contacts", "تواصل"],
  contact_us: ["contact_us", "contact-us", "تواصل"],
  delete_account: ["delete_account", "delete-account", "حذف الحساب"],
  settings: ["settings", "إعدادات"],
  home_page: [
    "home_page",
    "home-page",
    "home_features",
    "home-features",
    "home_goals",
    "home-goals",
    "home_methodologies",
    "home-methodologies",
    "home_study_levels",
    "home-study-levels",
    "الصفحة الرئيسية",
    "التجربة",
    "أهدافنا",
    "منهجية الدراسة",
    "نظام الدراسة",
  ],
};

function inferModuleKeysFromText(value: string, keys: Set<string>) {
  const text = value.trim().toLowerCase();
  if (!text) return;

  for (const [module, hints] of Object.entries(MODULE_LABEL_HINTS)) {
    if (hints.some((hint) => text.includes(hint.toLowerCase()))) {
      addPermissionKey(keys, module);
    }
  }
}

function collectPermissionKeys(value: unknown, out: Set<string>) {
  if (value == null) return;

  if (typeof value === "string") {
    addPermissionKey(out, value);
    inferModuleKeysFromText(value, out);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectPermissionKeys(item, out));
    return;
  }

  if (typeof value !== "object") return;

  const record = value as Record<string, unknown>;

  if (typeof record.key === "string") {
    addPermissionKey(out, record.key);
  }

  if (typeof record.slug === "string") {
    addPermissionKey(out, record.slug);
  }

  if (typeof record.name === "string") {
    addPermissionKey(out, record.name);
    inferModuleKeysFromText(record.name, out);
  }

  if (typeof record.name_ar === "string") {
    addPermissionKey(out, record.name_ar);
    inferModuleKeysFromText(record.name_ar, out);
  }

  if (typeof record.name_en === "string") {
    addPermissionKey(out, record.name_en);
    inferModuleKeysFromText(record.name_en, out);
  }

  if (typeof record.control_key === "string") {
    addPermissionKey(out, record.control_key);
  }

  if (typeof record.permission_key === "string") {
    addPermissionKey(out, record.permission_key);
  }

  if (Array.isArray(record.controls)) {
    collectPermissionKeys(record.controls, out);
  }

  if (Array.isArray(record.permissions)) {
    collectPermissionKeys(record.permissions, out);
  }

  if (record.permission_keys != null) {
    collectPermissionKeys(record.permission_keys, out);
  }

  if (record.permissionKeys != null) {
    collectPermissionKeys(record.permissionKeys, out);
  }
}

function isAdminRoleLabel(value: string): boolean {
  const text = value.trim().toLowerCase();
  return (
    text === "admin" ||
    text === "super admin" ||
    text === "super_admin" ||
    text === "super-admin" ||
    text === "superadmin" ||
    text === "administrator" ||
    text === "أدمن" ||
    text === "ادمن" ||
    text.includes("super admin") ||
    text.includes("admin") ||
    text.includes("أدمن") ||
    text.includes("ادمن") ||
    text.includes("مدير") ||
    text.includes("الادارة") ||
    text.includes("الإدارة")
  );
}

function roleGrantsFullAccess(role: unknown): boolean {
  if (role == null) return false;

  if (typeof role === "string") {
    return isAdminRoleLabel(role);
  }

  if (typeof role !== "object") return false;

  const record = role as Record<string, unknown>;
  if (record.is_super_admin === true || record.is_super_admin === 1) return true;

  const labels = [
    record.slug,
    record.key,
    record.name,
    record.name_en,
    record.name_ar,
    record.title,
  ];

  return labels.some(
    (label) => typeof label === "string" && isAdminRoleLabel(label),
  );
}

function collectRoleLabels(value: unknown, keys: Set<string>) {
  if (value == null) return;

  if (typeof value === "string") {
    addPermissionKey(keys, value);
    inferModuleKeysFromText(value, keys);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectRoleLabels(item, keys));
    return;
  }

  if (typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  for (const field of ["name", "name_ar", "name_en", "slug", "key", "title"]) {
    if (typeof record[field] === "string") {
      addPermissionKey(keys, record[field] as string);
      inferModuleKeysFromText(record[field] as string, keys);
    }
  }
}

function collectPermissionsFromRoles(value: unknown, keys: Set<string>) {
  if (value == null) return;

  collectRoleLabels(value, keys);

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item != null && typeof item === "object") {
        const record = item as Record<string, unknown>;
        collectPermissionKeys(record.permissions, keys);
        collectPermissionKeys(record.role_permissions, keys);
      }
    });
    return;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    collectPermissionKeys(record.permissions, keys);
    collectPermissionKeys(record.role_permissions, keys);
  }
}

function collectPermissionIdsFromRoles(value: unknown, out: Set<number>) {
  if (value == null) return;

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item != null && typeof item === "object") {
        const record = item as Record<string, unknown>;
        collectPermissionIds(record.permissions, out);
        collectPermissionIds(record.role_permissions, out);
      }
    });
    return;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    collectPermissionIds(record.permissions, out);
    collectPermissionIds(record.role_permissions, out);
  }
}

export function extractUserPermissionKeys(
  profileData: unknown,
): Set<string> {
  const keys = new Set<string>();
  const user = extractProfileUser(profileData);
  if (!user) return keys;

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    collectPermissionKeys(root.permissions, keys);
    collectPermissionKeys(root.permission_keys, keys);
    collectPermissionKeys(root.permissionKeys, keys);
    collectPermissionKeys(root.role_permissions, keys);
  }

  collectPermissionKeys(user.permissions, keys);
  collectPermissionKeys(user.permission_keys, keys);
  collectPermissionKeys(user.permissionKeys, keys);
  collectPermissionKeys(user.role_permissions, keys);
  collectPermissionKeys(user.abilities, keys);
  collectPermissionKeys(user.permission_names, keys);
  collectPermissionsFromRoles(user.role, keys);
  collectPermissionsFromRoles(user.roles, keys);
  collectRoleLabels(user.role, keys);
  collectRoleLabels(user.roles, keys);
  collectRoleLabels(user.roles_ids, keys);

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    collectPermissionsFromRoles(root.role, keys);
    collectPermissionsFromRoles(root.roles, keys);
    collectRoleLabels(root.role, keys);
    collectRoleLabels(root.roles, keys);
    collectRoleLabels(root.roles_ids, keys);
  }

  return keys;
}

function collectPermissionIds(value: unknown, out: Set<number>) {
  if (value == null) return;

  if (typeof value === "number" && Number.isFinite(value)) {
    out.add(value);
    return;
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    out.add(Number(value));
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectPermissionIds(item, out));
    return;
  }

  if (typeof value !== "object") return;

  const record = value as Record<string, unknown>;

  const looksLikePermission =
    typeof record.key === "string" ||
    typeof record.permission_key === "string" ||
    typeof record.control_key === "string" ||
    typeof record.name === "string" ||
    typeof record.name_ar === "string" ||
    typeof record.name_en === "string";

  if (record.id != null && looksLikePermission && !Array.isArray(record.controls)) {
    const id = Number(record.id);
    if (Number.isFinite(id)) out.add(id);
  }

  if (Array.isArray(record.controls)) {
    collectPermissionIds(record.controls, out);
  }

  if (Array.isArray(record.permissions)) {
    collectPermissionIds(record.permissions, out);
  }

  if (Array.isArray(record.role_permissions)) {
    collectPermissionIds(record.role_permissions, out);
  }
}

export function extractPermissionIds(profileData: unknown): Set<number> {
  const ids = new Set<number>();
  const user = extractProfileUser(profileData);
  if (!user) return ids;

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    collectPermissionIds(root.permissions, ids);
    collectPermissionIds(root.role_permissions, ids);
  }

  collectPermissionIds(user.permissions, ids);
  collectPermissionIds(user.role_permissions, ids);
  collectPermissionIdsFromRoles(user.role, ids);
  collectPermissionIdsFromRoles(user.roles, ids);

  if (Array.isArray(user.roles_ids)) {
    user.roles_ids.forEach((item) => collectPermissionIdsFromRoles(item, ids));
  }

  return ids;
}

export function resolvePermissionKeysFromCatalog(
  ids: Set<number>,
  catalog: Array<{
    name: string;
    controls: Array<{ id: number; key: string; name?: string }>;
  }>,
): Set<string> {
  const keys = new Set<string>();
  if (!ids.size || !catalog.length) return keys;

  for (const group of catalog) {
    for (const control of group.controls ?? []) {
      if (!ids.has(Number(control.id))) continue;
      addPermissionKey(keys, control.key);
      if (control.name) {
        addPermissionKey(keys, control.name);
        inferModuleKeysFromText(control.name, keys);
      }
      addPermissionKey(keys, group.name);
      inferModuleKeysFromText(group.name, keys);
    }
  }

  return keys;
}

export function isRestrictedUser(profileData: unknown): boolean {
  if (!profileData || isFullAccessUser(profileData)) return false;

  const user = extractProfileUser(profileData);
  if (!user) return false;

  if (user.role != null) return true;
  if (user.roles != null) return true;
  if (user.roles_ids != null) return true;

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    if (root.role != null || root.roles != null || root.roles_ids != null) {
      return true;
    }
  }

  return profileHasPermissionsField(profileData);
}

function addRoleId(value: unknown, ids: Set<number>) {
  if (value == null) return;

  if (typeof value === "number" || typeof value === "string") {
    const id = Number(value);
    if (Number.isFinite(id) && id > 0) ids.add(id);
    return;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.id != null) {
      const id = Number(record.id);
      if (Number.isFinite(id) && id > 0) ids.add(id);
    }
  }
}

function collectRoleIdsFromValue(value: unknown, ids: Set<number>) {
  if (value == null) return;

  if (Array.isArray(value)) {
    value.forEach((item) => addRoleId(item, ids));
    return;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.id != null) {
      addRoleId(record, ids);
      return;
    }
    Object.values(record).forEach((item) => addRoleId(item, ids));
    return;
  }

  addRoleId(value, ids);
}

export function extractRoleIds(profileData: unknown): number[] {
  const user = extractProfileUser(profileData);
  if (!user) return [];

  const ids = new Set<number>();

  collectRoleIdsFromValue(user.roles_ids, ids);
  collectRoleIdsFromValue(user.role_id, ids);
  collectRoleIdsFromValue(user.role, ids);
  collectRoleIdsFromValue(user.roles, ids);

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    collectRoleIdsFromValue(root.roles_ids, ids);
    collectRoleIdsFromValue(root.role_id, ids);
    collectRoleIdsFromValue(root.role, ids);
    collectRoleIdsFromValue(root.roles, ids);

    const nested = root.user;
    if (nested != null && typeof nested === "object") {
      const nestedUser = nested as Record<string, unknown>;
      collectRoleIdsFromValue(nestedUser.roles_ids, ids);
      collectRoleIdsFromValue(nestedUser.role_id, ids);
      collectRoleIdsFromValue(nestedUser.role, ids);
      collectRoleIdsFromValue(nestedUser.roles, ids);
    }
  }

  return [...ids];
}

export function isFullAccessUser(profileData: unknown): boolean {
  const user = extractProfileUser(profileData);
  if (!user) return false;

  if (user.is_super_admin === true || user.is_super_admin === 1) return true;
  if (user.is_admin === true || user.is_admin === 1) return true;
  if (user.all_permissions === true || user.has_all_permissions === true) {
    return true;
  }

  const roleSources = [user.role, user.roles, user.roles_ids];

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    roleSources.push(root.role, root.roles, root.roles_ids);

    if (root.user != null && typeof root.user === "object") {
      const nested = root.user as Record<string, unknown>;
      roleSources.push(nested.role, nested.roles, nested.roles_ids);
    }
  }

  for (const source of roleSources) {
    if (source == null) continue;

    if (Array.isArray(source)) {
      if (source.some((role) => roleGrantsFullAccess(role))) return true;
      continue;
    }

    if (roleGrantsFullAccess(source)) return true;

    if (typeof source === "object") {
      const record = source as Record<string, unknown>;
      if (record.id == null) {
        const nestedRoles = Object.values(record);
        if (nestedRoles.some((role) => roleGrantsFullAccess(role))) return true;
      }
    }
  }

  return false;
}

export function buildPermissionContext(
  profileData: unknown,
  catalog?: Array<{ name: string; controls: Array<{ id: number; key: string }> }>,
  options?: { ready?: boolean },
) {
  const ready = Boolean(options?.ready);
  const user = extractProfileUser(profileData) as ProfileUser | null;
  let keys = extractUserPermissionKeys(profileData);

  if (catalog?.length) {
    const ids = extractPermissionIds(profileData);
    const resolved = resolvePermissionKeysFromCatalog(ids, catalog);
    if (resolved.size > 0) {
      for (const key of resolved) keys.add(key);
    }
  }

  const fullAccess =
    isFullAccessUser(profileData) || keysGrantFullAccess(keys);
  const restricted = !fullAccess && isRestrictedUser(profileData);

  const shouldEnforce = ready && restricted && !fullAccess;

  const canAccessPathForUser = (path: string) => {
    if (!ready || fullAccess) return true;

    const normalized = path.replace(/\/+$/, "") || "/";
    if (ALWAYS_ALLOWED_PATHS.has(normalized)) return true;

    if (!restricted) return true;

    if (keys.size === 0) return false;

    return canAccessPath(path, keys, { enforce: true });
  };

  const hasModuleAccessForUser = (module: string) => {
    if (!ready || fullAccess) return true;
    if (!restricted) return true;
    if (keys.size === 0) return false;
    return hasModuleAccess(keys, module);
  };

  return {
    user,
    keys,
    enforce: shouldEnforce,
    fullAccess,
    restricted,
    canAccessPath: canAccessPathForUser,
    canAccessHref: (href: string, lang: string) => {
      const prefix = `/${lang}`;
      let normalizedHref = href;
      if (normalizedHref === prefix) normalizedHref = "/";
      else if (normalizedHref.startsWith(`${prefix}/`)) {
        normalizedHref = normalizedHref.slice(prefix.length) || "/";
      }
      return canAccessPathForUser(normalizedHref);
    },
    hasModuleAccess: hasModuleAccessForUser,
  };
}

export function profileHasPermissionsField(profileData: unknown): boolean {
  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    if (
      "permissions" in root ||
      "permission_keys" in root ||
      "permissionKeys" in root
    ) {
      return true;
    }
  }

  const user = extractProfileUser(profileData);
  if (!user) return false;

  return (
    "permissions" in user ||
    "permission_keys" in user ||
    "permissionKeys" in user
  );
}

export function normalizeModulePrefix(module: string): string[] {
  const base = module.trim().toLowerCase();
  const variants = new Set<string>([
    base,
    base.replace(/-/g, "_"),
    base.replace(/_/g, "-"),
  ]);
  return [...variants];
}

const MODULE_KEY_ALIASES: Record<string, string[]> = {
  doctors: ["doctors", "doctor"],
  cohorts: ["cohorts", "cohort"],
  academic_years: ["academic_years", "academic-years"],
  students: ["students", "student"],
  exam_article_reviews: [
    "exam_article_reviews",
    "exam-article-reviews",
    "exam_article_review",
  ],
  admins: ["admins", "admin_users", "admin"],
  roles: ["roles", "role"],
  study_terms: ["study_terms", "study-terms"],
  subjects: ["subjects", "subject"],
  lessons: ["lessons", "lesson"],
  scientific_track_categories: [
    "scientific_track_categories",
    "scientific-track-categories",
    "scientific_track_category",
    "scientific-track",
    "scientific_tracks",
    "scientific-tracks",
  ],
  scientific_track_subjects: [
    "scientific_track_subjects",
    "scientific-track-subjects",
    "scientific_track_subject",
    "scientific-track",
    "scientific_tracks",
    "scientific-tracks",
  ],
  scientific_tracks: [
    "scientific_tracks",
    "scientific-tracks",
    "scientific_track",
    "scientific-track",
    "scientific_track_categories",
    "scientific-track-categories",
    "scientific_track_subjects",
    "scientific-track-subjects",
    "independent_tracks",
  ],
  book_categories: [
    "book_categories",
    "book-categories",
    "bookcategories",
    "scientific_library",
    "scientific-library",
  ],
  books: [
    "books",
    "book",
    "scientific_library",
    "scientific-library",
    "library",
  ],
  scientific_library: [
    "scientific_library",
    "scientific-library",
    "book_categories",
    "book-categories",
    "books",
    "book",
  ],
  privacy_policy: ["privacy_policy", "privacy-policy", "privacy", "settings"],
  terms_and_conditions: [
    "terms_and_conditions",
    "terms-conditions",
    "terms",
    "settings",
  ],
  app_contacts: ["app_contacts", "app-contacts", "contacts", "settings"],
  contact_us: ["contact_us", "contact-us", "contacts", "settings"],
  delete_account: ["delete_account", "delete-account", "settings"],
  settings: ["settings"],
  home_page: [
    "home_page",
    "home-page",
    "home_features",
    "home-features",
    "home_goals",
    "home-goals",
    "home_methodologies",
    "home-methodologies",
    "home_study_levels",
    "home-study-levels",
    "settings",
  ],
};

export function permissionMatchesModule(
  permissionKey: string,
  module: string,
): boolean {
  const key = permissionKey.trim().toLowerCase().replace(/_/g, ".");
  if (!key) return false;

  const moduleVariants = [
    ...(MODULE_KEY_ALIASES[module] ?? [module]),
    ...(MODULE_LABEL_HINTS[module] ?? []),
  ];

  for (const moduleName of moduleVariants) {
    for (const prefix of normalizeModulePrefix(moduleName)) {
      const normalizedPrefix = prefix.replace(/_/g, ".").toLowerCase();
      if (!normalizedPrefix) continue;
      if (
        key === normalizedPrefix ||
        key.startsWith(`${normalizedPrefix}.`) ||
        key.includes(normalizedPrefix)
      ) {
        return true;
      }
    }
  }

  return false;
}

const MODULE_FAMILIES: Record<string, string[]> = {
  books: ["books", "scientific_library"],
  book_categories: ["book_categories", "scientific_library"],
  scientific_library: ["scientific_library", "books", "book_categories"],
  scientific_track_categories: [
    "scientific_track_categories",
    "scientific_tracks",
  ],
  scientific_track_subjects: [
    "scientific_track_subjects",
    "scientific_tracks",
  ],
  scientific_tracks: [
    "scientific_tracks",
    "scientific_track_categories",
    "scientific_track_subjects",
  ],
  home_page: ["home_page", "settings"],
};

export function hasModuleAccess(
  keys: Set<string>,
  module: string,
): boolean {
  if (!module) return false;
  const targets = MODULE_FAMILIES[module] ?? [module];
  for (const target of targets) {
    for (const key of keys) {
      if (permissionMatchesModule(key, target)) return true;
    }
  }
  return false;
}

function keysGrantFullAccess(keys: Set<string>): boolean {
  if (keys.size === 0) return false;

  const modules = [
    "doctors",
    "cohorts",
    "academic_years",
    "students",
    "admins",
    "roles",
    "study_terms",
    "subjects",
    "lessons",
    "scientific_track_categories",
    "scientific_track_subjects",
    "book_categories",
    "books",
  ];

  const matched = modules.filter((module) => hasModuleAccess(keys, module));
  return matched.length >= modules.length - 2;
}

export function hasAnyModuleAccess(
  keys: Set<string>,
  modules: string[],
): boolean {
  return modules.some((module) => hasModuleAccess(keys, module));
}

export function canAccessPath(
  path: string,
  keys: Set<string>,
  options?: {
    enforce?: boolean;
  },
): boolean {
  const normalized = path.replace(/\/+$/, "") || "/";

  if (ALWAYS_ALLOWED_PATHS.has(normalized)) {
    return true;
  }

  if (!options?.enforce) {
    return true;
  }

  const segments = normalized.split("/").filter(Boolean);
  const first = segments[0] ?? "";
  const second = segments[1] ?? "";

  const routeAliases = MODULE_ROUTE_ALIASES[first];
  if (routeAliases) {
    return hasAnyModuleAccess(keys, routeAliases);
  }

  if (first === "academic-study") {
    if (second === "study-terms") return hasModuleAccess(keys, "study_terms");
    if (second === "subjects") return hasModuleAccess(keys, "subjects");
    if (second === "lessons") return hasModuleAccess(keys, "lessons");
    if (second === "reorder") {
      return hasAnyModuleAccess(keys, ["study_terms", "subjects", "lessons"]);
    }
    return hasAnyModuleAccess(keys, ["study_terms", "subjects", "lessons"]);
  }

  if (first === "singleLearnPath") {
    if (second === "categories") {
      return hasModuleAccess(keys, "scientific_track_categories");
    }
    if (second === "subjects") {
      return hasModuleAccess(keys, "scientific_track_subjects");
    }
    if (second === "lessons" || second === "reorder") {
      return hasAnyModuleAccess(keys, [
        "scientific_track_categories",
        "scientific_track_subjects",
        "lessons",
      ]);
    }
    return hasAnyModuleAccess(keys, [
      "scientific_track_categories",
      "scientific_track_subjects",
      "lessons",
    ]);
  }

  if (first === "settings") {
    if (second === "home-page") return hasModuleAccess(keys, "home_page");
    return hasAnyModuleAccess(keys, ["settings", "home_page"]);
  }

  if (first === "scientific-library") {
    if (second === "categories" || second === "reorder") {
      return hasAnyModuleAccess(keys, ["book_categories", "books"]);
    }
    if (second === "books") return hasModuleAccess(keys, "books");
    return hasAnyModuleAccess(keys, ["book_categories", "books"]);
  }

  const underscored = first.replace(/-/g, "_");
  if ((CONTENT_MODULES as readonly string[]).includes(underscored)) {
    return hasModuleAccess(keys, underscored);
  }

  return false;
}

export function canAccessHref(
  href: string,
  lang: string,
  keys: Set<string>,
  enforce: boolean,
): boolean {
  const prefix = `/${lang}`;
  let path = href;

  if (path === prefix) path = "/";
  else if (path.startsWith(`${prefix}/`)) {
    path = path.slice(prefix.length) || "/";
  }

  return canAccessPath(path, keys, { enforce });
}

export function getPermissionContext(
  profileData: unknown,
  catalog?: Array<{ name: string; controls: Array<{ id: number; key: string }> }>,
) {
  return buildPermissionContext(profileData, catalog);
}
