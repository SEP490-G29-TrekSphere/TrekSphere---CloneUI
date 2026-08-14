import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { type AdminVendor, VENDOR_STATUS_LABELS, type VendorStatus } from '../types';

interface VendorStatusDialogProps {
  vendor: AdminVendor | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (vendorId: string, status: VendorStatus) => void;
  isPending?: boolean;
}

const STATUS_OPTIONS: VendorStatus[] = ['ACTIVE', 'INACTIVE', 'REVOKED'];

/** Modal đổi trạng thái Vendor — dùng `PUT /vendors/{vendorId}/status`. */
export function VendorStatusDialog({
  vendor,
  onOpenChange,
  onConfirm,
  isPending = false,
}: VendorStatusDialogProps) {
  const [nextStatus, setNextStatus] = useState<VendorStatus | null>(null);

  const open = vendor !== null;
  const selectedStatus = nextStatus ?? vendor?.status ?? 'ACTIVE';

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setNextStatus(null);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Đổi trạng thái Vendor</DialogTitle>
          <DialogDescription>
            Cập nhật trạng thái hoạt động cho{' '}
            <span className="font-semibold">{vendor?.companyName}</span>. Trạng thái hiện tại:{' '}
            <span className="font-semibold">
              {vendor ? VENDOR_STATUS_LABELS[vendor.status] : ''}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <Select
          value={selectedStatus}
          onValueChange={(value) => setNextStatus(value as VendorStatus)}
        >
          <SelectTrigger className="w-full">
            <span>{VENDOR_STATUS_LABELS[selectedStatus]}</span>
          </SelectTrigger>
          <SelectContent side="bottom" sideOffset={8} alignItemWithTrigger={false}>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {VENDOR_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter className="!mt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className="flex-1 rounded-full"
            disabled={isPending || !vendor || selectedStatus === vendor.status}
            onClick={() => vendor && onConfirm(vendor.id, selectedStatus)}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang xử lý...
              </span>
            ) : (
              'Xác nhận'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
