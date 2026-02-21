"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import TranslateHook from "@/translate/TranslateHook";
import { LogOut, CircleAlert, Loader2 } from "lucide-react";

type ConfirmLogoutDialogProps = {
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  onOpenChange?: (open: boolean) => void;
};



export default function ConfirmLogoutDialog({
  onConfirm,
  isLoading,
  onOpenChange,
}: ConfirmLogoutDialogProps) {

    const translate = TranslateHook();

  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start
           text-red-600
           hover:text-red-400
           hover:bg-gray-50 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {translate?.pages.userDropDown.logout}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
                <div className="flex items-center justify-center">
                    <CircleAlert className="h-20 w-20 text-red-600!" />
                </div>
            <AlertDialogHeader className="text-center! my-4">
                <AlertDialogTitle className="text-2xl font-bold">
                {translate?.pages.userDropDown.confirmLogout}
                </AlertDialogTitle>
                <AlertDialogDescription className="font-bold my-1.5">
                {translate?.pages.userDropDown.confirmLogoutQuestion}
                </AlertDialogDescription>
             </AlertDialogHeader>



         <AlertDialogFooter className="justify-center! items-center! space-x-3 my-2">
          <AlertDialogCancel
           className=" px-8 py-5 text-white hover:text-white bg-green-600 hover:bg-green-700 cursor-pointer"
            disabled={isLoading}>
            {translate?.pages.userDropDown.cancelBtn}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 cursor-pointer hover:bg-red-700 px-8 py-5"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {translate?.pages.userDropDown.logoutProcissing}
              </span>
            ) : (
              translate?.pages.userDropDown.logout
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
