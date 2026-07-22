import { Calendar, Heart, Users } from 'lucide-react';
import { useState } from 'react';
import type { CompanionGroup } from '../types';

interface CompanionGroupCardProps {
  group: CompanionGroup;
  onJoinGroup?: (group: CompanionGroup) => void;
}

export function CompanionGroupCard({ group, onJoinGroup }: CompanionGroupCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(group.isBookmarked ?? false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
  };

  return (
    <div className="group relative bg-[#FAF8F5] dark:bg-card border border-stone-200/80 dark:border-border rounded-[2rem] p-3 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
      <div>
        {/* Thumbnail Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem]">
          <img
            src={group.thumbnailUrl}
            alt={group.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Difficulty Badge (Top Right) matching mockup styling */}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-card/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-foreground shadow-sm">
            Độ khó: {group.difficulty}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Title & Favorite Heart */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-lg sm:text-xl text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {group.title}
            </h3>
            <button
              type="button"
              onClick={toggleBookmark}
              aria-label="Lưu chuyến đi yêu thích"
              className="text-stone-400 hover:text-red-500 transition-colors p-1 shrink-0 cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 ${
                  isBookmarked ? 'fill-red-500 text-red-500' : 'text-stone-400 hover:text-red-500'
                }`}
              />
            </button>
          </div>

          {/* Meta Info List */}
          <div className="mt-4 space-y-2 text-xs sm:text-sm text-stone-600 dark:text-muted-foreground">
            {/* Departure Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-500 shrink-0" />
              <span>{group.departureDate}</span>
            </div>

            {/* Recruitment Count */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-500 shrink-0" />
              <span>
                Cần tìm {group.neededMembers} người (Đã có {group.currentMembers}/{group.maxMembers}
                )
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Leader Avatar + Action Button */}
      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-3 border-t border-stone-200/40 dark:border-border/40 mt-2">
        {/* Leader Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-inner">
            {group.leader.avatarUrl ? (
              <img
                src={group.leader.avatarUrl}
                alt={group.leader.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{group.leader.initials}</span>
            )}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
            {group.leader.name}
          </span>
        </div>

        {/* Action Button: Xin tham gia */}
        <button
          type="button"
          onClick={() => onJoinGroup?.(group)}
          className="px-5 py-2.5 bg-[#1f3933] hover:bg-[#162c28] text-white rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md shrink-0 cursor-pointer"
        >
          Xin tham gia
        </button>
      </div>
    </div>
  );
}
