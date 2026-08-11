import { MessageCircle } from 'lucide-react';
import { AppBadge } from '@/shared/ui';
import type { MatchingMemberItem } from '../../services/companionGroupService';
import { MemberAvatar } from './MemberAvatar';

interface MembersCardProps {
  members: MatchingMemberItem[];
  maxSize: number;
  ownerName: string;
  currentUserId?: string;
  onDirectChat?: (userId: string, userName: string, userAvatar?: string) => void;
}

export function MembersCard({
  members,
  maxSize,
  ownerName,
  currentUserId,
  onDirectChat,
}: MembersCardProps) {
  const acceptedMembers = members.filter((m) => m.status === 'ACCEPTED');

  return (
    <div className="rounded-2xl bg-card p-6 md:p-8 border border-border space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Thành viên nhóm</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {acceptedMembers.length}/{maxSize} người đồng hành đã tham gia
          </p>
        </div>
        <AppBadge variant="secondary" className="text-xs font-bold">
          Trưởng nhóm: {ownerName}
        </AppBadge>
      </div>

      {/* Members Avatar Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {acceptedMembers.map((member) => {
          const isLeader = member.role === 'OWNER';

          return (
            <div
              key={member.matchingMemberId}
              className="flex items-center gap-3 rounded-xl bg-background p-3.5 shadow-sm border border-border"
            >
              <MemberAvatar
                fullName={member.fullName}
                avatarUrl={member.avatarUrl}
                isLeader={isLeader}
              />
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-foreground truncate">{member.fullName}</h3>
                <p
                  className={`text-[10px] tracking-wider font-bold uppercase ${
                    isLeader ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {isLeader ? 'Trưởng nhóm' : 'Thành viên'}
                </p>
              </div>

              {/* Action: Direct Chat (hide for self) */}
              {currentUserId && String(currentUserId) !== String(member.userId) && (
                <button
                  type="button"
                  onClick={() => onDirectChat?.(member.userId, member.fullName, member.avatarUrl)}
                  className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  title={`Nhắn tin cho ${member.fullName}`}
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
