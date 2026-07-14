import { Ban, ShieldOff } from 'lucide-react';
import type * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type ConfirmDialogVariant = 'lock' | 'revoke';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ConfirmDialogVariant;
  accountName: string;
  onConfirm: () => void;
  isPending?: boolean;
}

/** Icon + màu theo từng variant. */
const VARIANT_CONFIG: Record<
  ConfirmDialogVariant,
  {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    confirmLabel: string;
    confirmVariant: 'destructive' | 'default';
  }
> = {
  lock: {
    icon: <Ban className="h-5 w-5" />,
    iconBg: 'rgba(220, 38, 38, 0.1)',
    iconColor: '#DC2626',
    confirmLabel: 'Khóa tài khoản',
    confirmVariant: 'destructive',
  },
  revoke: {
    icon: <ShieldOff className="h-5 w-5" />,
    iconBg: 'rgba(220, 38, 38, 0.1)',
    iconColor: '#DC2626',
    confirmLabel: 'Thu hồi giấy phép',
    confirmVariant: 'destructive',
  },
};

const DESCRIPTIONS: Record<
  ConfirmDialogVariant,
  { title: string; body: (name: string) => string }
> = {
  lock: {
    title: 'Khóa tài khoản',
    body: (name) =>
      `Bạn có chắc chắn muốn khóa tài khoản của "${name}" không? Người dùng này sẽ không thể đăng nhập cho đến khi bạn mở khóa.`,
  },
  revoke: {
    title: 'Thu hồi giấy phép',
    body: (name) =>
      `Bạn có chắc chắn muốn thu hồi giấy phép của "${name}" không? Hành động này sẽ xóa toàn bộ quyền đặc biệt của tài khoản này.`,
  },
};

/**
 * Popup xác nhận cho các thao tác nguy hiểm trong Admin.
 * Dùng chung cho: Khóa tài khoản, Thu hồi giấy phép.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  variant,
  accountName,
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const config = VARIANT_CONFIG[variant];
  const desc = DESCRIPTIONS[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader className="items-center text-center">
          {/* Icon */}
          <div
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: config.iconBg }}
          >
            <span style={{ color: config.iconColor }}>{config.icon}</span>
          </div>

          <DialogTitle className="text-xl font-bold">{desc.title}</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            {desc.body(accountName)}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="!mt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            variant={config.confirmVariant}
            className="flex-1 rounded-full"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang xử lý...
              </span>
            ) : (
              config.confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
