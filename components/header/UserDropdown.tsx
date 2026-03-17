"use client";

import { useState, useRef, useEffect } from "react";
import { useGetProfileQuery } from "@/store/auth/authApi";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";
import {
  UserCircle,
  ChevronDown,
  UserIcon,
  SettingsIcon,
} from "lucide-react";
import LangUseParams from "@/translate/LangUseParams";
import TranslateHook from "@/translate/TranslateHook";
import LogoutButton from "../auth/logout/LogoutButton";

interface UserDropdownProps {
  showUserName?: boolean;
}

export default function UserDropdown({
  showUserName = true,
}: UserDropdownProps) {
  const lang = LangUseParams();
  const translate = TranslateHook();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const token = Cookies.get("access_token");

  const { data: profileData, isLoading } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  const user = profileData?.data || profileData?.user || profileData || null;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isLogoutDialogOpen) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, [isLogoutDialogOpen]);

  if (!token) return null;

  if (isLoading || !user) {
    return (
      <div className="w-28 h-8 rounded-md bg-gray-300 animate-pulse" />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border">
          {user?.avatar ? (
            <Image
              src={user?.avatar}
              alt={user?.name || "user"}
              width={40}
              height={40}
            />
          ) : (
            <UserCircle className="w-full h-full text-blue-600" />
          )}
        </div>

        {showUserName && (
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">
              {user.name}
            </span>
            <span className="text-xs text-gray-500">
              {user.email}
            </span>
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-3 border-b">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">
              {user.email}
            </div>
          </div>

          <Link
            href={`/${lang}/profile`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
          >
            <UserIcon className="w-4 h-4" />
            {translate?.pages.userDropDown.profile}
          </Link>

          <Link
            href={`/${lang}/change-password`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
          >
            <SettingsIcon className="w-4 h-4" />
            {translate?.pages.userDropDown.changePassword}
          </Link>

          <div className="border-t my-1" />

          <div className="px-2 py-2">
            <LogoutButton
              redirectTo={`/${lang}/login`}
              onSuccess={() => {
                setIsOpen(false);
                setIsLogoutDialogOpen(false);
              }}
              onDialogOpen={() => setIsLogoutDialogOpen(true)}
              onDialogClose={() => setIsLogoutDialogOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}