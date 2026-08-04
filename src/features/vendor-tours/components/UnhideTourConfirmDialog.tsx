import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UnhideTourConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourName: string;
  onConfirm: () => void;
  isPending?: boolean;
}

/** Xác nhận trước khi mở lại 1 tour đang HIDDEN — mirror `ApproveTourConfirmDialog`. */
export function UnhideTourConfirmDialog({
  open,
  onOpenChange,
  tourName,
  onConfirm,
  isPending = false,
}: UnhideTourConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
          >
            <Eye className="h-5 w-5" style={{ color: '#16A34A' }} />
          </div>
          <DialogTitle className="text-xl font-bold">Mở lại tour</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Mở lại tour "{tourName}"? Tour sẽ hiển thị lại công khai cho khách hàng.
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
            style={{ backgroundColor: '#16A34A' }}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang mở lại...' : 'Mở lại tour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
