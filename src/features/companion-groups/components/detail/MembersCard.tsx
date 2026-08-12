import { MessageCircle, MoreHorizontal, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AppBadge } from '@/shared/ui';
import type { MatchingMemberItem } from '../../services/companionGroupService';
import { MemberAvatar } from './MemberAvatar';

interface MembersCardProps {
  members: MatchingMemberItem[];
  maxSize: number;
  ownerName: string;
  currentUserId?: string;
  role?: string;
  hasConversation?: boolean;
  onDirectChat?: (userId: string, userName: string, userAvatar?: string) => void;
  onAddMemberToChat?: (userId: string, userName: string) => void;
}

export function MembersCard({
  members,
  maxSize,
  ownerName,
  currentUserId,
  role,
  hasConversation,
  onDirectChat,
  onAddMemberToChat,
}: MembersCardProps) {
  const acceptedMembers = members.filter((m) => m.status === 'ACCEPTED');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    if (activeDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdownId]);

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

              {/* Action: Direct Chat / Add to Group (hide for self) */}
              {currentUserId && String(currentUserId) !== String(member.userId) && (
                <div className="ml-auto relative">
                  {role === 'leader' ? (
                    <div ref={activeDropdownId === member.userId ? dropdownRef : null}>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDropdownId(
                            activeDropdownId === member.userId ? null : member.userId
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 text-foreground hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        title="Tùy chọn"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {activeDropdownId === member.userId && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1">
                          {hasConversation && !member.isInConversation && (
                            <button
                              type="button"
                              onClick={() => {
                                onAddMemberToChat?.(member.userId, member.fullName);
                                setActiveDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors text-left"
                            >
                              <UserPlus className="h-4 w-4 text-primary" />
                              Thêm vào nhóm chat
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              onDirectChat?.(member.userId, member.fullName, member.avatarUrl);
                              setActiveDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors text-left"
                          >
                            <MessageCircle className="h-4 w-4 text-primary" />
                            Nhắn tin riêng
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onDirectChat?.(member.userId, member.fullName, member.avatarUrl)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      title={`Nhắn tin cho ${member.fullName}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
