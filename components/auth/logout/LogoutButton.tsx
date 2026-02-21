"use client";

import { useLogoutMutation } from "@/store/auth/authApi";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import ConfirmLogoutDialog from "@/components/shared/ConfirmLogoutDialog";
import LangUseParams from "@/translate/LangUseParams";

interface LogoutButtonProps {
  redirectTo?: string;
  onSuccess?: () => void;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

export default function LogoutButton({

  redirectTo = "/login",
  onSuccess,
  onDialogOpen,
  onDialogClose,
}: LogoutButtonProps) {
  const [logout, { isLoading }] = useLogoutMutation();
  const router = useRouter();
  const lang = LangUseParams();

  const handleLogout = async () => {
    try {
      const result = await logout().unwrap();

      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("reset_token", { path: "/" });
      localStorage.removeItem("auth_state");

      toast.success(result?.message);
      onSuccess?.();

      router.push(redirectTo);
      router.refresh();

    } catch (err: any) {
      toast.error(
        err?.data?.message
      );

      Cookies.remove("access_token", { path: "/" });
      router.push(`${lang}/login`);
    }
  };

  return (
    <ConfirmLogoutDialog
      onConfirm={handleLogout}
      isLoading={isLoading}
      onOpenChange={(open) =>
        open ? onDialogOpen?.() : onDialogClose?.()
      }
    />
  );
}