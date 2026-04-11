import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Loader } from "./Loader";


export const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}) => {
  const config = {
    danger: {
      icon: <AlertCircle className="h-6 w-6 text-destructive" />,
      buttonClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      iconContainer: "bg-destructive/10",
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      buttonClass: "bg-yellow-600 text-white hover:bg-yellow-700",
      iconContainer: "bg-yellow-50",
    },
    success: {
      icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
      buttonClass: "bg-green-600 text-white hover:bg-green-700",
      iconContainer: "bg-green-50",
    },
    info: {
      icon: <Info className="h-6 w-6 text-primary" />,
      buttonClass: "bg-primary text-primary-foreground hover:bg-primary/90",
      iconContainer: "bg-primary/10",
    },
  }[variant];

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconContainer}`}>
              {config.icon}
            </div>
            <div className="space-y-2">
              <AlertDialogTitle className="text-xl font-bold">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 sm:justify-center gap-2">
          <AlertDialogCancel disabled={isLoading} className="flex-1 sm:flex-none">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={`flex-1 sm:flex-none min-w-[100px] ${config.buttonClass}`}
          >
            {isLoading ? (
              <Loader />
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
