import { Calendar, MapPin } from 'lucide-react';
import { AppBadge } from '@/shared/ui';
import { formatDate } from '@/utils/format';
import type { MatchingGroupStatus } from '../../services/companionGroupService';

interface GroupDetailHeroProps {
  groupName: string;
  tourName?: string;
  description?: string;
  status: MatchingGroupStatus;
  targetDate: string;
}

const statusConfig: Record<
  MatchingGroupStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  OPEN: { label: 'Đang tuyển', variant: 'secondary' },
  FULL: { label: 'Đã đủ', variant: 'outline' },
  CLOSED: { label: 'Đã đóng', variant: 'destructive' },
  HIDDEN: { label: 'Ẩn', variant: 'outline' },
};

export function GroupDetailHero({
  groupName,
  tourName,
  description,
  status,
  targetDate,
}: GroupDetailHeroProps) {
  const { label, variant } = statusConfig[status];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary shadow-sm p-6 md:p-10 text-white space-y-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <AppBadge variant={variant} className="text-xs font-bold">
          Trạng thái: {label}
        </AppBadge>
        <span className="flex items-center gap-1.5 text-xs font-medium text-white/80">
          <Calendar className="h-3.5 w-3.5" />
          Khởi hành: {formatDate(targetDate)}
        </span>
      </div>

      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">{groupName}</h1>

      {tourName && (
        <p className="flex items-center gap-1.5 text-xs md:text-sm text-secondary font-semibold">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>Tour: {tourName}</span>
        </p>
      )}

      {description && (
        <p className="max-w-3xl text-xs md:text-sm text-white/90 leading-relaxed">{description}</p>
      )}
    </div>
  );
}
