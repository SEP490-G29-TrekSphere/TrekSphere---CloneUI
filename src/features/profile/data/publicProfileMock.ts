import type { UserPublicProfileData } from '../types';
import { getAdvancedProfile } from '../utils/advancedProfileStorage';

export const DEFAULT_PUBLIC_PROFILES: Record<string, UserPublicProfileData> = {
  'user-trekker-1': {
    id: 'user-trekker-1',
    fullName: 'Nguyễn Văn Trekker',
    handle: 'nguyenvantrekker',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    role: 'TRƯỞNG NHÓM TREKKING',
    bio: 'Đam mê trekking chinh phục các đỉnh núi cao Tây Bắc. Sẵn sàng ghép nhóm, chia sẻ đồ dã ngoại và hỗ trợ đồng đội trên mọi cung đường.',
    location: 'Hà Nội, Việt Nam',
    joinedDate: 'Tháng 05, 2024',
    verifiedBadge: true,
    reputationScore: 4.9,
    reviewCount: 28,
    stats: {
      tripsCount: 14,
      postsCount: 8,
      momentsCount: 36,
    },
    preferences: {
      fitnessLevel: 'advanced',
      paceStyle: 'steady',
      trekkingFrequency: '2-3 chuyến/tháng',
      skillsAndEquipment: ['bivouac', 'firstaid', 'navigation', 'cooking'],
      preferredTerrains: ['mountain', 'jungle', 'stream'],
      planningNotes: 'Tháng 10/2026 này mình đang tìm 2 bạn thể lực tốt ghép xe chạy Hà Nội -> Sapa leo Ngũ Chỉ Sơn 2N1Đ.',
    },
    moments: [
      {
        id: 'm1',
        locationName: 'Đỉnh Fansipan',
        altitude: '3.143m',
        tripTitle: 'Hành trình Săn Mây Fansipan',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        createdAt: '15/10/2025',
        likesCount: 42,
        commentsCount: 9,
        caption: 'Bình minh rực rỡ trên nóc nhà Đông Dương cùng biệt đội TrekSphere!',
        coordinates: '22.3033° N, 103.7753° E',
      },
      {
        id: 'm2',
        locationName: 'Bạch Mộc Lương Tử',
        altitude: '3.046m',
        tripTitle: 'Chinh phục Đỉnh Ky Quan San',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        createdAt: '02/11/2025',
        likesCount: 56,
        commentsCount: 14,
        caption: 'Biển mây Muối Nước cuồn cuộn chiều hoàng hôn. Đẹp không thốt nên lời.',
        coordinates: '22.5083° N, 103.5892° E',
      },
      {
        id: 'm3',
        locationName: 'Đỉnh Lảo Thần',
        altitude: '2.860m',
        tripTitle: 'Săn mây Y Tý - Lảo Thần 2N1Đ',
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        createdAt: '20/12/2025',
        likesCount: 38,
        commentsCount: 6,
        caption: 'Cung đường leo nhẹ nhàng thích hợp để chill và ngắm bình minh.',
        coordinates: '22.6178° N, 103.6234° E',
      },
      {
        id: 'm4',
        locationName: 'Tà Chì Nhù',
        altitude: '2.979m',
        tripTitle: 'Săn Hoa Chi Pâu Trạm Tấu',
        imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
        createdAt: '10/01/2026',
        likesCount: 64,
        commentsCount: 11,
        caption: 'Thung lũng tím ngắt mộng mơ giữa đại ngàn Yên Bái.',
        coordinates: '21.5794° N, 104.3012° E',
      },
      {
        id: 'm5',
        locationName: 'Nhìu Cồ San',
        altitude: '2.965m',
        tripTitle: 'Thám hiểm Thác Ong Bắp Cày',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
        createdAt: '18/02/2026',
        likesCount: 29,
        commentsCount: 4,
        caption: 'Vượt dòng suối mát lạnh và rừng rậm mù sương.',
        coordinates: '22.5641° N, 103.6120° E',
      },
      {
        id: 'm6',
        locationName: 'Sống lưng Khủng Long Háng Đồng',
        altitude: '2.100m',
        tripTitle: 'Trekker Weekend Tà Xùa',
        imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
        createdAt: '05/03/2026',
        likesCount: 71,
        commentsCount: 18,
        caption: 'Gió lồng lộng giữa hai bờ vực thẳm. Cảm giác chinh phục tuyệt vời!',
        coordinates: '21.4321° N, 104.5432° E',
      },
    ],
    posts: [
      {
        id: 'p1',
        title: 'Kinh nghiệm chuẩn bị thể lực leo Bạch Mộc Lương Tử cho người mới',
        summary: 'Tổng hợp bài tập cardio, leo cầu thang và phân bổ thể lực theo từng chặng từ Nậm Pề tới đỉnh Ky Quan San.',
        coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        createdAt: '12/11/2025',
        viewCount: 1240,
        commentsCount: 18,
        category: 'KINH NGHIỆM',
      },
      {
        id: 'p2',
        title: 'Checklist 15 món đồ dã ngoại không thể thiếu khi trekking mùa mưa',
        summary: 'Hướng dẫn chọn áo mưa bộ, túi chống nước cho balo, giày bám đinh và bộ sơ cứu cá nhân chuẩn y tế.',
        coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        createdAt: '04/01/2026',
        viewCount: 850,
        commentsCount: 12,
        category: 'TRANG BỊ',
      },
      {
        id: 'p3',
        title: 'Hành trình săn mây Lảo Thần 2N1Đ - Chi tiết chi phí & Lịch trình',
        summary: 'Lịch trình di chuyển xe giường nằm Hà Nội -> Y Tý, thuê porter và kinh nghiệm cắm trại lều đêm 0 độ C.',
        coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        createdAt: '22/02/2026',
        viewCount: 2100,
        commentsCount: 34,
        category: 'LỊCH TRÌNH',
      },
    ],
    trips: [
      {
        id: 'grp-1',
        title: 'Săn mây Y Tý - Đỉnh Lảo Thần 2N1Đ',
        role: 'LEADER',
        status: 'COMPLETED',
        startDate: '15/10/2025',
        membersCount: 8,
        coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        location: 'Y Tý, Bát Xát, Lào Cai',
      },
      {
        id: 'grp-2',
        title: 'Bạch Mộc Lương Tử 3N2Đ - Đỉnh Ky Quan San',
        role: 'LEADER',
        status: 'COMPLETED',
        startDate: '20/11/2025',
        membersCount: 6,
        coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        location: 'Bát Xát, Lào Cai',
      },
      {
        id: 'grp-3',
        title: 'Tà Chì Nhù - Mùa Hoa Chi Pâu 2N1Đ',
        role: 'MEMBER',
        status: 'RECRUITING',
        startDate: '12/09/2026',
        membersCount: 4,
        coverImage: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
        location: 'Trạm Tấu, Yên Bái',
      },
    ],
  },
};

export function getPublicProfileData(
  userId: string,
  currentLoggedUser?: { id: string; fullName?: string; name?: string; email?: string; avatarUrl?: string; avatar?: string } | null
): UserPublicProfileData {
  // If requesting own profile or preset user
  const preset = DEFAULT_PUBLIC_PROFILES[userId];
  const localAdv = getAdvancedProfile(userId);

  const userDisplayName = currentLoggedUser?.fullName || currentLoggedUser?.name || preset?.fullName || 'Trekker';
  const userAvatar = currentLoggedUser?.avatarUrl || currentLoggedUser?.avatar || preset?.avatarUrl;

  if (preset) {
    // If it's the main logged in demo trekker, merge local advanced preferences if available
    if (userId === 'user-trekker-1' || userId === currentLoggedUser?.id) {
      return {
        ...preset,
        fullName: userDisplayName,
        avatarUrl: userAvatar || preset.avatarUrl,
        preferences: localAdv.preferences || preset.preferences,
      };
    }
    return preset;
  }

  // Fallback for any dynamic userId
  return {
    id: userId,
    fullName: (currentLoggedUser?.id === userId ? (currentLoggedUser.fullName || currentLoggedUser.name) : undefined) || `Trekker ${userId.slice(0, 6)}`,
    handle: `user_${userId.slice(0, 8)}`,
    avatarUrl: (currentLoggedUser?.id === userId ? (currentLoggedUser.avatarUrl || currentLoggedUser.avatar) : undefined) || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
    coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    role: 'THÀNH VIÊN TREKSPHERE',
    bio: 'Yêu thiên nhiên, đam mê trải nghiệm các cung đường trekking mới và giao lưu cùng các bạn đồng hành.',
    location: 'Việt Nam',
    joinedDate: 'Tháng 01, 2025',
    verifiedBadge: false,
    reputationScore: 4.8,
    reviewCount: 12,
    stats: {
      tripsCount: 6,
      postsCount: 3,
      momentsCount: 14,
    },
    preferences: localAdv.preferences || {
      fitnessLevel: 'intermediate',
      paceStyle: 'steady',
      trekkingFrequency: '1 chuyến/tháng',
      skillsAndEquipment: ['firstaid', 'bivouac'],
      preferredTerrains: ['mountain', 'jungle'],
      planningNotes: 'Sẵn sàng tham gia các nhóm trekking vừa sức dịp cuối tuần.',
    },
    moments: [
      {
        id: `m-dyn-1-${userId}`,
        locationName: 'Cung đường Nhìu Cồ San',
        altitude: '2.965m',
        tripTitle: 'Chinh phục Nhìu Cồ San',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
        createdAt: '10/02/2026',
        likesCount: 24,
        commentsCount: 3,
        caption: 'Hành trình vượt ngầm suối tuyệt đẹp cùng những người bạn mới.',
      },
      {
        id: `m-dyn-2-${userId}`,
        locationName: 'Đỉnh Lảo Thần',
        altitude: '2.860m',
        tripTitle: 'Săn mây Y Tý',
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        createdAt: '15/01/2026',
        likesCount: 31,
        commentsCount: 5,
        caption: 'Góc nhìn mây cuộn trên đỉnh Lảo Thần.',
      },
    ],
    posts: [
      {
        id: `p-dyn-1-${userId}`,
        title: 'Cảm nhận chuyến đi trekking đầu tiên cùng nhóm ghép TrekSphere',
        summary: 'Những trải nghiệm đáng nhớ và lời khuyên cho các bạn vừa mới tập leo núi.',
        coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        createdAt: '20/01/2026',
        viewCount: 420,
        commentsCount: 7,
        category: 'CHIA SẺ',
      },
    ],
    trips: [
      {
        id: `t-dyn-1-${userId}`,
        title: 'Khám phá Rừng Trúc Bát Xát 2N1Đ',
        role: 'MEMBER',
        status: 'COMPLETED',
        startDate: '12/01/2026',
        membersCount: 5,
        coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
        location: 'Bát Xát, Lào Cai',
      },
    ],
  };
}
