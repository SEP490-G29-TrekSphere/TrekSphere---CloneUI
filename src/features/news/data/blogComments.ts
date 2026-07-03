import type { BlogComment } from '../types';

export const DEFAULT_COMMENTS: BlogComment[] = [
  {
    id: 'c1',
    authorName: 'Phạm Quốc Bảo',
    authorAvatar:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop&crop=face',
    content:
      'Bài viết rất chi tiết! Mình đã đi Tà Năng tháng 3 năm ngoái và thấy thông tin khá chính xác. Riêng phần đồ ăn thì mang theo mỳ gói và xúc xích là hợp lý nhất.',
    postedAgoLabel: '2 giờ trước',
  },
  {
    id: 'c2',
    authorName: 'Hoàng Thị Mai',
    authorAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    content:
      'Cho mình hỏi thêm: nhóm 6 người có cần thuê porter không? Hoặc tự mang đồ được không? Cảm ơn admin!',
    postedAgoLabel: '5 giờ trước',
  },
  {
    id: 'c3',
    authorName: 'Đặng Văn Nam',
    authorAvatar:
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop&crop=face',
    content:
      'Mình thấy lộ trình này hơi nặng cho người mới. Có bài nào dành cho người mới hoàn toàn không ad?',
    postedAgoLabel: '1 ngày trước',
  },
  {
    id: 'c4',
    authorName: 'Ngô Thị Hồng',
    authorAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
    content:
      'Mình dự định đi vào tháng 12 này, đã chuẩn bị theo list trong bài. Hy vọng sẽ có được trải nghiệm tuyệt vời.',
    postedAgoLabel: '2 ngày trước',
  },
  {
    id: 'c5',
    authorName: 'Lê Hoàng Phúc',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f6d?w=80&h=80&fit=crop&crop=face',
    content: 'Bài viết rất hữu ích. Mình ghim lại để tham khảo dần. Cảm ơn tác giả!',
    postedAgoLabel: '3 ngày trước',
  },
];
