/**
 * Mock data cho feature Trekker Community / "Blog của tôi".
 * Xóa file này khi BE cung cấp API thực.
 */

import type { TrekkerBlogItem, TrekkerBlogListResponse, TrekkerBlogStats } from '../types';

export const MOCK_STATS: TrekkerBlogStats = {
  totalPosts: 24,
  totalViews: 12800,
  newComments: 15,
};

const MOCK_BLOGS: TrekkerBlogItem[] = [
  {
    blogId: '1',
    title: 'Khám phá vẻ đẹp hang Sơn Đoòng - Hành trình 7 ngày không thể quên',
    excerpt:
      'Hang Sơn Đoòng là hang động lớn nhất thế giới, nằm trong Vườn quốc gia Phong Nha-Kẻ Bàng...',
    coverImageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    authorId: 'user-1',
    authorName: 'Minh Tuấn',
    authorAvatarUrl: null,
    status: 'PUBLISHED',
    viewCount: 2450,
    commentCount: 42,
    createdAt: '2023-10-15T08:00:00Z',
    updatedAt: '2023-10-16T10:30:00Z',
    publishedAt: '2023-10-16T10:30:00Z',
    tags: ['hang sơn đoòng', 'phong nha', 'khám phá'],
    readingTimeMinutes: 12,
  },
  {
    blogId: '2',
    title: 'Leo núi Fansipan mùa đông - Cảm giác chạm đỉnh cao 3.143m',
    excerpt:
      'Fansipan là đỉnh núi cao nhất Việt Nam và Đông Dương. Leo núi vào mùa đông mang lại những trải nghiệm đặc biệt...',
    coverImageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
    authorId: 'user-1',
    authorName: 'Minh Tuấn',
    authorAvatarUrl: null,
    status: 'PUBLISHED',
    viewCount: 3100,
    commentCount: 67,
    createdAt: '2023-11-20T07:00:00Z',
    updatedAt: '2023-11-21T09:00:00Z',
    publishedAt: '2023-11-21T09:00:00Z',
    tags: ['fansipan', 'leo núi', 'mùa đông'],
    readingTimeMinutes: 8,
  },
  {
    blogId: '3',
    title: 'Camping tại Đà Lạt - Đêm trên đỉnh Lang Biang ngắm sao trời',
    excerpt:
      'Đà Lạt không chỉ có hoa lavender hay thung lũng tình yêu. Đỉnh Lang Biang vào ban đêm là một bầu trời sao vô tận...',
    coverImageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    authorId: 'user-1',
    authorName: 'Minh Tuấn',
    authorAvatarUrl: null,
    status: 'PUBLISHED',
    viewCount: 1890,
    commentCount: 28,
    createdAt: '2023-12-05T06:00:00Z',
    updatedAt: '2023-12-06T08:00:00Z',
    publishedAt: '2023-12-06T08:00:00Z',
    tags: ['đà lạt', 'camping', 'lang biang', 'sao trời'],
    readingTimeMinutes: 6,
  },
  {
    blogId: '4',
    title: 'Review giày leo núi Salomon X Ultra 4 - Đôi giày đáng mua nhất 2023',
    excerpt:
      'Sau 6 tháng sử dụng Salomon X Ultra 4 cho các chuyến đi từ trekking nhẹ đến leo núi khó...',
    coverImageUrl: null,
    authorId: 'user-1',
    authorName: 'Minh Tuấn',
    authorAvatarUrl: null,
    status: 'DRAFT',
    viewCount: 0,
    commentCount: 0,
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
    publishedAt: null,
    tags: ['review', 'giày leo núi', 'salomon'],
    readingTimeMinutes: 5,
  },
  {
    blogId: '5',
    title: 'Hành trình 5 ngày khám phá Tây Nguyên - Mùa cà phê bung nở',
    excerpt:
      'Buôn Ma Thuột mùa này đang vào vụ thu hoạch cà phê. Không khí ở đây mang một màu nắng vàng đặc trưng...',
    coverImageUrl:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop',
    authorId: 'user-1',
    authorName: 'Minh Tuấn',
    authorAvatarUrl: null,
    status: 'PUBLISHED',
    viewCount: 980,
    commentCount: 15,
    createdAt: '2024-01-18T05:00:00Z',
    updatedAt: '2024-01-19T07:00:00Z',
    publishedAt: '2024-01-19T07:00:00Z',
    tags: ['tây nguyên', 'buôn ma thuột', 'cà phê'],
    readingTimeMinutes: 10,
  },
  {
    blogId: '6',
    title: 'Bí kíp chuẩn bị balo cho chuyến trekking dài ngày',
    excerpt:
      'Một chiếc balo tốt không chỉ là nơi đựng đồ, mà là người bạn đồng hành quan trọng nhất...',
    coverImageUrl: null,
    authorId: 'user-1',
    authorName: 'Minh Tuấn',
    authorAvatarUrl: null,
    status: 'PUBLISHED',
    viewCount: 5600,
    commentCount: 89,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-02T12:00:00Z',
    publishedAt: '2024-02-02T12:00:00Z',
    tags: ['bí kíp', 'trekking', 'balo', 'dụng cụ'],
    readingTimeMinutes: 7,
  },
  {
    blogId: '7',
    title: 'Ngắm hoàng hôn trên đỉnh Bạch Mã - Trải nghiệm tuyệt vời',
    excerpt: 'Vườn quốc gia Bạch Mã không chỉ nổi tiếng với thác nước và rừng nguyên sinh...',
    coverImageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    authorId: 'user-1',
    authorName: 'Minh Tuấn',
    authorAvatarUrl: null,
    status: 'PUBLISHED',
    viewCount: 720,
    commentCount: 11,
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-02-16T11:00:00Z',
    publishedAt: '2024-02-16T11:00:00Z',
    tags: ['bạch mã', 'hoàng hôn', 'vườn quốc gia'],
    readingTimeMinutes: 4,
  },
  {
    blogId: '8',
    title: 'Kế hoạch chinh phục đỉnh Pu Si Lung - Nơi gió còn chưa từng đặt chân',
    excerpt: 'Pu Si Lung là đỉnh núi thuộc dãy Hoàng Liên Sơn, nằm ở độ cao 3.040m...',
    coverImageUrl: null,
    authorId: 'user-1',
    authorName: 'Minh Tuấn',
    authorAvatarUrl: null,
    status: 'DRAFT',
    viewCount: 0,
    commentCount: 0,
    createdAt: '2024-03-01T11:00:00Z',
    updatedAt: '2024-03-03T13:00:00Z',
    publishedAt: null,
    tags: ['pu si lung', 'dự định', 'leo núi'],
    readingTimeMinutes: 9,
  },
];

/**
 * Trả về danh sách blog phân trang (mock).
 */
export function getMockBlogList(params: {
  page?: number;
  size?: number;
  keyword?: string;
}): TrekkerBlogListResponse {
  const page = params.page ?? 1;
  const size = params.size ?? 8;
  const keyword = params.keyword?.toLowerCase();

  let filtered = MOCK_BLOGS;
  if (keyword) {
    filtered = MOCK_BLOGS.filter(
      (b) => b.title.toLowerCase().includes(keyword) || b.excerpt.toLowerCase().includes(keyword)
    );
  }

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = (page - 1) * size;
  const items = filtered.slice(start, start + size);

  return {
    items,
    meta: {
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
    },
  };
}
