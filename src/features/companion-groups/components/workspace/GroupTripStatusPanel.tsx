import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSetTripStatus } from '../../hooks/useGroupLifecycle';

interface GroupTripStatusPanelProps {
  groupId: string;
  isLeader: boolean;
  tripStatus: 'ONGOING' | 'COMPLETED';
}

/**
 * Banner trạng thái chuyến đi trong tab "Quản trị nhóm" — đặt ngay trên bảng thành viên vì
 * leader chuyển trạng thái ở đây sẽ trực tiếp mở/khoá nút "Đánh Giá Peer" trên từng thẻ thành
 * viên bên dưới (`GroupMembersWorkspace`).
 */
export function GroupTripStatusPanel({ groupId, isLeader, tripStatus }: GroupTripStatusPanelProps) {
  const setTripStatus = useSetTripStatus(groupId);

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-foreground shadow-xs transition-all duration-200',
        tripStatus === 'COMPLETED'
          ? 'border-primary/30 bg-primary/10'
          : 'border-secondary bg-secondary/30'
      )}
    >
      <div className="flex items-start sm:items-center gap-3">
        {tripStatus === 'COMPLETED' ? (
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
        ) : (
          <Clock className="h-5 w-5 text-secondary-foreground shrink-0 mt-0.5 sm:mt-0" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm">
              {tripStatus === 'COMPLETED'
                ? 'Chuyến đi đã được xác thực hoàn thành!'
                : 'Chuyến đi đang trong giai đoạn thực hiện'}
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider',
                tripStatus === 'COMPLETED'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {tripStatus === 'COMPLETED' ? 'Đã đi xong' : 'Đang diễn ra'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {tripStatus === 'COMPLETED'
              ? 'Hệ thống đã mở tính năng Đánh Giá Peer Review. Bạn có thể chấm điểm uy tín Trust Score cho các đồng đội cùng đoàn.'
              : 'Tính năng Đánh Giá Đồng Đội (Peer Review) chỉ kích hoạt sau khi nhóm hoàn thành chuyến đi & được Leader xác thực.'}
          </p>
        </div>
      </div>

      {isLeader && (
        <button
          type="button"
          disabled={setTripStatus.isPending}
          onClick={() => setTripStatus.mutate(tripStatus === 'ONGOING' ? 'COMPLETED' : 'ONGOING')}
          className={cn(
            'shrink-0 rounded-xl px-3 py-2 font-bold text-xs border transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50',
            tripStatus === 'COMPLETED'
              ? 'border-border bg-background text-foreground hover:bg-muted'
              : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
          )}
        >
          {tripStatus === 'COMPLETED' ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Chuyển trạng thái: Đang đi tour
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              Chuyển trạng thái: Đã đi xong (Mở Review)
            </>
          )}
        </button>
      )}
    </div>
  );
}
