import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AssignCoordinatorPayload, CoordinatorCandidate } from '../types';

export interface AssignCoordinatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: CoordinatorCandidate[];
  /** userId của các coordinator đã gán — loại khỏi danh sách chọn để tránh gán trùng. */
  assignedUserIds: string[];
  /** Đang tải danh sách ứng viên từ `GET /vendor-staff/coordinators`. */
  isLoadingCandidates?: boolean;
  /** Lỗi khi tải danh sách ứng viên (vd 403 nếu role không được gọi endpoint). */
  candidatesError?: unknown;
  isPending?: boolean;
  onSubmit: (payload: AssignCoordinatorPayload) => void;
}

/**
 * Dialog "Chỉ định thêm" Coordinator — gọi `POST /vendor/sessions/{id}/coordinators`.
 * Ứng viên lấy từ `GET /vendor-staff/coordinators` (xem `useCoordinatorCandidates`).
 *
 * Phân biệt rõ 3 trạng thái "không có gì để chọn" — trước đây gộp làm một nên
 * khi API lỗi vẫn báo "tất cả đã được phân công", che mất nguyên nhân thật.
 */
export function AssignCoordinatorDialog({
  open,
  onOpenChange,
  candidates,
  assignedUserIds,
  isLoadingCandidates = false,
  candidatesError,
  isPending = false,
  onSubmit,
}: AssignCoordinatorDialogProps) {
  const [coordinatorId, setCoordinatorId] = useState('');
  const [isLead, setIsLead] = useState(false);

  const available = useMemo(
    () => candidates.filter((c) => !assignedUserIds.includes(c.userId)),
    [candidates, assignedUserIds]
  );

  useEffect(() => {
    if (open) {
      setCoordinatorId(available[0]?.userId ?? '');
      setIsLead(false);
    }
  }, [open, available]);

  const handleSubmit = () => {
    if (!coordinatorId) return;
    onSubmit({ coordinatorId, isLead });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Chỉ định điều phối viên</DialogTitle>
          <DialogDescription>
            Chọn nhân viên trong công ty để phân công dẫn đoàn cho phiên tour này.
          </DialogDescription>
        </DialogHeader>

        {isLoadingCandidates ? (
          <p className="text-sm" style={{ color: '#6F7B75' }}>
            Đang tải danh sách điều phối viên...
          </p>
        ) : candidatesError ? (
          <p className="text-sm" style={{ color: '#DC2626' }}>
            Không tải được danh sách điều phối viên:{' '}
            {candidatesError instanceof Error ? candidatesError.message : 'Lỗi không xác định'}
          </p>
        ) : candidates.length === 0 ? (
          <p className="text-sm" style={{ color: '#6F7B75' }}>
            Công ty chưa có nhân viên nào giữ vai trò Điều phối viên (COORDINATOR) đang hoạt động.
          </p>
        ) : available.length === 0 ? (
          <p className="text-sm" style={{ color: '#6F7B75' }}>
            Tất cả điều phối viên đều đã được phân công cho phiên này.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="coordinatorId"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Nhân viên
              </label>
              <select
                id="coordinatorId"
                value={coordinatorId}
                onChange={(e) => setCoordinatorId(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              >
                {available.map((candidate) => (
                  <option key={candidate.userId} value={candidate.userId}>
                    {candidate.fullName} — {candidate.email}
                  </option>
                ))}
              </select>
            </div>

            <label
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: '#06261D' }}
            >
              <input
                type="checkbox"
                checked={isLead}
                onChange={(e) => setIsLead(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Là điều phối viên trưởng (Lead)
            </label>
          </div>
        )}

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
            onClick={handleSubmit}
            disabled={isPending || !coordinatorId}
          >
            {isPending ? 'Đang gán...' : 'Chỉ định'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
