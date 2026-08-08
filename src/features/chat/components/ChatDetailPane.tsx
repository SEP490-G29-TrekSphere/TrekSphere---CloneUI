import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Compass, Download, FileText, MessageSquare, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Button } from '@/components/ui/button';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { Message, MessageAvatar, MessageContent, MessageFooter } from '@/components/ui/message';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from '@/components/ui/message-scroller';
import type { Conversation, DetailMessage } from '@/features/chat/types/types';
import { AppSpinner } from '@/shared/ui';

const chatMessageSchema = z.object({
  message: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: 'Tin nhắn không được để trống' }),
});

type ChatMessageFormValues = z.infer<typeof chatMessageSchema>;

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function getBadgeVariant(
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'accent'
): React.ComponentProps<typeof Badge>['variant'] {
  switch (variant) {
    case 'accent':
      return 'default';
    case 'outline':
      return 'outline';
    case 'destructive':
      return 'destructive';
    case 'secondary':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function ChatAutoScroller({ dependencies }: { dependencies: unknown[] }) {
  const { scrollToBottom } = useMessageScroller();

  useEffect(
    () => {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 10);
      return () => clearTimeout(timeoutId);
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: Custom dependency array passed as prop
    dependencies
  );

  return null;
}

interface ChatDetailPaneProps {
  selectedConversation: Conversation | undefined;
  currentMessages: DetailMessage[];
  isLoadingMessages: boolean;
  isSending: boolean;
  onSendMessage: (message: string) => void;
  onBack: () => void;
}

export function ChatDetailPane({
  selectedConversation,
  currentMessages,
  isLoadingMessages,
  isSending,
  onSendMessage,
  onBack,
}: ChatDetailPaneProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatMessageFormValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { message: '' },
  });

  const [unreadMarkerId, setUnreadMarkerId] = useState<string | null>(null);
  const currentConvIdRef = useRef<string | undefined>(undefined);

  // Clear draft on conversation change
  useEffect(() => {
    reset({ message: '' });
    if (selectedConversation?.id !== currentConvIdRef.current) {
      setUnreadMarkerId(null);
    }
  }, [selectedConversation?.id, reset]);

  useEffect(() => {
    if (
      selectedConversation?.id &&
      selectedConversation.id !== currentConvIdRef.current &&
      currentMessages.length > 0
    ) {
      const unreadCount = selectedConversation.unreadCount || 0;
      if (unreadCount > 0) {
        const incoming = currentMessages.filter((m) => m.sender === 'user');
        const firstUnread = incoming[incoming.length - unreadCount];
        setUnreadMarkerId(firstUnread?.id || null);
      }
      currentConvIdRef.current = selectedConversation.id;
    }
  }, [selectedConversation?.id, selectedConversation?.unreadCount, currentMessages]);

  const onSubmit = (data: ChatMessageFormValues) => {
    onSendMessage(data.message);
    reset({ message: '' });
  };

  return (
    <div
      className={`flex-1 flex-col bg-muted/10 ${selectedConversation ? 'flex' : 'hidden md:flex'}`}
    >
      {selectedConversation ? (
        <div className="flex h-full flex-col bg-background">
          {/* Chat Header */}
          <div className="flex min-h-20 h-auto py-3 flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={onBack}
                aria-label="Quay lại danh sách"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Avatar size="lg" className="bg-primary/10 text-primary font-bold">
                  {selectedConversation.avatarUrl ? (
                    <AvatarImage
                      src={selectedConversation.avatarUrl}
                      alt={selectedConversation.userName}
                    />
                  ) : null}
                  <AvatarFallback>{getInitials(selectedConversation.userName)}</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight">{selectedConversation.userName}</h2>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {selectedConversation.tag?.text && (
                <Badge
                  variant={getBadgeVariant(selectedConversation.tag.variant)}
                  className="gap-1.5 rounded-full px-3.5 py-1.5 text-xs"
                >
                  <Compass className="h-4 w-4" />
                  {selectedConversation.tag.text}
                </Badge>
              )}
            </div>
          </div>

          {/* Messages */}
          <MessageScrollerProvider autoScroll>
            <ChatAutoScroller
              dependencies={[currentMessages.length, selectedConversation.id, isLoadingMessages]}
            />
            <MessageScroller className="flex-1 bg-muted/5">
              <MessageScrollerViewport className="px-6 py-6">
                <MessageScrollerContent>
                  {isLoadingMessages ? (
                    <div className="flex h-32 items-center justify-center">
                      <AppSpinner size="lg" className="text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* Date divider */}
                      {selectedConversation.startDate && (
                        <MessageScrollerItem messageId="start-marker">
                          <Marker variant="separator">
                            <MarkerContent className="text-[11px] font-bold">
                              Cuộc hội thoại bắt đầu • {(() => {
                                const d = new Date(selectedConversation.startDate!);
                                return Number.isNaN(d.getTime())
                                  ? selectedConversation.startDate
                                  : new Intl.DateTimeFormat('vi-VN').format(d);
                              })()}
                            </MarkerContent>
                          </Marker>
                        </MessageScrollerItem>
                      )}

                      {/* Messages */}
                      {currentMessages.map((msg) => {
                        const isAgent = msg.sender === 'agent';
                        const align = isAgent ? 'end' : 'start';
                        const isFirstUnread = msg.id === unreadMarkerId;

                        return (
                          <React.Fragment key={msg.id}>
                            {isFirstUnread && (
                              <MessageScrollerItem messageId={`unread-marker-${msg.id}`}>
                                <Marker variant="separator">
                                  <MarkerContent className="text-[11px] font-bold text-destructive">
                                    Tin nhắn chưa đọc
                                  </MarkerContent>
                                </Marker>
                              </MessageScrollerItem>
                            )}
                            <MessageScrollerItem messageId={msg.id} scrollAnchor={!isAgent}>
                              <Message align={align}>
                                {/* Avatar (user/customer side only) */}
                                {!isAgent && (
                                  <MessageAvatar>
                                    <Avatar className="bg-primary/10 text-primary font-bold text-xs">
                                      {selectedConversation.avatarUrl ? (
                                        <AvatarImage
                                          src={selectedConversation.avatarUrl}
                                          alt={selectedConversation.userName}
                                        />
                                      ) : null}
                                      <AvatarFallback>
                                        {getInitials(selectedConversation.userName)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </MessageAvatar>
                                )}

                                <MessageContent>
                                  {/* Attachment message */}
                                  {msg.attachment ? (
                                    <Attachment state="done">
                                      <AttachmentMedia
                                        variant="icon"
                                        className="bg-red-100 text-red-600"
                                      >
                                        <FileText />
                                      </AttachmentMedia>
                                      <AttachmentContent>
                                        <AttachmentTitle>{msg.attachment.name}</AttachmentTitle>
                                        <AttachmentDescription>
                                          {msg.attachment.size} · {msg.attachment.type}
                                        </AttachmentDescription>
                                      </AttachmentContent>
                                      <AttachmentActions>
                                        <AttachmentAction aria-label="Tải về">
                                          <Download />
                                        </AttachmentAction>
                                      </AttachmentActions>
                                    </Attachment>
                                  ) : (
                                    /* Text message bubble */
                                    <Bubble variant={isAgent ? 'default' : 'muted'} align={align}>
                                      <BubbleContent>{msg.text}</BubbleContent>
                                    </Bubble>
                                  )}

                                  {/* Timestamp footer */}
                                  <MessageFooter>
                                    {msg.time}
                                    {isAgent && msg.isSeen && ' · SEEN'}
                                  </MessageFooter>
                                </MessageContent>
                              </Message>
                            </MessageScrollerItem>
                          </React.Fragment>
                        );
                      })}
                    </>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>

          {/* Composer */}
          <div className="p-6 bg-background border-t border-border">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col rounded-2xl border border-border bg-muted/10 p-3"
            >
              <div className="flex items-end gap-3">
                <textarea
                  rows={2}
                  placeholder={isSending ? 'Đang gửi...' : 'Nhập tin nhắn của bạn tại đây...'}
                  {...register('message')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isSending) {
                        handleSubmit(onSubmit)();
                      }
                    }
                  }}
                  disabled={isSending}
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby={errors.message ? 'chat-message-error' : undefined}
                  className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Gửi"
                  disabled={isSending}
                  className="rounded-full flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {errors.message?.message && (
                <p id="chat-message-error" className="text-xs text-destructive mt-1 font-medium">
                  {errors.message.message}
                </p>
              )}
            </form>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <MessageSquare className="mb-4 h-12 w-12 stroke-1" />
          <h3 className="text-lg font-bold">Chưa chọn cuộc trò chuyện nào</h3>
          <p className="text-sm">
            Chọn một phòng chat ở thanh bên trái để bắt đầu cuộc trò chuyện.
          </p>
        </div>
      )}
    </div>
  );
}
