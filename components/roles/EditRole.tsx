

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

// Hooks
import { useSessionReady } from "@/hooks/useSessionReady";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";

// RTK
import { useGetPermissionsQuery } from "@/store/permissions/permissionsApi";
import {
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
} from "@/store/roles/rolesApi";

// UI
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  Shield,
  CheckSquare,
  FolderCheck,
  Search,
  CircleCheckBig,
} from "lucide-react";

// Toast
import { toast } from "sonner";
import RoleFormSkeleton from "./RoleFormSkeleton";

export default function EditRole() {
  const router = useRouter();
  const params = useParams();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook(); 

  const roleId =
    typeof params.id === "string" ? Number(params.id) : undefined;

  /* ===================== API ===================== */
  const {
    data: permissions,
    isLoading: permLoading,
  } = useGetPermissionsQuery(lang as any, {
    skip: !sessionReady,
  });
  //===================== ROLE DATA ===================== //
  const {data: roleData,isLoading: roleLoading,} = useGetRoleByIdQuery(
    { id: roleId as number, lang: lang as string }, {
    skip: !sessionReady || !roleId,
  });

  const [updateRole, { isLoading: isUpdating }] =
    useUpdateRoleMutation();

  /* ===================== STATE ===================== */
  const [name_en, setNameEn] = useState("");
  const [name_ar, setNameAr] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  /* ===================== FILL DATA ===================== */
  useEffect(() => {
    if (!roleData) return;

    setNameEn(roleData.name_en || "");
    setNameAr(roleData.name_ar || "");

    if (roleData.permissions) {
      const ids = roleData.permissions.flatMap((g: any) =>
        g.controls.map((c: any) => c.id)
      );
      setSelected(ids);
    }
  }, [roleData]);

  /* ===================== HELPERS ===================== */
  const toggleControl = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectGroup = (controls: any[]) => {
    const ids = controls.map((c) => c.id);
    setSelected((prev) =>
      ids.every((id) => prev.includes(id))
        ? prev.filter((id) => !ids.includes(id))
        : [...prev, ...ids.filter((id) => !prev.includes(id))]
    );
  };

  const selectAllPermissions = () => {
    if (!permissions) return;
    const allIds = permissions.flatMap((g) =>
      g.controls.map((c: any) => c.id)
    );
    setSelected((prev) =>
      allIds.every((id) => prev.includes(id)) ? [] : allIds
    );
  };

  /* ===================== SEARCH ===================== */
  const filteredPermissions = useMemo(() => {
    if (!permissions) return [];
    if (!search.trim()) return permissions;

    return permissions
      .map((group: any) => ({
        ...group,
        controls: group.controls.filter((c: any) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((g: any) => g.controls.length > 0);
  }, [permissions, search]);

  /* ===================== SUBMIT ===================== */
  const handleUpdate = async () => {
    if (!roleId) return;

    try {
      const res = await updateRole({
        id: roleId,
        body: {
          name_en,
          name_ar,
          permissions: selected,
        },
      }).unwrap();

      toast.success(res?.message, {
        duration: 1000,
        onAutoClose: () => {
          router.push(`/${lang}/roles`);
        },
      });

    } catch (err: any) {
      toast.error(err?.message);
    }
  };

  if (!sessionReady) return null;

  /* ===================== SKELETON ===================== */
  if (roleLoading || permLoading) {
    return <RoleFormSkeleton />;
  }



  /* ===================== UI ===================== */
  return (
    <div className="p-6 mx-4 my-10 bg-white rounded-2xl border space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl icon_bg">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">
            {translate?.pages.roles.editRole.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {translate?.pages.roles.editRole.titleUpdate}
          </p>
        </div>
      </div>

      <Separator />

      {/* Role Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base icon_bg w-fit">
            {translate?.pages.roles.editRole.roleInfo}
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              {translate?.pages.roles.editRole.nameAr}
            </Label>
            <Input
              value={name_ar}
              onChange={(e) => setNameAr(e.target.value)}
              className="focus-visible:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label>
              {translate?.pages.roles.editRole.nameEn}
            </Label>
            <Input
              value={name_en}
              onChange={(e) => setNameEn(e.target.value)}
              className="focus-visible:ring-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Permissions Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {translate?.pages.roles.editRole.permissions}
          </h2>
          <Badge className="icon_bg text-black">
            <span className="mx-1.5">
              {selected.length}
            </span>
            {translate?.pages.roles.editRole.isSelected}
          </Badge>
        </div>

        <Button
          size="sm"
          onClick={selectAllPermissions}
          className="gap-2 greenBgIcon"
        >
          <CheckSquare className="h-4 w-4" />
          {translate?.pages.roles.editRole.selectAll}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          className={`absolute top-3 h-4 w-4 text-muted-foreground ${lang === "ar" ? "left-3" : "right-3"
            }`}
        />
        <Input
          className="pl-9 focus-visible:ring-0"
          placeholder={
            translate?.pages.roles.editRole.searchPlaceholder
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Permissions */}
      <ScrollArea className="h-[60vh] pr-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPermissions.map((group: any) => (
            <Card key={group.name}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2 icon_bg p-1 rounded-md">
                  <FolderCheck className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm capitalize">
                    {group.name}
                  </CardTitle>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => selectGroup(group.controls)}
                  className="gap-2 greenBgIcon"
                >
                  {translate?.pages.roles.editRole.selectAll}
                  <CheckSquare className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-2">
                {group.controls.map((control: any) => {
                  const active = selected.includes(control.id);
                  return (
                    <label
                      key={control.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition
                        ${lang === "ar" ? "justify-end" : " flex-row-reverse justify-end"}
                        ${active
                          ? "border-green-500 bg-green-50"
                          : "hover:bg-muted"
                        }`}
                    >
                      <span className="text-sm font-medium">
                        {control.name}
                      </span>
                      <Checkbox
                        checked={active}
                        onCheckedChange={() =>
                          toggleControl(control.id)
                        }
                      />
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          size="lg"
          className="gap-2 submitButton"
          onClick={handleUpdate}
          disabled={isUpdating}
        >
          <CircleCheckBig className="h-5 w-5" />
          {isUpdating
            ?
            `${translate?.pages.roles.editRole.processing}...`
            :
            `${translate?.pages.roles.editRole.editBtn}`
          }
        </Button>
      </div>
    </div>
  );
}