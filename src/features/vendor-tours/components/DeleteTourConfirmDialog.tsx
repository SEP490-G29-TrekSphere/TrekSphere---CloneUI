import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteTourConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourName: string;
  onConfirm: () => void;
  isPending?: boolean;
}

/** Xác nhận trước khi xóa mềm tour — mirror `LockStaffConfirmDialog`. */
export function DeleteTourConfirmDialog({
  open,
  onOpenChange,
  tourName,
  onConfirm,
  isPending = false,
}: DeleteTourConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
          >
            <Trash2 className="h-5 w-5" style={{ color: '#DC2626' }} />
          </div>
          <DialogTitle className="text-xl font-bold">Xóa tour</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Bạn có chắc chắn muốn xóa tour "{tourName}" không? Tour sẽ bị ẩn khỏi hệ thống và không
            thể hoàn tác.
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
            {isPending ? 'Đang xóa...' : 'Xóa tour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
