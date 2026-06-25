import CloseIcon from '@/assets/icons/close.svg?react';
import { AppIcon } from '@/shared/ui/primitives/AppIcon';
import { type ToastMessage, useToastStore } from '@/store/useToastStore';

const toastStyles: Record<ToastMessage['type'], string> = {
  success: 'bg-green-50 text-green-900 border-green-200',
  error: 'bg-red-50 text-red-900 border-red-200',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  info: 'bg-blue-50 text-blue-900 border-blue-200',
};

function ToastItem({ toast: t }: { toast: ToastMessage }) {
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-right-full fade-in ${toastStyles[t.type]}`}
      role="alert"
    >
      <div className="flex-1 text-sm font-medium">{t.message}</div>
      <button
        type="button"
        onClick={() => removeToast(t.id)}
        className="inline-flex shrink-0 rounded-md p-1.5 opacity-50 hover:opacity-100 focus:outline-none focus:ring-2"
        aria-label="Close"
      >
        <AppIcon svg={CloseIcon} size="sm" />
      </button>
    </div>
  );
}

export function AppGlobalToast() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:w-auto sm:max-w-[420px] pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
