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
import {
  type AddVendorStaffPayload,
  VENDOR_STAFF_ROLE_LABELS,
  VENDOR_STAFF_ROLES,
  type VendorStaffRole,
} from '../types';

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AddVendorStaffPayload) => void;
  isPending?: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Dialog "Thêm nhân viên" — gọi `POST /vendor-staff` (email bắt buộc, họ tên và
 * vai trò tuỳ chọn). Validate email đơn giản bằng regex, không cần
 * react-hook-form/zod cho 3 field.
 */
export function AddStaffDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
}: AddStaffDialogProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<VendorStaffRole>('VENDOR_STAFF');

  const isValid = EMAIL_PATTERN.test(email.trim());

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({ email: email.trim(), fullName: fullName.trim() || undefined, role });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setEmail('');
          setFullName('');
          setRole('VENDOR_STAFF');
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[420px] max-h-[85vh] overflow-y-auto">
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-staff-role">Vai trò</Label>
            <select
              id="add-staff-role"
              value={role}
              onChange={(e) => setRole(e.target.value as VendorStaffRole)}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F8F6EF', color: '#06261D', border: '1px solid #E0DCD1' }}
            >
              {VENDOR_STAFF_ROLES.map((value) => (
                <option key={value} value={value}>
                  {VENDOR_STAFF_ROLE_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="text-xs" style={{ color: '#6F7B75' }}>
              Điều phối viên mới được phân công dẫn đoàn cho phiên tour.
            </p>
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
