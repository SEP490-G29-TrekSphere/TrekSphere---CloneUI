import { Calendar, Eye, MapPin, Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { MatchingGroupItem } from '../services/companionGroupService';
import type { CompanionGroup } from '../types';

export type GroupCardData = CompanionGroup | MatchingGroupItem;

function isMatchingGroupItem(group: GroupCardData): group is MatchingGroupItem {
  return 'matchingGroupId' in group;
}

interface CompanionGroupCardProps {
  group: GroupCardData;
  onJoinGroup?: (group: GroupCardData) => void;
  onViewDetail?: (group: GroupCardData) => void;
}

export function CompanionGroupCard({ group, onJoinGroup, onViewDetail }: CompanionGroupCardProps) {
  const user = useAppStore((state) => state.user);
  const isApiData = isMatchingGroupItem(group);

  const title = isApiData ? group.groupName : group.title;
  const tourName = isApiData ? group.tourName : group.location;
  const currentMembers = isApiData ? group.currentSize : group.currentMembers;
  const maxMembers = isApiData ? group.maxSize : group.maxMembers;
  const neededMembers = isApiData
    ? Math.max(0, group.maxSize - group.currentSize)
    : group.neededMembers;
  const ownerName = isApiData ? group.ownerName : group.leader.name;
  const ownerAvatarUrl = isApiData ? group.ownerAvatarUrl : group.leader.avatarUrl;
  const ownerInitials = isApiData
    ? group.ownerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : group.leader.initials;
  const departureDate = isApiData ? group.targetDate : group.departureDate;
  const status = isApiData ? group.status : 'OPEN';

  const handleCardClick = () => {
    onViewDetail?.(group);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewDetail?.(group);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="group relative bg-[#FAF8F5] dark:bg-card border border-stone-200/80 dark:border-border rounded-[2rem] p-3 transition-all duration-300 hover:shadow-xl flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                status === 'OPEN'
                  ? 'bg-emerald-500/90 text-white'
                  : status === 'FULL'
                    ? 'bg-amber-500/90 text-white'
                    : 'bg-stone-500/90 text-white'
              }`}
            >
              {status === 'OPEN' ? 'Đang mở' : status === 'FULL' ? 'Đã đủ' : 'Đã đóng'}
            </span>
          </div>

          {/* Title & Favorite Heart */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              {tourName && (
                <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tourName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Meta Info List */}
          <div className="mt-4 space-y-2 text-xs sm:text-sm text-stone-600 dark:text-muted-foreground">
            {/* Departure Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-500 shrink-0" />
              <span>Khởi hành: {departureDate}</span>
            </div>

            {/* Recruitment Count */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-500 shrink-0" />
              <span>
                Cần tìm {neededMembers} người (Đã có {currentMembers}/{maxMembers})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Leader Avatar + Action Buttons */}
      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-2 border-t border-stone-200/40 dark:border-border/40 mt-2">
        {/* Leader Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-inner">
            {ownerAvatarUrl ? (
              <img src={ownerAvatarUrl} alt={ownerName} className="w-full h-full object-cover" />
            ) : (
              <span>{ownerInitials}</span>
            )}
          </div>
          <span className="text-xs font-semibold text-foreground truncate">{ownerName}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail?.(group);
            }}
            className="flex items-center gap-1 px-3 py-2 bg-stone-200/80 hover:bg-stone-300/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-foreground rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Chi tiết</span>
          </button>

          {!(user && (isApiData ? group.ownerId === user.id : group.leader.id === user.id)) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onJoinGroup?.(group);
              }}
              disabled={status !== 'OPEN'}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                status === 'OPEN'
                  ? 'bg-[#1f3933] hover:bg-[#162c28] text-white hover:scale-105 active:scale-95'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
              }`}
            >
              {status === 'OPEN' ? 'Xin tham gia' : 'Đã đủ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
