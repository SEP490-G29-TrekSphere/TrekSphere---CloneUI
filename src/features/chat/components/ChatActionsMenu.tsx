import { MoreVertical, Trash2, UserMinus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { chatService } from '../services/chatService';
import type { Conversation, ConversationMember } from '../types/types';

interface ChatActionsMenuProps {
  conversation: Conversation;
  onDeleteConversation: (conversationId: string) => void;
  onRemoveMember: (conversationId: string, memberId: string) => void;
}

export function ChatActionsMenu({
  conversation,
  onDeleteConversation,
  onRemoveMember,
}: ChatActionsMenuProps) {
  const { user } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [members, setMembers] = useState<ConversationMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState<ConversationMember | null>(null);

  const canDelete = conversation.isGroupLeader;
  const canManageMembers = conversation.isGroupLeader;

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const data = await chatService.getConversationMembers(conversation.id);
        setMembers(data);
      } catch (error) {
        console.error('Failed to fetch members', error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    if (isMembersDialogOpen) {
      fetchMembers();
    }
  }, [isMembersDialogOpen, conversation.id]);

  if (!canDelete && !canManageMembers) {
    return null;
  }

  return (
    <>
      <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <PopoverTrigger render={<Button variant="ghost" size="icon" />}>
          <MoreVertical className="h-5 w-5" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-1">
          <div className="flex flex-col gap-1">
            {canManageMembers && (
              <Button
                variant="ghost"
                className="justify-start px-2 py-1.5 h-auto text-sm"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsMembersDialogOpen(true);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Quản lý thành viên
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                className="justify-start px-2 py-1.5 h-auto text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa cuộc hội thoại
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa cuộc hội thoại</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa cuộc hội thoại này? Hành động này không thể hoàn tác.
              {(conversation.tag?.text === 'GROUP' ||
                conversation.virtualData?.type === 'GROUP') && (
                <span className="block mt-2 font-semibold text-destructive">
                  Lưu ý: Xóa nhóm chat sẽ không giải tán Matching Group tương ứng.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDeleteConversation(conversation.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Thành viên nhóm chat</DialogTitle>
            <DialogDescription>Quản lý các thành viên trong cuộc hội thoại.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {isLoadingMembers ? (
              <div className="flex justify-center py-8">
                <AppSpinner />
              </div>
            ) : members.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Không có thành viên nào.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {member.avatarUrl ? (
                          <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                        ) : null}
                        <AvatarFallback>
                          {member.fullName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm leading-none">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
                      </div>
                    </div>
                    {member.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setMemberToRemove(member)}
                        title="Xóa khỏi nhóm chat"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa thành viên</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa {memberToRemove?.fullName} khỏi nhóm chat này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (memberToRemove) {
                  onRemoveMember(conversation.id, memberToRemove.id);
                  setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
                  setMemberToRemove(null);
                }
              }}
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
