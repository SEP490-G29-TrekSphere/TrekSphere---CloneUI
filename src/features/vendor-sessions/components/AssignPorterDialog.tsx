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
import type { VendorPorterItem } from '@/features/vendor-porters/types';
import type { AssignPorterPayload } from '../types';

export interface AssignPorterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: VendorPorterItem[];
  /** id của các porter đã gán — loại khỏi danh sách chọn để tránh gán trùng. */
  assignedPorterIds: string[];
  isPending?: boolean;
  onSubmit: (payload: AssignPorterPayload) => void;
}

/** Dialog "Thêm Porter" — gọi `POST /vendor/sessions/{id}/porters`, kèm ghi chú nhiệm vụ. */
export function AssignPorterDialog({
  open,
  onOpenChange,
  candidates,
  assignedPorterIds,
  isPending = false,
  onSubmit,
}: AssignPorterDialogProps) {
  const [porterId, setPorterId] = useState('');
  const [note, setNote] = useState('');

  const available = useMemo(
    () => candidates.filter((p) => !assignedPorterIds.includes(p.id)),
    [candidates, assignedPorterIds]
  );

  useEffect(() => {
    if (open) {
      setPorterId(available[0]?.id ?? '');
      setNote('');
    }
  }, [open, available]);

  const handleSubmit = () => {
    if (!porterId) return;
    onSubmit({ porterId, note: note.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Thêm Porter</DialogTitle>
          <DialogDescription>
            Chọn porter đi theo hỗ trợ và giao ghi chú nhiệm vụ cụ thể (vd: tải đồ, dựng lều...).
          </DialogDescription>
        </DialogHeader>

        {available.length === 0 ? (
          <p className="text-sm" style={{ color: '#6F7B75' }}>
            Tất cả porter đang hoạt động đều đã được phân công cho phiên này.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="porterId"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Porter
              </label>
              <select
                id="porterId"
                value={porterId}
                onChange={(e) => setPorterId(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              >
                {available.map((porter) => (
                  <option key={porter.id} value={porter.id}>
                    {porter.fullName} — {porter.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="porterNote"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Ghi chú nhiệm vụ
              </label>
              <textarea
                id="porterNote"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Tải 15kg thực phẩm & bếp gas"
                className="w-full resize-none rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
            </div>
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
            disabled={isPending || !porterId}
          >
            {isPending ? 'Đang thêm...' : 'Thêm Porter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
