import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Bold,
  CalendarRange,
  Compass,
  Download,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Italic,
  LayoutDashboard,
  List,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings as SettingsIcon,
  Smile,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as z from 'zod';
import { PATHS } from '@/constants';
import { toast } from '@/store/useToastStore';
import type { Conversation, DetailMessage } from '../types/types';

const getTagStyles = (variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'accent') => {
  switch (variant) {
    case 'accent':
      return 'border-transparent bg-accent text-primary';
    case 'outline':
      return 'border-border bg-transparent text-muted-foreground';
    case 'destructive':
      return 'border-transparent bg-destructive text-destructive-foreground';
    case 'secondary':
      return 'border-transparent bg-secondary text-secondary-foreground';
    default:
      return 'border-border bg-muted/30 text-muted-foreground';
  }
};

// Mock conversations matching the new screenshot
const mockConversations: Conversation[] = [
  {
    id: '1',
    userName: 'Nguyễn Văn A',
    avatarUrl: '',
    lastMessage: 'Cảm ơn, mình đã nhận...',
    lastMessageTime: '2m',
    unread: false,
    tag: { text: 'TÀ NĂNG - PHAN DŨNG', variant: 'accent' },
    timestamp: '2026-07-13T10:45:00Z',
    online: true,
    startDate: 'Oct 12, 2025',
  },
  {
    id: '2',
    userName: 'Lê Thị B',
    avatarUrl: '',
    lastMessage: 'Khi nào đoàn mình xuất phát vậy ạ?',
    lastMessageTime: '1h',
    unread: true,
    tag: { text: 'CHUẨN BỊ', variant: 'accent' },
    timestamp: '2026-07-13T09:12:00Z',
    online: false,
    startDate: 'Oct 14, 2025',
  },
  {
    id: '3',
    userName: 'Trần Văn C',
    avatarUrl: '',
    lastMessage: 'Tôi muốn nâng cấp gói bảo hiểm du lịch...',
    lastMessageTime: '4h',
    unread: false,
    tag: { text: 'FEEDBACK', variant: 'outline' },
    timestamp: '2026-07-13T06:20:00Z',
    online: true,
    startDate: 'Oct 15, 2025',
  },
];

// Initial mock message history matching the second mockup
const initialMockMessages: Record<string, DetailMessage[]> = {
  '1': [
    {
      id: 'm1_1',
      sender: 'user',
      text: 'Chào bạn, mình muốn xác nhận lại lịch trình Tour Tà Năng - Phan Dũng vào cuối tuần này.',
      time: '10:30 AM',
    },
    {
      id: 'm1_2',
      sender: 'agent',
      text: 'Chào anh A! TrekSphere đã nhận được yêu cầu của anh. Em gửi anh bản lịch trình chi tiết đã được cập nhật nhé.',
      time: '10:32 AM',
    },
    {
      id: 'm1_3',
      sender: 'agent',
      time: '10:32 AM',
      isSeen: true,
      attachment: {
        name: 'Lich-trinh-Ta-Nang.pdf',
        size: '2.4 MB',
        type: 'PDF Document',
      },
    },
    {
      id: 'm1_4',
      sender: 'user',
      text: 'Cảm ơn, mình đã nhận được file. Cho mình hỏi thêm về danh sách đồ dùng cá nhân cần mang theo được không?',
      time: '10:35 AM',
    },
  ],
  '2': [
    {
      id: 'm2_1',
      sender: 'user',
      text: 'Khi nào đoàn mình xuất phát vậy ạ?',
      time: '09:12 AM',
    },
  ],
  '3': [
    {
      id: 'm3_1',
      sender: 'user',
      text: 'Tôi muốn nâng cấp gói bảo hiểm du lịch lên hạng VIP được không?',
      time: '06:20 AM',
    },
  ],
};

const chatMessageSchema = z.object({
  message: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: 'Tin nhắn không được để trống' }),
});

type ChatMessageFormValues = z.infer<typeof chatMessageSchema>;

export default function ChatList() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messagesMap, setMessagesMap] =
    useState<Record<string, DetailMessage[]>>(initialMockMessages);
  const [selectedId, setSelectedId] = useState<string | null>('1'); // Select Nguyen Van A by default
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatMessageFormValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { message: '' },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to clear the message input draft whenever the selected conversation changes.
  useEffect(() => {
    reset({ message: '' });
  }, [selectedId, reset]);

  // Find active conversation
  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const currentMessages = selectedId ? messagesMap[selectedId] || [] : [];

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Scroll when the message log changes.
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [currentMessages]);

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((c) => {
      const matchesSearch =
        c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeTab === 'unread') {
        return matchesSearch && c.unread;
      }
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    // Mark as read
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  };

  const onSubmitMessage = (data: ChatMessageFormValues) => {
    if (!selectedId) return;

    const msgText = data.message;
    const newMsgId = `m_${selectedId}_${Date.now()}`;
    const newMsg: DetailMessage = {
      id: newMsgId,
      sender: 'agent',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSeen: false,
    };

    // Immutably update messages state
    setMessagesMap((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg],
    }));

    // Update last message and timestamp in conversations list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastMessage: msgText.length > 22 ? `${msgText.substring(0, 22)}...` : msgText,
              lastMessageTime: 'Vừa xong',
              timestamp: new Date().toISOString(),
            }
          : c
      )
    );

    reset({ message: '' });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* 1. Sidebar (Left Pane) */}
      <aside className="hidden w-64 flex-col border-r border-border bg-background p-6 md:flex">
        {/* Logo Section */}
        <div className="mb-6 flex flex-col gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-primary">TrekSphere</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            TRANG NHÂN VIÊN
          </span>
        </div>

        {/* Nút hành trình mới */}
        <button
          type="button"
          onClick={() => toast.info('Tính năng Hành trình Mới đang được phát triển.')}
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Hành trình Mới
        </button>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1">
          <Link
            to={PATHS.DASHBOARD}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <LayoutDashboard className="h-5 w-5" />
            Bảng điều khiển
          </Link>
          <Link
            to={PATHS.TOURS}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <Compass className="h-5 w-5" />
            Tour du lịch
          </Link>
          <Link
            to={PATHS.DASHBOARD}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <CalendarRange className="h-5 w-5" />
            Đặt chỗ
          </Link>
          <Link
            to={PATHS.CHAT}
            className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-sm font-bold text-primary transition-all relative"
          >
            <MessageSquare className="h-5 w-5" />
            Trò chuyện
            <span className="absolute right-4 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary" />
          </Link>
          <Link
            to={PATHS.DASHBOARD}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <BarChart3 className="h-5 w-5" />
            Báo cáo
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border pt-4 space-y-1">
          <Link
            to={PATHS.SETTINGS}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <SettingsIcon className="h-5 w-5" />
            Cài đặt
          </Link>
          <Link
            to={PATHS.DASHBOARD}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <HelpCircle className="h-5 w-5" />
            Hỗ trợ
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 2. Top Header Bar */}
        <header className="flex h-16 w-full items-center justify-between border-b border-border bg-background px-6">
          {/* Search Conversation */}
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              aria-label="Tìm kiếm cuộc trò chuyện"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-full border border-border bg-muted/30 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <button
              type="button"
              aria-label="Help"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Profile Tag */}
            <div className="flex items-center gap-3 pl-2 pr-2">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground leading-tight">Minh Tran</p>
                <p className="text-[10px] text-muted-foreground font-semibold leading-none">
                  Tour Manager
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-foreground">
                MT
              </div>
            </div>
          </div>
        </header>

        {/* 3. Split View */}
        <div className="flex flex-1 overflow-hidden">
          {/* Conversation List Pane */}
          <div
            className={`w-full flex-col border-r border-border bg-background md:w-80 lg:w-96 flex-shrink-0 ${selectedId ? 'hidden md:flex' : 'flex'}`}
          >
            {/* Title */}
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold tracking-tight">Phòng Chat</h1>
            </div>

            {/* Filtering Tabs */}
            <div className="flex gap-1 bg-muted/30 p-1 mx-6 mb-4 rounded-xl border border-border/40">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  activeTab === 'unread'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Chưa đọc
              </button>
            </div>

            {/* List scroll container */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <MessageSquare className="mb-2 h-8 w-8 stroke-1" />
                  <p className="text-sm">Không tìm thấy cuộc trò chuyện nào</p>
                </div>
              ) : (
                filteredConversations.map((item) => {
                  const isSelected = item.id === selectedId;
                  const initials = item.userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2);

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleSelectConversation(item.id)}
                      className={`w-full text-left relative flex cursor-pointer gap-4 p-5 transition-all hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                        isSelected ? 'bg-muted/60' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative h-12 w-12 flex-shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden">
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.userName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                        {item.unread && (
                          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-accent border-2 border-background" />
                        )}
                        {item.id === '1' && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                        )}
                      </div>

                      {/* Info & Last message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={`text-sm truncate ${item.unread ? 'font-bold' : 'font-semibold'}`}
                          >
                            {item.userName}
                          </h3>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {item.lastMessageTime}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate ${item.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                        >
                          {item.lastMessage}
                        </p>
                        {item.tag && (
                          <div
                            className={`mt-2 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${getTagStyles(item.tag.variant)}`}
                          >
                            {item.tag.text}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Detail Pane */}
          <div className={`flex-1 flex-col bg-muted/10 ${selectedId ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation ? (
              // Active Conversation Screen
              <div className="flex h-full flex-col bg-background">
                {/* Active Chat Header */}
                <div className="flex min-h-20 h-auto py-3 flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-border px-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="md:hidden flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted text-muted-foreground mr-1"
                      aria-label="Back to conversations list"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="relative h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden">
                      {selectedConversation.avatarUrl ? (
                        <img
                          src={selectedConversation.avatarUrl}
                          alt={selectedConversation.userName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        selectedConversation.userName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                      )}
                      {selectedConversation.online && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold leading-tight">
                        {selectedConversation.userName}
                      </h2>
                      {selectedConversation.online ? (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Trực tuyến
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                          Ngoại tuyến
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Compass Tag */}
                    {selectedConversation.tag?.text && (
                      <div
                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${getTagStyles(selectedConversation.tag.variant)}`}
                      >
                        <Compass className="h-4 w-4" />
                        {selectedConversation.tag.text}
                      </div>
                    )}
                    {/* Primary Button */}
                    <button
                      type="button"
                      onClick={() => alert('Xem chi tiết đặt chỗ')}
                      className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                    >
                      Xem chi tiết đặt chỗ
                    </button>
                    {/* More button */}
                    <button
                      type="button"
                      aria-label="More options"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages List Area */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5"
                >
                  {/* Started conversation divider */}
                  {selectedConversation.startDate &&
                    (() => {
                      const parsedDate = new Date(selectedConversation.startDate);
                      const isValidDate = !Number.isNaN(parsedDate.getTime());
                      const displayDate = isValidDate
                        ? new Intl.DateTimeFormat('vi-VN').format(parsedDate)
                        : selectedConversation.startDate;
                      return (
                        <div className="flex items-center justify-center">
                          <span className="rounded-full bg-muted border border-border/40 px-4 py-1 text-[11px] font-bold text-muted-foreground">
                            Cuộc hội thoại bắt đầu • {displayDate}
                          </span>
                        </div>
                      );
                    })()}

                  {currentMessages.map((msg) => {
                    const isAgent = msg.sender === 'agent';

                    if (msg.attachment) {
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 max-w-[70%] ${isAgent ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                          {/* Avatar for user */}
                          {!isAgent && selectedConversation && (
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 self-end overflow-hidden">
                              {selectedConversation.avatarUrl ? (
                                <img
                                  src={selectedConversation.avatarUrl}
                                  alt={selectedConversation.userName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                selectedConversation.userName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .substring(0, 2)
                              )}
                            </div>
                          )}
                          <div className="flex flex-col">
                            {/* Attachment Card */}
                            <div className="flex w-full max-w-72 items-center gap-4 rounded-xl border border-border bg-background p-4 shadow-sm">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 flex-shrink-0">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-xs font-bold text-foreground">
                                  {msg.attachment.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-semibold">
                                  {msg.attachment.size} • {msg.attachment.type}
                                </p>
                              </div>
                              <button
                                type="button"
                                title="Tải về"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground flex-shrink-0"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                            {/* Time & SEEN status */}
                            <div
                              className={`mt-1 flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold ${isAgent ? 'justify-end' : ''}`}
                            >
                              <span>
                                {msg.time} {isAgent && msg.isSeen ? '• SEEN' : ''}
                              </span>
                              {isAgent && (
                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[8px] text-primary">
                                  M
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[70%] ${isAgent ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        {/* Avatar for user */}
                        {!isAgent && (
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 self-end overflow-hidden">
                            {selectedConversation.avatarUrl ? (
                              <img
                                src={selectedConversation.avatarUrl}
                                alt={selectedConversation.userName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              selectedConversation.userName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)
                            )}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div
                            className={`rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                              isAgent
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-muted text-foreground rounded-tl-none border border-border/40'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span
                            className={`text-[10px] text-muted-foreground mt-1 px-1 ${isAgent ? 'text-right' : ''}`}
                          >
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 4. Bottom Rich Editor Composer */}
                <div className="p-6 bg-background border-t border-border">
                  <form
                    onSubmit={handleSubmit(onSubmitMessage)}
                    className="flex flex-col rounded-2xl border border-border bg-muted/10 p-3"
                  >
                    {/* Editor Toolbar */}
                    <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <button
                          type="button"
                          title="In đậm"
                          disabled
                          className="p-1.5 rounded-md opacity-40 cursor-not-allowed"
                        >
                          <Bold className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="In nghiêng"
                          disabled
                          className="p-1.5 rounded-md opacity-40 cursor-not-allowed"
                        >
                          <Italic className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Danh sách"
                          disabled
                          className="p-1.5 rounded-md opacity-40 cursor-not-allowed"
                        >
                          <List className="h-4 w-4" />
                        </button>
                        <span className="mx-2 h-4 w-px bg-border" />
                        <button
                          type="button"
                          title="Chèn ảnh"
                          disabled
                          className="p-1.5 rounded-md opacity-40 cursor-not-allowed"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Đính kèm tệp"
                          disabled
                          className="p-1.5 rounded-md opacity-40 cursor-not-allowed"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Biểu cảm"
                          disabled
                          className="p-1.5 rounded-md opacity-40 cursor-not-allowed"
                        >
                          <Smile className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Text Field & Action Send */}
                    <div className="flex flex-col w-full gap-1">
                      <div className="flex items-end gap-3">
                        <textarea
                          rows={2}
                          placeholder="Nhập tin nhắn của bạn tại đây..."
                          {...register('message')}
                          aria-invalid={errors.message ? 'true' : 'false'}
                          aria-describedby={errors.message ? 'chat-message-error' : undefined}
                          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1"
                        />
                        <button
                          type="submit"
                          aria-label="Send"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                      {errors.message?.message && (
                        <p
                          id="chat-message-error"
                          className="text-xs text-destructive mt-1 font-medium"
                        >
                          {errors.message.message}
                        </p>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <MessageSquare className="mb-4 h-12 w-12 stroke-1" />
                <h3 className="text-lg font-bold">Chưa chọn cuộc trò chuyện nào</h3>
                <p className="text-sm">
                  Chọn một phòng chat ở thanh bên trái để bắt đầu cuộc trò chuyện.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
