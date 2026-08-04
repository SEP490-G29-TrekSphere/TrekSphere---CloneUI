import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RevertToDraftConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Copy khác nhau tùy trang gọi (Staff → về Bản nháp, Manager → về Chờ duyệt). */
  description: string;
  onConfirm: () => void;
  isPending?: boolean;
}

/**
 * Xác nhận trước khi gọi `revert-to-draft` — cùng 1 API cho cả Staff và Manager, BE tự quyết
 * định trạng thái đích theo role người gọi nên không cần lý do, chỉ cần xác nhận.
 */
export function RevertToDraftConfirmDialog({
  open,
  onOpenChange,
  description,
  onConfirm,
  isPending = false,
}: RevertToDraftConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(14, 124, 107, 0.1)' }}
          >
            <RefreshCw className="h-5 w-5" style={{ color: '#0E7C6B' }} />
          </div>
          <DialogTitle className="text-xl font-bold">Chuyển trạng thái / Sửa lại</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            {description}
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
            className="flex-1 rounded-full text-white"
            style={{ backgroundColor: '#0E7C6B' }}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang chuyển...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
