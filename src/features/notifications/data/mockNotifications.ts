import type { Notification } from '../types/notification';

const now = new Date();
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000);
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Chuyến đi Đà Lạt đã được xác nhận thành công',
    body: 'Chuyến đi Đà Lạt 3 ngày 2 đêm của bạn đã được xác nhận. Hướng dẫn viên sẽ liên hệ trong 24 giờ tới.',
    timestamp: minutesAgo(15),
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Chuyến đi Phú Quốc sắp khởi hành',
    body: 'Chuyến đi Phú Quốc của bạn sẽ khởi hành vào ngày mai lúc 7:00. Đừng quên chuẩn bị đầy đủ!',
    timestamp: minutesAgo(45),
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Cập nhật chính sách bảo mật mới',
    body: 'Chúng tôi đã cập nhật chính sách bảo mật. Vui lòng dành chút thời gian để xem lại các thay đổi.',
    timestamp: hoursAgo(2),
    read: false,
  },
  {
    id: '4',
    type: 'error',
    title: 'Thanh toán không thành công',
    body: 'Thanh toán chuyến đi Hội An không thể xử lý. Vui lòng kiểm tra lại thông tin thẻ và thử lại.',
    timestamp: hoursAgo(5),
    read: false,
  },
  {
    id: '5',
    type: 'community',
    title: 'Bài viết của bạn đã được nhiều người quan tâm',
    body: 'Bài viết "Kinh nghiệm leo núi Fansipan mùa xuân" đã nhận được 127 lượt thích và 23 bình luận.',
    timestamp: hoursAgo(8),
    read: true,
  },
  {
    id: '6',
    type: 'promo',
    title: 'Giảm 20% cho chuyến đi mùa hè',
    body: 'Đón mùa hè rực rỡ với ưu đãi giảm 20% cho tất cả chuyến đi trong tháng 7. Áp dụng khi đặt từ 3 người trở lên!',
    timestamp: hoursAgo(12),
    read: true,
  },
  {
    id: '7',
    type: 'success',
    title: 'Đánh giá chuyến đi Sapa đã được ghi nhận',
    body: 'Cảm ơn bạn đã chia sẻ trải nghiệm! Đánh giá 5 sao của bạn sẽ giúp người khác có lựa chọn tốt hơn.',
    timestamp: daysAgo(1),
    read: true,
  },
  {
    id: '8',
    type: 'info',
    title: 'Thanh toán thành công',
    body: 'Thanh toán chuyến đi Hội An đã được xử lý thành công. Mã giao dịch: TS-2024-123456.',
    timestamp: daysAgo(2),
    read: true,
  },
  {
    id: '9',
    type: 'promo',
    title: 'Quà tặng VIP dành cho bạn',
    body: 'Chúc mừng bạn đã trở thành thành viên VIP! Nhận ngay ưu đãi độc quyền và phòng chờ sân bay miễn phí.',
    timestamp: daysAgo(3),
    read: true,
  },
  {
    id: '10',
    type: 'community',
    title: 'Minh Hoàng đã thích bài viết của bạn',
    body: 'Minh Hoàng vừa thích bài viết "Kinh nghiệm leo núi Fansipan mùa xuân" của bạn.',
    timestamp: daysAgo(4),
    read: true,
  },
];

export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read).length;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return `${Math.floor(diffDays / 7)} tuần trước`;
}
