import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LockStaffConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffName: string;
  onConfirm: () => void;
  isPending?: boolean;
}

/** Xác nhận trước khi khóa nhân viên — mở khóa thì gọi thẳng, không cần dialog này. */
export function LockStaffConfirmDialog({
  open,
  onOpenChange,
  staffName,
  onConfirm,
  isPending = false,
}: LockStaffConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
          >
            <Ban className="h-5 w-5" style={{ color: '#DC2626' }} />
          </div>
          <DialogTitle className="text-xl font-bold">Khóa nhân viên</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Bạn có chắc chắn muốn khóa quyền truy cập của "{staffName}" không? Nhân viên này sẽ
            không thể đăng nhập cho đến khi bạn mở khóa lại.
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
            variant="destructive"
            className="flex-1 rounded-full"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang xử lý...' : 'Khóa nhân viên'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
