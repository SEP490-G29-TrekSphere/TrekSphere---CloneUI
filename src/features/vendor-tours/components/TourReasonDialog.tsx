import { zodResolver } from '@hookform/resolvers/zod';
import type { LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const reasonSchema = z.object({
  reason: z.string().trim().min(1, 'Vui lòng nhập lý do'),
});

type ReasonFormValues = z.infer<typeof reasonSchema>;

interface TourReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  placeholder: string;
  confirmLabel: string;
  confirmPendingLabel: string;
  onConfirm: (reason: string) => void;
  isPending?: boolean;
}

/**
 * Dialog dùng chung cho Từ chối và Ẩn tour — cả 2 API (`PUT .../reject`, `PUT .../hide`) đều
 * bắt buộc gửi kèm `reason`.
 */
export function TourReasonDialog({
  open,
  onOpenChange,
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  description,
  placeholder,
  confirmLabel,
  confirmPendingLabel,
  onConfirm,
  isPending = false,
}: TourReasonDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReasonFormValues>({
    resolver: zodResolver(reasonSchema),
    defaultValues: { reason: '' },
  });

  // Reset lại textarea mỗi lần dialog mở, tránh giữ lý do của lần mở trước (cho tour khác).
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const submit = handleSubmit(({ reason }) => onConfirm(reason));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon className="h-5 w-5" style={{ color: iconColor }} />
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <textarea
            {...register('reason')}
            rows={3}
            placeholder={placeholder}
            className="w-full resize-none rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1"
            style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
          />
          {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
        </div>

        <DialogFooter className="!mt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className="flex-1 rounded-full text-white"
            style={{ backgroundColor: iconColor }}
            onClick={submit}
            disabled={isPending}
          >
            {isPending ? confirmPendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
