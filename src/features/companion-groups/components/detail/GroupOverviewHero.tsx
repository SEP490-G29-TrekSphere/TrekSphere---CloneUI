import { Calendar, MapPin, Users } from 'lucide-react';
import { AppBadge } from '@/shared/ui';
import { formatDate } from '@/utils/format';
import type { MatchingGroupStatus } from '../../services/companionGroupService';

interface GroupOverviewHeroProps {
  groupName: string;
  tourName?: string;
  tourImageUrl?: string;
  location?: string;
  description?: string;
  status: MatchingGroupStatus;
  targetDate: string;
  currentMembers: number;
  maxMembers: number;
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

/** Hero ảnh bìa cho trang chi tiết nhóm ghép — thay cho GroupDetailHero (flat màu, không ảnh). */
export function GroupOverviewHero({
  groupName,
  tourName,
  tourImageUrl,
  location,
  description,
  status,
  targetDate,
  currentMembers,
  maxMembers,
}: GroupOverviewHeroProps) {
  const { label, variant } = statusConfig[status];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
      <div className="relative h-56 w-full overflow-hidden bg-slate-900 sm:h-72 lg:h-80">
        {tourImageUrl ? (
          <img
            src={tourImageUrl}
            alt={tourName ?? groupName}
            className="h-full w-full object-cover opacity-90"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary to-primary/60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-5 left-5 right-5 z-10 space-y-2.5 text-white sm:bottom-6 sm:left-6 sm:right-6">
          <div className="flex flex-wrap items-center gap-2">
            <AppBadge variant={variant} className="text-xs font-bold">
              {label}
            </AppBadge>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-white">
              <Users className="h-3.5 w-3.5" />
              {currentMembers}/{maxMembers} thành viên
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight drop-shadow-md sm:text-3xl lg:text-4xl">
            {groupName}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-semibold text-white/90 sm:text-sm">
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-400" />
                {location}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-amber-400" />
              Khởi hành: {formatDate(targetDate)}
            </span>
          </div>
        </div>
      </div>

      {(description || tourName) && (
        <div className="space-y-2 p-5 sm:p-6">
          {tourName && (
            <p className="text-xs font-semibold text-primary sm:text-sm">Tour: {tourName}</p>
          )}
          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
