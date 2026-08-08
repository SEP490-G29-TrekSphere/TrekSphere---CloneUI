import { useEffect, useState } from 'react';
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
import type { CancellationPolicy, CancellationPolicyPayload } from '../types';

interface CancellationPolicyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Có giá trị = đang sửa; `null`/undefined = tạo mới. */
  policy?: CancellationPolicy | null;
  /**
   * Các mốc `cancelBeforeDays` đã tồn tại (trừ chính bản ghi đang sửa) — chặn
   * trùng ngay ở FE thay vì đợi BE trả `POLICY_DUPLICATE_DAYS`.
   */
  existingDays: number[];
  isPending?: boolean;
  onSubmit: (payload: CancellationPolicyPayload) => void;
}

interface FieldErrors {
  cancelBeforeDays?: string;
  refundPercentage?: string;
}

/** Số nguyên không âm — chuỗi rỗng/không phải số đều coi là không hợp lệ. */
function parseIntegerField(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

/**
 * Dialog tạo/sửa 1 điều khoản hủy tour — `POST` hoặc `PUT
 * /vendor/cancellation-policies`. Validate đúng các ràng buộc BE công bố
 * (`cancelBeforeDays >= 0`, `refundPercentage` 0–100, không trùng mốc ngày).
 */
export function CancellationPolicyFormDialog({
  open,
  onOpenChange,
  policy,
  existingDays,
  isPending = false,
  onSubmit,
}: CancellationPolicyFormDialogProps) {
  const isEditing = Boolean(policy);

  const [cancelBeforeDays, setCancelBeforeDays] = useState('');
  const [refundPercentage, setRefundPercentage] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Nạp lại giá trị mỗi lần mở dialog để không giữ dữ liệu của lần mở trước.
  useEffect(() => {
    if (!open) return;
    setCancelBeforeDays(policy ? String(policy.cancelBeforeDays) : '');
    setRefundPercentage(policy ? String(policy.refundPercentage) : '');
    setDescription(policy?.description ?? '');
    setErrors({});
  }, [open, policy]);

  const handleSubmit = () => {
    const days = parseIntegerField(cancelBeforeDays);
    const percentage = parseIntegerField(refundPercentage);
    const nextErrors: FieldErrors = {};

    if (days === null) {
      nextErrors.cancelBeforeDays = 'Số ngày hủy trước khởi hành phải lớn hơn hoặc bằng 0.';
    } else if (existingDays.includes(days)) {
      nextErrors.cancelBeforeDays =
        'Mốc số ngày hủy này đã tồn tại trong danh sách. Vui lòng chọn mốc ngày khác!';
    }

    if (percentage === null || percentage > 100) {
      nextErrors.refundPercentage = 'Phần trăm hoàn tiền phải từ 0% đến 100%.';
    }

    setErrors(nextErrors);
    if (days === null || percentage === null || Object.keys(nextErrors).length > 0) return;

    onSubmit({
      cancelBeforeDays: days,
      refundPercentage: percentage,
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Sửa chính sách hủy' : 'Thêm chính sách hủy'}</DialogTitle>
          <DialogDescription>
            Khi khách hủy tour, hệ thống tự chọn điều khoản khớp nhất theo số ngày còn lại đến ngày
            khởi hành để tính tiền hoàn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="policy-cancel-days">Hủy trước (số ngày)</Label>
            <Input
              id="policy-cancel-days"
              inputMode="numeric"
              value={cancelBeforeDays}
              onChange={(e) => setCancelBeforeDays(e.target.value)}
              placeholder="7"
            />
            {errors.cancelBeforeDays && (
              <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
                {errors.cancelBeforeDays}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="policy-refund-percentage">Phần trăm hoàn tiền (%)</Label>
            <Input
              id="policy-refund-percentage"
              inputMode="numeric"
              value={refundPercentage}
              onChange={(e) => setRefundPercentage(e.target.value)}
              placeholder="80"
            />
            {errors.refundPercentage && (
              <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
                {errors.refundPercentage}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="policy-description">Mô tả điều khoản</Label>
            <Input
              id="policy-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hủy trước 7 ngày được hoàn 80% giá trị đơn hàng"
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
          <Button className="flex-1 rounded-full" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm chính sách'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
