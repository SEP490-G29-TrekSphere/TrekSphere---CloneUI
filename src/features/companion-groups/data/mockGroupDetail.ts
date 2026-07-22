import type { CompanionGroup, GroupMemberDetail, JoinRequest } from '../types';

export interface GroupDetailFull extends CompanionGroup {
  joinRequests: JoinRequest[];
  members: GroupMemberDetail[];
}

export const MOCK_GROUP_DETAIL: GroupDetailFull = {
  id: 'grp-1',
  title: 'Nhóm: Chinh phục Tà Năng - Phan Dũng',
  thumbnailUrl:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
  difficulty: 'Vừa',
  departureDate: '15/10/2024',
  location: 'Lâm Đồng - Bình Thuận',
  currentMembers: 4,
  maxMembers: 8,
  neededMembers: 3,
  leader: {
    id: 'usr-1',
    name: 'Phạm Hoàng Nam',
    initials: 'HN',
    role: 'Trưởng nhóm (Leader)',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  description:
    'Cần tìm thêm 3 bạn đồng hành chinh phục cung đường đồi cỏ Tà Năng - Phan Dũng tuyệt đẹp.',
  joinRequests: [
    {
      id: 'req-1',
      userName: 'Lê Minh Tuấn',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      initials: 'LT',
      experienceInfo: '2 năm kinh nghiệm • Đã đi 5 cung',
      message:
        '“Chào anh, em rất muốn tham gia chuyến này. Em đã chuẩn bị đầy đủ dụng cụ và có sức khỏe tốt. Rất mong được đồng hành cùng nhóm!”',
    },
    {
      id: 'req-2',
      userName: 'Nguyễn Thị Hà',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      initials: 'NH',
      experienceInfo: 'Thành viên mới • Đam mê khám phá',
      message:
        '“Mình là người mới nhưng rất thích cung Tà Năng. Mình đã tham gia khóa học kỹ năng cơ bản của TrekMate. Mong nhóm chấp nhận ạ!”',
    },
    {
      id: 'req-3',
      userName: 'Trần Bảo Long',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      initials: 'TL',
      experienceInfo: '10 năm kinh nghiệm • Chuyên gia',
      message:
        '“Ghé qua thấy nhóm trek cung này vào đúng dịp rảnh. Cho mình slot đi cùng cho vui nhé leader.”',
    },
  ],
  members: [
    {
      id: 'usr-1',
      name: 'Phạm Hoàng Nam',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      initials: 'HN',
      role: 'Leader',
      roleTitle: 'Trưởng nhóm (Leader)',
      isLeader: true,
    },
    {
      id: 'usr-2',
      name: 'Vũ Lan Hương',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      initials: 'VH',
      role: 'Chốt đoàn',
      roleTitle: 'Chốt đoàn',
    },
    {
      id: 'usr-3',
      name: 'Đỗ Xuân Bách',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      initials: 'ĐB',
      role: 'Thành viên',
      roleTitle: 'Thành viên',
    },
    {
      id: 'usr-4',
      name: 'Hoàng Diệu Linh',
      avatarUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      initials: 'HL',
      role: 'Thành viên',
      roleTitle: 'Thành viên',
    },
  ],
};
