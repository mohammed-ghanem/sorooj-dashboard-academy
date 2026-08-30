"use client";

import { useMemo } from "react";
import { useGetProfileQuery } from "@/store/auth/authApi";
import { useGetPermissionsQuery } from "@/store/permissions/permissionsApi";
import { useGetRoleByIdQuery } from "@/store/roles/rolesApi";
import LangUseParams from "@/translate/LangUseParams";
import {
  buildPermissionContext,
  extractPermissionIds,
  extractRoleIds,
  extractUserPermissionKeys,
  isRestrictedUser,
} from "@/lib/permissions";

function hasUsablePermissions(value: unknown): boolean {
  if (value == null) return false;
  if (!Array.isArray(value)) return true;
  return value.length > 0;
}

function pickRolePermissions(role: Record<string, unknown>) {
  return role.role_permissions ?? role.permissions;
}

function mergeProfileWithRole(profile: unknown, roleData: unknown) {
  if (!profile || !roleData) return profile;

  const base =
    profile != null && typeof profile === "object"
      ? { ...(profile as Record<string, unknown>) }
      : {};

  const role =
    roleData != null && typeof roleData === "object"
      ? (roleData as Record<string, unknown>)
      : null;

  if (!role) return profile;

  const rolePerms = pickRolePermissions(role);
  const profilePerms = base.role_permissions ?? base.permissions;
  const effectivePerms = hasUsablePermissions(profilePerms)
    ? profilePerms
    : rolePerms;

  return {
    ...base,
    permissions: effectivePerms,
    role_permissions: hasUsablePermissions(base.role_permissions)
      ? base.role_permissions
      : rolePerms ?? effectivePerms,
    role: {
      ...role,
      permissions: rolePerms,
      role_permissions: role.role_permissions ?? rolePerms,
    },
  };
}

export function useUserPermissions() {
  const lang = LangUseParams() ?? "ar";
  const {
    data: profile,
    isLoading: profileLoading,
  } = useGetProfileQuery();

  const restricted = useMemo(
    () => Boolean(profile && isRestrictedUser(profile)),
    [profile],
  );

  const roleIds = useMemo(() => extractRoleIds(profile), [profile]);
  const primaryRoleId = roleIds[0];

  const { data: roleData } = useGetRoleByIdQuery(
    { id: primaryRoleId, lang },
    { skip: !restricted || !primaryRoleId },
  );

  const mergedProfile = useMemo(
    () => mergeProfileWithRole(profile, roleData),
    [profile, roleData],
  );

  const needsCatalog = useMemo(() => {
    if (!restricted || !mergedProfile) return false;
    if (extractUserPermissionKeys(mergedProfile).size > 0) return false;
    return extractPermissionIds(mergedProfile).size > 0;
  }, [restricted, mergedProfile]);

  const { data: catalog, isLoading: catalogLoading } = useGetPermissionsQuery(
    undefined,
    { skip: !profile || !needsCatalog },
  );

  const isReady = useMemo(() => {
    if (profileLoading) return false;
    if (!profile) return false;
    if (needsCatalog && catalogLoading) return false;
    return true;
  }, [profile, profileLoading, needsCatalog, catalogLoading]);

  const context = useMemo(
    () => buildPermissionContext(mergedProfile, catalog, { ready: isReady }),
    [mergedProfile, catalog, isReady],
  );

  return {
    ...context,
    isLoading: !isReady,
    isReady,
  };
}
