/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useSessionReady } from "@/hooks/useSessionReady";

import { useGetPermissionsQuery } from "@/store/permissions/permissionsApi";
import { useCreateRoleMutation } from "@/store/roles/rolesApi";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Shield,
  CheckSquare,
  FolderCheck,
  CircleCheckBig,
  Search,
} from "lucide-react";

import { toast } from "sonner";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import RoleFormSkeleton from "@/components/skeleton/RoleFormSkeleton";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

export default function CreateRole() {
  const router = useRouter();
  const sessionReady = useSessionReady();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const t = translate?.pages.roles?.createRole;

  const {
    data: permissions,
    isLoading,
  } = useGetPermissionsQuery(lang as any, {
    skip: !sessionReady,
  });

  const [createRole, { isLoading: isCreating }] =
    useCreateRoleMutation();

  const [name_en, setNameEn] = useState("");
  const [name_ar, setNameAr] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const toggleControl = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );
  };

  const selectGroup = (controls: any[]) => {
    const ids = controls.map((c) => c.id);
    setSelected((prev) =>
      ids.every((pid) => prev.includes(pid))
        ? prev.filter((pid) => !ids.includes(pid))
        : [...prev, ...ids.filter((pid) => !prev.includes(pid))],
    );
  };

  const selectAllPermissions = () => {
    if (!permissions) return;
    const allIds = permissions.flatMap((g) =>
      g.controls.map((c: any) => c.id),
    );

    setSelected((prev) =>
      allIds.every((pid) => prev.includes(pid)) ? [] : allIds,
    );
  };

  const filteredPermissions = useMemo(() => {
    if (!permissions) return [];
    if (!search.trim()) return permissions;

    return permissions
      .map((group) => ({
        ...group,
        controls: group.controls.filter((c: any) =>
          c.name.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter((g) => g.controls.length > 0);
  }, [permissions, search]);

  const handleCreateRole = async () => {
    try {
      const res = await createRole({
        name_en,
        name_ar,
        permissions: selected,
      }).unwrap();

      toast.success(res?.message, {
        duration: 1000,
        onAutoClose: () => {
          router.push(`/${lang}/roles`);
        },
      });
    } catch (err: any) {
      const errorData = err?.data ?? err;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
      }
    }
  };

  const searchIconSide = lang === "ar" ? "left-3" : "right-3";
  const searchInputPad =
    lang === "ar" ? "ps-10" : "pe-10";

  if (!sessionReady || isLoading) {
    return <RoleFormSkeleton />;
  }

  return (
    <div className={dash.formPageWide} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <Shield className="w-6 h-6" />
            </span>
            <div className="space-y-2 min-w-0">
              <span className="leading-tight block">{t?.title}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {t?.titleDescription}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <div className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral}>
              <CardTitle className="text-base font-semibold text-slate-900 mb-6">
                {t?.roleInfo}
              </CardTitle>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-800">
                    {t?.nameAr}
                  </Label>
                  <Input
                    value={name_ar}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder={t?.nameArPlaceholder}
                    className={cn("h-11", dash.input)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-800">
                    {t?.nameEn}
                  </Label>
                  <Input
                    value={name_en}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder={t?.nameEnPlaceholder}
                    className={cn("h-11", dash.input)}
                  />
                </div>
              </div>
            </section>

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t?.permissions}
                </h2>
                <Badge className="rounded-full bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70 px-3 py-1 font-semibold">
                  <span className="mx-1">{selected.length}</span>
                  {t?.isSelected}
                </Badge>
              </div>

              <Button
                size="sm"
                type="button"
                onClick={selectAllPermissions}
                disabled={isLoading}
                className="gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm"
              >
                <CheckSquare className="h-4 w-4" />
                {t?.selectAll}
              </Button>
            </div>

            <div className={cn("relative max-w-sm", lang === "ar" && "ms-auto")}>
              <Search
                className={`pointer-events-none absolute ${searchIconSide} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`}
              />
              <Input
                className={cn("h-11", searchInputPad, dash.input)}
                placeholder={t?.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[60vh] pe-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-4">
                {filteredPermissions?.map((group: any) => (
                  <Card
                    key={group.name}
                    className="rounded-2xl border-slate-200/90 shadow-sm ring-1 ring-slate-900/4"
                  >
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-50/80 px-2 py-1 ring-1 ring-emerald-100">
                        <FolderCheck className="h-4 w-4 text-emerald-800" />
                        <CardTitle className="text-sm capitalize font-semibold">
                          {group.name}
                        </CardTitle>
                      </div>

                      <Button
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={() => selectGroup(group.controls)}
                        className="gap-2 shrink-0 rounded-xl text-emerald-800 hover:bg-emerald-50"
                      >
                        {t?.selectAll}
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                    </CardHeader>

                    <CardContent className="space-y-2 pt-0">
                      {group.controls.map((control: any) => {
                        const active = selected.includes(control.id);
                        return (
                          <label
                            key={control.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition",
                              lang === "ar"
                                ? "justify-end"
                                : "flex-row-reverse justify-end",
                              active
                                ? "border-emerald-500 bg-emerald-50/90 ring-1 ring-emerald-200/50"
                                : "border-slate-200 hover:bg-slate-50/80",
                            )}
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

            <div className={dash.formFooterBar}>
              <Button
                type="button"
                size="lg"
                className={cn(dash.formSubmit, "gap-2")}
                onClick={handleCreateRole}
                disabled={isCreating}
              >
                <CircleCheckBig className="h-5 w-5 shrink-0" />
                {isCreating
                  ? `${t?.processing}...`
                  : `${t?.createBtn}`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
