/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/store/auth/authApi";
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
import { Loader2, User, Mail, Camera, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import "react-phone-input-2/lib/style.css";
import "./style.css";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { useRouter } from "next/navigation";
import ProfileSkeleton from "@/components/auth/profile/ProfileSkeleton";

function UpdateProfile() {
  const lang = LangUseParams();
  const translate = TranslateHook();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch
  } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const user = profileData?.data || profileData?.user || profileData;
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    image: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        mobile: user.mobile ?? "",
        image: user.avatar ?? "",
      });
      
      if (user.avatar) {
        setImagePreview(user.avatar);
      }
      
      setInitialLoading(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, mobile: `+${value}` }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(translate?.pages.updateProfile.imageTooLarge || "Image size should be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(translate?.pages.updateProfile.invalidImageType || "Please select a valid image file");
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    const defaultImage = "";
    setForm(prev => ({ ...prev, image: defaultImage }));
    setImagePreview(defaultImage);
    setSelectedFile(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUpdating || isUploading) return;

    if (!form.name.trim()) {
      toast.error(translate?.pages.updateProfile.nameRequired);
      return;
    }

    try {
      setIsUploading(true);

      // إنشاء FormData لإرسال الملف مع البيانات
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('mobile', form.mobile);
      
      // إذا تم اختيار صورة جديدة، أضفها إلى FormData
      if (selectedFile) {
        formData.append('avatar', selectedFile); // المفتاح 'image' حسب ما يتوقعه الباك إند
      }

      console.log("Submitting form with image:", selectedFile ? selectedFile.name : "No new image");

      // استخدم mutation مع FormData
      const res = await updateProfile(formData as any).unwrap();
      
      console.log("Update response:", res);
      toast.success(res?.message || "Profile updated successfully");

      await refetch();
      router.push(`/${lang}/profile`);

    } catch (err: any) {
      console.error("Update error:", err);
      const errorData = err?.data ?? err;

      if (errorData?.errors) { 
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg))
        );
        return;
      }

      if (errorData?.message) {
        toast.error(errorData.message);
        return;
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoadingProfile) return <ProfileSkeleton />;
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto p-6" dir="ltr">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="flex justify-center mb-2">
            <div className="relative group">
              <Avatar 
                className="w-24 h-24 border-4 border-blue-100 cursor-pointer"
                onClick={handleImageClick}
              >
                <AvatarImage src={imagePreview || form.image} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {getInitials(form.name || "User")}
                </AvatarFallback>
              </Avatar>
              
              {/* Overlay with camera icon */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleImageClick}
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </div>
              
              {/* Upload button */}
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                onClick={handleImageClick}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4" />
              </Button>

              {/* Remove image button */}
              {form.image && form.image !== "https://backend.wecandevmode.online/assets/avatar.png" && !selectedFile && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-0 right-0 rounded-full w-6 h-6"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          
          <CardTitle className="text-xl font-bold">
            {translate?.pages.updateProfile.title}
          </CardTitle>
          <CardDescription>
            {translate?.pages.updateProfile.titleUpdate}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className={`block ${lang === "ar" ? "text-right!" : "text-left"}`}>
                {translate?.pages.updateProfile.name}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="pl-10 focus-visible:ring-0! border-gray-300!"
                  required
                  placeholder={translate?.pages.updateProfile.namePlaceholder}
                />
              </div>
            </div>

            {/* Email (Disabled) */}
            <div className="space-y-2">
              <Label htmlFor="email" className={`block ${lang === "ar" ? "text-right!" : "text-left"}`}>
                {translate?.pages.updateProfile.email}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="pl-10 bg-gray-50"
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500">
                {translate?.pages.updateProfile.emailNote}
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className={`block ${lang === "ar" ? "text-right!" : "text-left"}`}>
                {translate?.pages.updateProfile.phone}
              </Label>
              <PhoneInput
                country="eg"
                value={form.mobile.replace("+", "")}
                onChange={handlePhoneChange}
                inputClass="!w-full !h-10 !pl-12"
                containerClass="!w-full"
                inputProps={{
                  id: "phone",
                  name: "mobile",
                }}
              />
            </div>

            {/* Show selected file name */}
            {selectedFile && (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {selectedFile.name} (سيتم رفعها مع الحفظ)
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isUpdating || isUploading}
                className="flex items-center w-fit m-auto font-semibold rounded-xl greenBgIcon"
              >
                {(isUpdating || isUploading) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {translate?.pages.updateProfile.processing} ...
                  </>
                ) : (
                  translate?.pages.updateProfile.confirmBtn
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







// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useEffect, useState } from "react";
// import { useGetProfileQuery, useUpdateProfileMutation } from "@/store/auth/authApi";
// import PhoneInput from "react-phone-input-2";
// import { toast } from "sonner";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Loader2, User, Mail } from "lucide-react";
// import { Label } from "@/components/ui/label";
// import "react-phone-input-2/lib/style.css";
// import "./style.css";
// import TranslateHook from "@/translate/TranslateHook";
// import LangUseParams from "@/translate/LangUseParams";
// import { useRouter } from "next/navigation";
// import ProfileSkeleton from "@/components/auth/profile/ProfileSkeleton";

// function UpdateProfile() {
//   const lang = LangUseParams();
//   const translate = TranslateHook();
//   const router = useRouter();

//   const {
//     data: profileData,
//     isLoading: isLoadingProfile,
//     refetch
//   } = useGetProfileQuery(undefined, {
//     refetchOnMountOrArgChange: true,
//   });

//   const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
//   const user = profileData?.data || profileData?.user || profileData;
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//   });

//   const [initialLoading, setInitialLoading] = useState(true);

//   useEffect(() => {
//     if (user) {
//       setForm({
//         name: user.name ?? "",
//         email: user.email ?? "",
//         mobile: user.mobile ?? "",
//       });
//       setInitialLoading(false);
//     }
//   }, [user]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handlePhoneChange = (value: string) => {
//     setForm((prev) => ({ ...prev, mobile: `+${value}` }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (isUpdating) return;

   
//     if (!form.name.trim()) {
//       toast.error(translate?.pages.updateProfile.nameRequired);
//       return;
//     }

//     try {
//       const res = await updateProfile({name: form.name,email: form.email,mobile: form.mobile,}).unwrap();
//       toast.success(res?.message);

//       await refetch();
//       router.push(`/${lang}/profile`);

//     } catch (err: any) {
//       const errorData = err?.data ?? err;

//       if (errorData?.errors) { 
//         Object.values(errorData.errors).forEach((messages: any) =>
//           messages.forEach((msg: string) => toast.error(msg))
//         );
//         return;
//       }

//       if (errorData?.message) {toast.error(errorData.message);
//         return;
//       }
//     }
//   };

//   if (isLoadingProfile) return <ProfileSkeleton />;
//   if (!user) return null;

//   return (
//     <div className="max-w-3xl mx-auto p-6" dir="ltr">
//       <Card className="shadow-lg border-0">
//         <CardHeader className="text-center space-y-3 pb-6">
//           <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
//             <User className="w-6 h-6 text-blue-600" />
//           </div>
//           <CardTitle className="text-xl font-bold">
//             {translate?.pages.updateProfile.title}
//           </CardTitle>
//           <CardDescription>
//             {translate?.pages.updateProfile.titleUpdate}
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Name */}
//             <div className="space-y-2">
//               <Label htmlFor="name" className={`block ${lang === "ar" ? "text-right!" : "text-left"}`}>
//                 {translate?.pages.updateProfile.name}
//               </Label>
//               <div className="relative">
//                 <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="name"
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   className="pl-10 focus-visible:ring-0! border-gray-300!"
//                   required
//                   placeholder={translate?.pages.updateProfile.namePlaceholder}
//                 />
//               </div>
//             </div>

//             {/* Email (Disabled) */}
//             <div className="space-y-2">
//               <Label htmlFor="email" className={`block ${lang === "ar" ? "text-right!" : "text-left"}`}>
//                 {translate?.pages.updateProfile.email}
//               </Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="email"
//                   name="email"
//                   value={form.email}
//                   disabled
//                   className="pl-10 bg-gray-50"
//                   readOnly
//                 />
//               </div>
//               <p className="text-xs text-gray-500">
//                 {translate?.pages.updateProfile.emailNote}
//               </p>
//             </div>

//             {/* Phone */}
//             <div className="space-y-2">
//               <Label htmlFor="phone" className={`block ${lang === "ar" ? "text-right!" : "text-left"}`}>
//                 {translate?.pages.updateProfile.phone}
//               </Label>
//               <PhoneInput
//                 country="eg"
//                 value={form.mobile.replace("+", "")}
//                 onChange={handlePhoneChange}
//                 inputClass="!w-full !h-10 !pl-12"
//                 containerClass="!w-full"
//                 inputProps={{
//                   id: "phone",
//                   name: "mobile",
//                 }}
//               />
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-3">
//               <Button
//                 type="submit"
//                 disabled={isUpdating}
//                 className="flex items-center w-fit m-auto font-semibold rounded-xl greenBgIcon"
//                 >
//                 {isUpdating ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                     {translate?.pages.updateProfile.processing} ...
//                   </>
//                 ) : (
//                   translate?.pages.updateProfile.confirmBtn
//                 )}
//               </Button>


//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default UpdateProfile;