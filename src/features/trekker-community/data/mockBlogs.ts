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

// Mutable mock data for CRUD operations (will be updated when user edits/saves)
export const MOCK_BLOGS: TrekkerBlogItem[] = [
  {
    blogId: '1',
    title: 'Khám phá vẻ đẹp hang Sơn Đoòng - Hành trình 7 ngày không thể quên',
    excerpt:
      'Hang Sơn Đoòng là hang động lớn nhất thế giới, nằm trong Vườn quốc gia Phong Nha-Kẻ Bàng. Với chiều dài hơn 9km, hang động này mang đến cho du khách những trải nghiệm khám phá độc đáo với hệ thống thạch nhũ đồ sộ và sông ngầm ấn tượng.\n\nĐể khám phá hang Sơn Đoòng, du khách cần có sức khỏe tốt và chuẩn bị kỹ lưỡng về trang thiết bị. Chuyến đi thường kéo dài từ 4-7 ngày với nhiều hoạt động như bơi thuyền, leo núi và cắm trại trong hang.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
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
      "Fansipan là đỉnh núi cao nhất Việt Nam và Đông Dương. Leo núi vào mùa đông mang lại những trải nghiệm đặc biệt với cảnh sắc tuyết phủ trắng xóa và bầu trời trong xanh.\n\nChuyến leo núi thường bắt đầu từ thị trấn Sa Pa, đi qua nhiều vùng đất của đồng bào dân tộc H'Mông và Dao đỏ. Đỉnh Fansipan không chỉ là thử thách về thể lực mà còn là hành trình khám phá văn hóa đặc sắc.",
    coverImageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop',
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
      'Đà Lạt không chỉ có hoa lavender hay thung lũng tình yêu. Đỉnh Lang Biang vào ban đêm là một bầu trời sao vô tận với hàng nghìn vì sao lấp lánh.\n\nKinh nghiệm camping tại đây: nên chuẩn bị đầy đủ áo ấm vì nhiệt độ có thể xuống 5-10 độ C vào ban đêm. Đừng quên mang theo đèn pin, thuốc chống côn trùng và thức ăn nóng.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
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
      'Sau 6 tháng sử dụng Salomon X Ultra 4 cho các chuyến đi từ trekking nhẹ đến leo núi khó, tôi có một số đánh giá chi tiết về đôi giày này.\n\nƯu điểm: Đế Grip chắc chắn, thân giày thoáng khí, trọng lượng nhẹ. Nhược điểm: Độ bền mũi giày chưa cao, lớp đệm sau một thời gian dài có dấu hiệu xẹp.',
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
      'Buôn Ma Thuột mùa này đang vào vụ thu hoạch cà phê. Không khí ở đây mang một màu nắng vàng đặc trưng cùng hương cà phê thơm nồng.\n\nLịch trình: Ngày 1-2 khám phá thác Dray Nur, ngày 3-4 trekking thác Thác Đắk Tuỷr, ngày 5 tham quan làng cà phê và chợ đêm Buôn Ma Thuột.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=400&fit=crop',
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
      'Một chiếc balo tốt không chỉ là nơi đựng đồ, mà là người bạn đồng hành quan trọng nhất trong mọi chuyến đi. Dưới đây là những bí kíp tôi đã đúc kết sau nhiều năm trekking.\n\nTrọng lượng balo lý tưởng: Không nên vượt quá 20% trọng lượng cơ thể. Điều này giúp bạn di chuyển linh hoạt và tránh chấn thương.',
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
    excerpt:
      'Vườn quốc gia Bạch Mã không chỉ nổi tiếng với thác nước và rừng nguyên sinh. Đỉnh Bạch Mã vào lúc hoàng hôn là một bức tranh thiên nhiên tuyệt đẹp với gam màu cam rực rỡ.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
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
    excerpt:
      'Pu Si Lung là đỉnh núi thuộc dãy Hoàng Liên Sơn, nằm ở độ cao 3.040m. Đây là một trong những đỉnh núi hiếm hoi chưa có dấu chân người leo.',
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
 * Get a single blog by ID from mock data.
 */
export function getMockBlogById(blogId: string): TrekkerBlogItem | undefined {
  return MOCK_BLOGS.find((b) => b.blogId === blogId);
}

/**
 * Update a blog in mock data.
 */
export function updateMockBlog(
  blogId: string,
  updates: Partial<TrekkerBlogItem>
): TrekkerBlogItem | undefined {
  const index = MOCK_BLOGS.findIndex((b) => b.blogId === blogId);
  if (index === -1) return undefined;

  MOCK_BLOGS[index] = { ...MOCK_BLOGS[index], ...updates };
  return MOCK_BLOGS[index];
}

/**
 * Toggle blog visibility (PUBLISHED <-> DRAFT).
 */
export function toggleMockBlogVisibility(blogId: string): TrekkerBlogItem | undefined {
  const blog = getMockBlogById(blogId);
  if (!blog) return undefined;

  const newStatus = blog.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
  return updateMockBlog(blogId, {
    status: newStatus,
    publishedAt: newStatus === 'PUBLISHED' ? new Date().toISOString() : null,
  });
}

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
