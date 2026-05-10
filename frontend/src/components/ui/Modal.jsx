import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Loader } from './Loader';
import { cn } from '@/lib/utils';

export const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
  children,
  maxWidth = 'max-w-[500px]',
  showIcon = true,
}) => {
  const config = {
    danger: {
      icon: <AlertCircle className="h-6 w-6 text-destructive" />,
      buttonClass:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      iconContainer: 'bg-destructive/10',
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      buttonClass: 'bg-yellow-600 text-white hover:bg-yellow-700',
      iconContainer: 'bg-yellow-50',
    },
    success: {
      icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
      buttonClass: 'bg-green-600 text-white hover:bg-green-700',
      iconContainer: 'bg-green-50',
    },
    info: {
      icon: <Info className="h-6 w-6 text-primary" />,
      buttonClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
      iconContainer: 'bg-primary/10',
    },
  }[variant];

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent
        className={cn('overflow-y-auto max-h-[90vh]', maxWidth)}
      >
        <AlertDialogHeader>
          <div
            className={cn(
              'flex flex-col gap-4',
              showIcon ? 'items-center text-center' : 'items-start text-left'
            )}
          >
            {showIcon && (
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconContainer}`}
              >
                {config.icon}
              </div>
            )}
            <div className="space-y-2 w-full">
              <AlertDialogTitle className="text-xl font-bold">
                {title}
              </AlertDialogTitle>
              {description && (
                <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                  {description}
                </AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>

        {children && <div className="my-4">{children}</div>}

        <AlertDialogFooter
          className={cn(
            'mt-4 gap-2',
            showIcon ? 'sm:justify-center' : 'sm:justify-end'
          )}
        >
          <AlertDialogCancel
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </AlertDialogCancel>
          {onConfirm && (
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              disabled={isLoading}
              className={cn(
                'flex-1 sm:flex-none min-w-[100px]',
                config.buttonClass
              )}
            >
              {isLoading ? <Loader color="white" /> : confirmText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
