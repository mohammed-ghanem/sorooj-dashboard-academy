"use client";

import { useLogoutMutation } from "@/store/auth/authApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmLogoutDialog from "@/components/shared/ConfirmLogoutDialog";
import { clearAuthSession } from "@/lib/authCookies";
import { markVoluntaryLogout } from "@/lib/handleSessionExpired";

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

  const handleLogout = async () => {
    markVoluntaryLogout();

    try {
      const result = await logout().unwrap();

      clearAuthSession();

      toast.success(result?.message);
      onSuccess?.();

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.data?.message);

      clearAuthSession();
      router.push(redirectTo);
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
