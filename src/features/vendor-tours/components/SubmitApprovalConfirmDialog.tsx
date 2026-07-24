import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SubmitApprovalConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourName: string;
  onConfirm: () => void;
  isPending?: boolean;
}

/** Xác nhận trước khi gửi tour lên cho Manager duyệt — mirror `DeleteTourConfirmDialog`. */
export function SubmitApprovalConfirmDialog({
  open,
  onOpenChange,
  tourName,
  onConfirm,
  isPending = false,
}: SubmitApprovalConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(14, 124, 107, 0.1)' }}
          >
            <Send className="h-5 w-5" style={{ color: '#0E7C6B' }} />
          </div>
          <DialogTitle className="text-xl font-bold">Gửi yêu cầu kiểm duyệt</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Gửi tour "{tourName}" lên cho Quản lý duyệt? Sau khi gửi, bạn sẽ không sửa được tour cho
            đến khi có kết quả duyệt.
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
            style={{ backgroundColor: '#06261D' }}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang gửi...' : 'Gửi duyệt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
