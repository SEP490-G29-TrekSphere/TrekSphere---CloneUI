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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AddVendorStaffPayload } from '../types';

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AddVendorStaffPayload) => void;
  isPending?: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Dialog "Thêm nhân viên" — gọi `POST /vendor-staff` (email bắt buộc, họ tên tuỳ chọn).
 * Validate email đơn giản bằng regex, không cần react-hook-form/zod cho 2 field.
 */
export function AddStaffDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
}: AddStaffDialogProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  const isValid = EMAIL_PATTERN.test(email.trim());

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({ email: email.trim(), fullName: fullName.trim() || undefined });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setEmail('');
          setFullName('');
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên</DialogTitle>
          <DialogDescription>
            Nhập email nhân viên — hệ thống sẽ gán tài khoản có sẵn hoặc gửi email kích hoạt nếu là
            người dùng mới.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-staff-email">Email</Label>
            <Input
              id="add-staff-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhanvien@congty.vn"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-staff-fullname">Họ và tên</Label>
            <Input
              id="add-staff-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>
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
            className="flex-1 rounded-full"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
          >
            {isPending ? 'Đang gửi...' : 'Thêm nhân viên'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
