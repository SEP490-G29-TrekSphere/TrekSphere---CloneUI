import { Calendar, Clock, Eye, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/format';
import type { MatchingGroupItem, MatchingGroupStatus } from '../services/companionGroupService';
import type { CompanionGroup } from '../types';

export type GroupCardData = CompanionGroup | MatchingGroupItem;

function isMatchingGroupItem(group: GroupCardData): group is MatchingGroupItem {
  return 'matchingGroupId' in group;
}

interface CompanionGroupCardProps {
  group: GroupCardData;
  onJoinGroup?: (group: GroupCardData) => void;
  onViewDetail?: (group: GroupCardData) => void;
  layout?: 'list' | 'grid';
  /** Func tạo link chi tiết nhóm — dùng khi cần trỏ sang portal khác (vd trekker). */
  getDetailPath?: (groupId: string) => string;
  hasJoined?: boolean;
}

function StatusBadge({ status }: { status: MatchingGroupStatus | 'OPEN' }) {
  const config = {
    OPEN: { label: 'Đang mở', className: 'bg-emerald-500/90 text-white' },
    FULL: { label: 'Đã đủ', className: 'bg-amber-500/90 text-white' },
    CLOSED: { label: 'Đã đóng', className: 'bg-zinc-500/90 text-white' },
    HIDDEN: { label: 'Ẩn', className: 'bg-zinc-400/90 text-white' },
  };
  const { label, className } = config[status] ?? config.OPEN;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm',
        className
      )}
    >
      {label}
    </span>
  );
}

function AvatarCircle({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  return (
    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[10px] shadow-inner">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export function CompanionGroupCard({
  group,
  onJoinGroup,
  onViewDetail,
  layout = 'grid',
  getDetailPath,
  hasJoined = false,
}: CompanionGroupCardProps) {
  const user = useAppStore((state) => state.user);
  const isApiData = isMatchingGroupItem(group);

  const groupId = isApiData ? group.matchingGroupId : group.id;
  const detailPath = getDetailPath?.(groupId) ?? `/groups/${groupId}`;
  const title = isApiData ? group.groupName : group.title;
  const tourName = isApiData ? group.tourName : group.location;
  const currentMembers = isApiData ? group.currentSize : group.currentMembers;
  const maxMembers = isApiData ? group.maxSize : group.maxMembers;
  const neededMembers = isApiData
    ? Math.max(0, group.maxSize - group.currentSize)
    : group.neededMembers;
  const ownerName = isApiData ? group.ownerName : group.leader.name;
  const ownerAvatarUrl = isApiData ? group.ownerAvatarUrl : group.leader.avatarUrl;
  const departureDate = isApiData ? group.targetDate : group.departureDate;
  const deadline = isApiData ? group.matchingDeadline : undefined;
  const status = isApiData ? group.status : 'OPEN';
  const isOwner = user && (isApiData ? group.ownerId === user.id : group.leader.id === user.id);
  const coverImageUrl = isApiData ? group.tourImageUrl : group.thumbnailUrl;

  if (layout === 'list') {
    return (
      <article
        className={cn(
          'group flex flex-col gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border transition-all hover:shadow-md sm:flex-row sm:items-stretch sm:gap-5 sm:p-4'
        )}
      >
        {/* Thumbnail */}
        {coverImageUrl && (
          <Link
            to={detailPath}
            className="block h-40 w-full shrink-0 overflow-hidden rounded-xl sm:h-auto sm:w-40"
          >
            <img
              src={coverImageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        )}

        {/* Left: status + info */}
        <div className="flex flex-1 flex-col justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <StatusBadge status={status} />
            </div>
            <Link to={detailPath}>
              <h3 className="line-clamp-1 text-base font-bold text-primary transition-colors group-hover:text-primary/80 sm:text-lg">
                {title}
              </h3>
            </Link>
            {tourName && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="truncate">{tourName}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                <span>Khởi hành: {formatDate(departureDate)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-primary/70" />
                <span>
                  Cần {neededMembers} người ({currentMembers}/{maxMembers})
                </span>
              </span>
              {deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary/70" />
                  <span>Hạn: {new Date(deadline).toLocaleDateString('vi-VN')}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AvatarCircle name={ownerName} avatarUrl={ownerAvatarUrl} />
            <span className="text-xs font-semibold text-foreground truncate">{ownerName}</span>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:py-1">
          <button
            type="button"
            onClick={() => onViewDetail?.(group)}
            className="inline-flex items-center gap-1 rounded-full border border-primary px-3.5 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white"
          >
            <Eye className="h-3.5 w-3.5" />
            Chi tiết
          </button>
          {!isOwner && !hasJoined && (
            <button
              type="button"
              disabled={status !== 'OPEN'}
              onClick={() => onJoinGroup?.(group)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm',
                status === 'OPEN'
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {status === 'OPEN' ? 'Xin tham gia' : 'Đã đủ'}
            </button>
          )}
        </div>
      </article>
    );
  }

  // Grid layout
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border transition-all hover:shadow-md">
      {/* Cover image */}
      {coverImageUrl && (
        <Link to={detailPath} className="block aspect-video w-full overflow-hidden bg-muted">
          <img
            src={coverImageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}

      {/* Card header strip */}
      <div className="flex items-center justify-between gap-2 bg-muted/40 px-4 pt-4 pb-3">
        <StatusBadge status={status} />
        <div className="flex items-center gap-1.5">
          <AvatarCircle name={ownerName} avatarUrl={ownerAvatarUrl} />
          <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
            {ownerName}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to={detailPath}>
          <h3 className="line-clamp-2 text-base font-bold text-primary transition-colors group-hover:text-primary/80 min-h-[2.75rem]">
            {title}
          </h3>
        </Link>

        {tourName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{tourName}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary/70" />
            Khởi hành: {formatDate(departureDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary/70" />
            Cần {neededMembers} người (Đã có {currentMembers}/{maxMembers})
          </span>
          {deadline && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              Hạn ghép: {new Date(deadline).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={() => onViewDetail?.(group)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
        >
          <Eye className="h-3.5 w-3.5" />
          Chi tiết
        </button>

        {!isOwner && !hasJoined && (
          <button
            type="button"
            disabled={status !== 'OPEN'}
            onClick={() => onJoinGroup?.(group)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm',
              status === 'OPEN'
                ? 'bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {status === 'OPEN' ? 'Xin tham gia' : 'Đã đủ'}
          </button>
        )}
      </div>
    </article>
  );
}
