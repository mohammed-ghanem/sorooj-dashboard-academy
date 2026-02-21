"use client";

import { useGetProfileQuery } from "@/store/auth/authApi";
import Link from "next/link";
import { SquarePen, User, Mail, Phone } from "lucide-react";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import ProfileSkeleton from "@/components/auth/profile/ProfileSkeleton";

function ProfileDetails() {
  const lang = LangUseParams();
  const translate = TranslateHook();

  const { data, isLoading } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const user = data?.data || data?.user || data;



  if (isLoading) return <ProfileSkeleton />;
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="shadow-lg border-0">
        {/* Header */}
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto relative">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-blue-600" />
              )}
            </div>
          </div>

          <CardTitle className="text-xl font-semibold tracking-tight">
            {user.name}
          </CardTitle>

          <CardDescription className="text-sm">
            {translate?.pages.profile.title}
          </CardDescription>

          <Badge variant="secondary" className="mx-auto">
            {user.roles || translate?.pages.profile.member}
          </Badge>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
              {translate?.pages.profile.personalDetails}
            </h3>

            {/* Name */}
            <div className="flex items-center gap-4 rounded-xl border p-4 transition hover:bg-muted/40">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  {translate?.pages.profile.name}
                </p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 rounded-xl border p-4 transition hover:bg-muted/40">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  {translate?.pages.profile.email}
                </p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            {user.mobile && (
              <div className="flex items-center gap-4 rounded-xl border p-4 transition hover:bg-muted/40">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {translate?.pages.profile.phone}
                  </p>
                  <p className="font-medium">{user.mobile}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action */}
          <Button
            asChild
            size="lg"
            className="flex items-center w-fit m-auto font-semibold rounded-xl greenBgIcon"
          >
            <Link href={`/${lang}/update-profile`}>
              <SquarePen className="w-4 h-4 " />
              {translate?.pages.profile.editProfile}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileDetails;