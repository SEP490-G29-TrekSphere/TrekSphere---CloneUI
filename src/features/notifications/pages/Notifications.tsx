import { AlertTriangle, Bell, CheckCircle, Heart, Info, Megaphone, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime, getUnreadCount, mockNotifications } from '../data/mockNotifications';
import NotificationsLayout from '../layout/NotificationsLayout';
import type { Notification, NotificationType } from '../types/notification';

// ── Type config ──────────────────────────────────────────────────────────────
const filterTabs: { key: 'all' | NotificationType; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'success', label: 'Tour' },
  { key: 'info', label: 'Hệ thống' },
  { key: 'promo', label: 'Khuyến mãi' },
];
// NOTE: only 4 tabs in the design — Tour=success, Hệ thống=info, Khuyến mãi=promo
// community/error/warning mapped internally but not shown as separate tabs

const typeConfig: Record<NotificationType, { icon: typeof Bell; bg: string; text: string }> = {
  success: { icon: CheckCircle, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-100', text: 'text-amber-600' },
  info: { icon: Info, bg: 'bg-blue-100', text: 'text-blue-600' },
  error: { icon: X, bg: 'bg-red-100', text: 'text-red-500' },
  community: { icon: Heart, bg: 'bg-purple-100', text: 'text-purple-600' },
  promo: { icon: Megaphone, bg: 'bg-orange-100', text: 'text-orange-600' },
};

// ── Notification Item ─────────────────────────────────────────────────────────
interface NotificationItemProps {
  notification: Notification;
  onToggleRead: (id: string) => void;
}

const NotificationItem = memo(function NotificationItem({
  notification,
  onToggleRead,
}: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onToggleRead(notification.id)}
      className={cn(
        'group relative flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer text-left w-full border-none outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
        'border-b border-border last:border-b-0',
        notification.read
          ? 'bg-white hover:bg-muted/30'
          : 'bg-amber-50/70 dark:bg-amber-950/10 hover:bg-amber-50/90'
      )}
    >
      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute right-4 top-5 size-2 rounded-full bg-primary" />
      )}

      {/* Icon circle */}
      <div
        className={cn(
          'relative flex size-10 shrink-0 items-center justify-center rounded-full',
          config.bg
        )}
      >
        <Icon className={cn('size-5', config.text)} strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <p
          className={cn(
            'text-sm leading-snug',
            notification.read
              ? 'text-muted-foreground font-normal'
              : 'font-semibold text-foreground'
          )}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
            {notification.body}
          </p>
        )}
      </div>

      {/* Timestamp & Action */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(notification.timestamp)}
        </span>
        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
          {notification.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
        </span>
      </div>
    </button>
  );
});

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');

  const unreadCount = useMemo(() => getUnreadCount(notifications), [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  return (
    <NotificationsLayout>
      <div className="mx-auto max-w-[800px] px-4 py-10 animate-fade-in">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Thông báo</h1>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          <p className="text-base text-muted-foreground">
            Cập nhật những hoạt động mới nhất từ chuyến đi của bạn.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                type="button"
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-full transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-input bg-background text-muted-foreground hover:text-foreground hover:border-foreground/20'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notification Container */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {/* Items */}
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Bell className="size-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Không có thông báo nào</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {activeFilter === 'all'
                    ? 'Bạn đã đọc tất cả thông báo'
                    : `Không có thông báo nào trong danh mục này`}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onToggleRead={handleToggleRead}
              />
            ))
          )}
        </div>
      </div>
    </NotificationsLayout>
  );
}
