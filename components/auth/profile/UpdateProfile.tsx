/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/store/auth/authApi";
import PhoneInput from "react-phone-input-2";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Mail, Upload, X, UserCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import "react-phone-input-2/lib/style.css";
import "./style.css";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { useRouter } from "next/navigation";
import ProfileSkeleton from "@/components/skeleton/ProfileSkeleton";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

function UpdateProfile() {
  const lang = LangUseParams();
  const translate = TranslateHook();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translate?.pages.updateProfile;
  const pageDir = lang === "ar" ? "rtl" : "ltr";
  const labelAlign = lang === "ar" ? "text-end" : "text-start";
  const inputIconPad = "ps-10";

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch,
  } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateProfileMutation();
  const user = profileData?.data || profileData?.user || profileData;

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    avatar: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        mobile: user.mobile ?? "",
        avatar: user.avatar ?? "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, mobile: `+${value}` }));
  };

  const phoneDigits = form.mobile ? form.mobile.replace(/\D/g, "") : "";

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        avatar: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);

    const toastId = toast.loading(
      lang === "ar" ? "جاري رفع الصورة..." : "Uploading image...",
    );
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await updateProfile(formData as any).unwrap();

      toast.success(res?.message || (lang === "ar" ? "تم الرفع" : "Uploaded"), {
        id: toastId,
      });

      await refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          (lang === "ar" ? "فشل الرفع" : "Upload failed"),
        { id: toastId },
      );

      setForm((prev) => ({
        ...prev,
        avatar: user?.avatar || "",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, avatar: "" }));

    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUpdating || isUploading) return;

    if (!form.name.trim()) {
      toast.error(t?.nameRequired ?? "");
      return;
    }

    const toastId = toast.loading(
      lang === "ar" ? "جاري الحفظ..." : "Saving...",
    );

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("mobile", form.mobile);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const res = await updateProfile(formData as any).unwrap();

      toast.success(res?.message || "", { id: toastId });

      await refetch();
      router.push(`/${lang}/profile`);
    } catch (err: any) {
      const errorData = err?.data ?? err;

      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg, { id: toastId })),
        );
        return;
      }

      if (errorData?.message) {
        toast.error(errorData.message, { id: toastId });
        return;
      }

      toast.error(lang === "ar" ? "فشل التحديث" : "Update failed", {
        id: toastId,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoadingProfile) return <ProfileSkeleton />;
  if (!user) return null;

  return (
    <div className={dash.formPage} dir={pageDir}>
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <UserCircle className="w-6 h-6" />
            </span>
            <div className="space-y-2 min-w-0">
              <span className="leading-tight block">{t?.title}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {t?.titleUpdate}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className={dash.formCardContent}>
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />

            <div className="flex justify-center pb-2">
              <div className="relative">
                {(form.avatar || selectedFile) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute inset-e-0 top-0 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow transition hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <Avatar
                  className="h-28 w-28 cursor-pointer border-4 border-emerald-100 shadow-md ring-2 ring-white"
                  onClick={!isUploading ? handleImageClick : undefined}
                >
                  <AvatarImage src={form.avatar || user?.avatar || ""} />
                  <AvatarFallback className="bg-emerald-50 text-lg font-semibold text-emerald-800">
                    {getInitials(form.name || "User")}
                  </AvatarFallback>
                </Avatar>

                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 inset-e-0 h-9 w-9 rounded-full shadow-md ring-2 ring-white"
                  onClick={handleImageClick}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <User className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {t?.titleUpdate}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="update-profile-name"
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.name}
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="update-profile-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={cn("h-11", inputIconPad, dash.input)}
                      required
                      placeholder={t?.namePlaceholder}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="update-profile-email"
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.email}
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="update-profile-email"
                      name="email"
                      value={form.email}
                      disabled
                      className={cn(
                        "h-11",
                        inputIconPad,
                        dash.input,
                        "bg-slate-50",
                      )}
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t?.emailNote}
                  </p>
                </div>

                <div className="space-y-2" dir="ltr">
                  <Label
                    htmlFor="phone"
                    className={cn(
                      "text-sm font-semibold text-slate-800",
                      labelAlign,
                    )}
                  >
                    {t?.phone ?? translate?.pages.profile.phone}
                  </Label>
                  <PhoneInput
                    country="eg"
                    value={phoneDigits}
                    onChange={handlePhoneChange}
                    inputClass="!w-full !h-11 !ps-12 !rounded-xl !border-slate-200 !bg-white/95 !shadow-sm"
                    containerClass="!w-full"
                    inputProps={{
                      id: "phone",
                      name: "mobile",
                    }}
                  />
                </div>
              </div>
            </section>

            <div className={dash.formFooterBar}>
              <Button
                type="submit"
                disabled={isUpdating || isUploading}
                className={cn(dash.formSubmit, "gap-2")}
              >
                {isUpdating || isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                    {t?.processing} ...
                  </>
                ) : (
                  t?.confirmBtn
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default UpdateProfile;
