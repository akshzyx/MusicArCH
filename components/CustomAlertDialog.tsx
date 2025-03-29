"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";

interface CustomAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  variant?: "default" | "destructive";
  dialogContentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
}

export function CustomAlertDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = "OK",
  cancelText,
  onConfirm,
  variant = "default",
  dialogContentClassName,
  titleClassName,
  descriptionClassName,
  confirmButtonClassName,
  cancelButtonClassName,
}: CustomAlertDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogOverlay className="fixed inset-0 bg-black/50" />
      <AlertDialogContent
        className={`bg-[#0C1521] text-white border border-gray-700 p-6 rounded-lg shadow-lg max-w-md w-full ${
          dialogContentClassName || ""
        }`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className={`text-white ${titleClassName || ""}`}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            className={`text-gray-300 ${descriptionClassName || ""}`}
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelText && (
            <AlertDialogCancel
              className={`px-4 py-2 rounded transition-colors ${
                cancelButtonClassName ||
                "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={onConfirm}
            className={`px-4 py-2 rounded transition-colors ${
              confirmButtonClassName ||
              (variant === "destructive"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-blue-500 text-white hover:bg-blue-600")
            }`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
