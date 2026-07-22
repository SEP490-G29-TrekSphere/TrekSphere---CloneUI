import type { CompanionGroup } from '../types';

export const MOCK_COMPANION_GROUPS: CompanionGroup[] = [
  {
    id: 'grp-1',
    title: 'Trekking Tà Năng - Phan Dũng',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Vừa',
    departureDate: '15/10/2024',
    location: 'Lâm Đồng - Bình Thuận',
    currentMembers: 2,
    maxMembers: 5,
    neededMembers: 3,
    leader: {
      id: 'usr-1',
      name: 'Nam Lê',
      initials: 'NL',
    },
    description:
      'Cần tìm thêm 3 bạn đồng hành chinh phục cung đường đồi cỏ Tà Năng - Phan Dũng tuyệt đẹp.',
    isBookmarked: false,
    tags: ['Trekking', 'Săn mây', 'Đồi cỏ'],
  },
  {
    id: 'grp-2',
    title: 'Chinh phục Fansipan',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Khó',
    departureDate: '20/11/2024',
    location: 'Lào Cai, Sa Pa',
    currentMembers: 3,
    maxMembers: 4,
    neededMembers: 1,
    leader: {
      id: 'usr-2',
      name: 'Minh Tú',
      initials: 'MT',
    },
    description: 'Leo Fansipan đường Trạm Tôn 2 ngày 1 đêm. Đã có 3 người thể lực tốt.',
    isBookmarked: false,
    tags: ['Mái nhà Đông Dương', 'Chinh phục', 'Sa Pa'],
  },
  {
    id: 'grp-3',
    title: 'Khám phá Vườn Quốc Gia',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Dễ',
    departureDate: '05/12/2024',
    location: 'Cát Tiên, Đồng Nai',
    currentMembers: 4,
    maxMembers: 8,
    neededMembers: 4,
    leader: {
      id: 'usr-3',
      name: 'Hồng Anh',
      initials: 'HA',
    },
    description:
      'Chuyến trekking nhẹ nhàng trải nghiệm rừng nguyên sinh Cát Tiên 2 ngày cuối tuần.',
    isBookmarked: true,
    tags: ['Rừng nguyên sinh', 'Cắm trại', 'Trekking nhẹ'],
  },
  {
    id: 'grp-4',
    title: 'Chinh phục Đỉnh Pù Luông',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Vừa',
    departureDate: '12/12/2024',
    location: 'Thanh Hóa',
    currentMembers: 4,
    maxMembers: 6,
    neededMembers: 2,
    leader: {
      id: 'usr-4',
      name: 'Hoàng Nam',
      initials: 'HN',
    },
    description:
      'Khám phá ruộng bậc thang và mây ngàn tại Pù Luông. Phù hợp cho ai thích thiên nhiên.',
    isBookmarked: false,
    tags: ['Pù Luông', 'Ngắm cảnh', 'Bản làng'],
  },
  {
    id: 'grp-5',
    title: 'Trekking Lảo Thẩn - Săn Mây Y Tý',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Vừa',
    departureDate: '18/12/2024',
    location: 'Y Tý, Lào Cai',
    currentMembers: 5,
    maxMembers: 8,
    neededMembers: 3,
    leader: {
      id: 'usr-5',
      name: 'Bảo Ngọc',
      initials: 'BN',
    },
    description: 'Săn đại dương mây tại Lảo Thẩn - nóc nhà Y Tý. Đã có xe đưa đón từ Hà Nội.',
    isBookmarked: false,
    tags: ['Săn mây', 'Y Tý', 'Lảo Thẩn'],
  },
  {
    id: 'grp-6',
    title: 'Chinh phục Tà Xùa - Biển Mây Cuồng Nhiệt',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Khó',
    departureDate: '25/12/2024',
    location: 'Sơn La',
    currentMembers: 2,
    maxMembers: 6,
    neededMembers: 4,
    leader: {
      id: 'usr-6',
      name: 'Khánh Linh',
      initials: 'KL',
    },
    description: 'Trekking Sống lưng khủng long Tà Xùa và đón bình minh trên đại dương mây.',
    isBookmarked: true,
    tags: ['Tà Xùa', 'Sống lưng khủng long'],
  },
];
