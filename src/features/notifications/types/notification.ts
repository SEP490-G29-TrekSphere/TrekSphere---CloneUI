export type NotificationType = 'success' | 'warning' | 'info' | 'error' | 'community' | 'promo';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  timestamp: Date;
  read: boolean;
}
