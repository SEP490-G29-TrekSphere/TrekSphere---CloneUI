/** "Xm trước" / "Xh trước" — dùng cho timestamp SOS, không cần chính xác tới giây. */
export function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}

/** 8 ký tự đầu của id (bỏ dấu gạch ngang), viết hoa — cùng quy ước với `formatShortId` ở vendor-sessions. */
export function formatSosCode(sosAlertId: string): string {
  return `SOS-${sosAlertId.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

const SENDER_ROLE_LABEL: Record<string, string> = {
  COORDINATOR: 'Điều phối viên',
  TREKKER: 'Khách du lịch',
};

export function formatSenderRole(role: string): string {
  return SENDER_ROLE_LABEL[role.toUpperCase()] ?? role;
}
