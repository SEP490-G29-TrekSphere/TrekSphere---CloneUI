import { mockUsers } from './users';

/**
 * Kho dữ liệu blog dùng chung cho MSW handlers của 2 feature:
 *  - `news` (đọc công khai: list/detail/comments trên `/blogs`)
 *  - `trekker-community` (CRUD bài viết của chính mình trên `/blogs`)
 *
 * Cả 2 feature cùng gọi vào endpoint `/blogs*` thật ở BE nên ở đây dùng
 * chung 1 mảng mutable — tạo/sửa/xóa/ẩn từ trekker-community phản ánh ngay
 * lập tức khi news list lại (và ngược lại), giống hành vi 1 BE thật.
 *
 * Field set là hợp của `BlogListItem`/`BlogPostDetail` (feature `news`) và
 * `TrekkerBlogItem`/`TrekkerBlogDetail` (feature `trekker-community`).
 */

export type MockBlogStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED' | 'DELETED';

export interface MockBlogComment {
  commentId: string;
  userId: string;
  userFullName: string;
  userAvatarUrl: string;
  content: string;
  status: 'ACTIVE' | 'HIDDEN' | 'DELETED';
  createdAt: string;
  parentCommentId?: string | null;
}

export interface MockBlog {
  blogId: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  categoryName: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  status: MockBlogStatus;
  viewCount: number;
  readingTimeMinutes: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  comments: MockBlogComment[];
}

const trekker = mockUsers.find((u) => u.roles.includes('TREKKER')) ?? mockUsers[1];
const vendorStaff = mockUsers.find((u) => u.roles.includes('VENDOR_STAFF')) ?? mockUsers[3];
const admin = mockUsers.find((u) => u.roles.includes('ADMIN')) ?? mockUsers[0];

function iso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function cover(seed: string): string {
  return `https://picsum.photos/seed/${seed}/800/600`;
}

function makeComments(blogSeed: string, count: number): MockBlogComment[] {
  const authors = [trekker, vendorStaff, admin];
  const samples = [
    'Bài viết rất hữu ích, mình vừa đi cung này về theo đúng lịch trình bạn chia sẻ!',
    'Cho mình hỏi thời điểm này đi có còn nhiều vắt không admin ơi?',
    'Ảnh chụp đẹp quá, editor nào vậy bạn?',
    'Team mình sắp đi tuần sau, đọc bài này chuẩn bị đồ kỹ hơn hẳn.',
    'Cảm ơn tác giả, thông tin về porter và giá cả rất chi tiết.',
  ];
  return Array.from({ length: count }, (_, i) => {
    const author = authors[i % authors.length];
    return {
      commentId: `comment-${blogSeed}-${i + 1}`,
      userId: author.id,
      userFullName: author.fullName,
      userAvatarUrl: author.avatarUrl ?? '',
      content: samples[i % samples.length],
      status: 'ACTIVE' as const,
      createdAt: iso(count - i),
      parentCommentId: null,
    };
  });
}

const seedBlogs: Array<Omit<MockBlog, 'comments'> & { commentCount: number }> = [
  {
    blogId: 'blog-fansipan-3ngay2dem',
    title: 'Chinh phục Fansipan 3 ngày 2 đêm: Kinh nghiệm từ A-Z cho người mới',
    excerpt:
      'Lịch trình chi tiết, danh sách đồ mang theo và những lưu ý quan trọng khi chinh phục nóc nhà Đông Dương lần đầu.',
    content:
      '## Chuẩn bị trước chuyến đi\n\nFansipan cao 3.143m, là đỉnh núi cao nhất Đông Dương. Với lịch trình 3 ngày 2 đêm, bạn sẽ có đủ thời gian để thích nghi độ cao và tận hưởng cảnh quan.\n\n### Đồ cần mang theo\n- Giày trekking chống trơn trượt\n- Áo khoác gió, áo giữ nhiệt\n- Gậy trekking\n- Đèn pin đội đầu\n- Nước và đồ ăn nhẹ giàu năng lượng\n\n### Lịch trình\n**Ngày 1:** Trạm Trịnh Tường → Lán 2200m (~4-5 giờ đi bộ)\n**Ngày 2:** Lán 2200m → Đỉnh Fansipan → Lán 2800m\n**Ngày 3:** Lán 2800m → xuống núi\n\nChúc các bạn có chuyến đi an toàn và nhiều trải nghiệm đáng nhớ!',
    coverImageUrl: cover('fansipan-trek'),
    categoryName: 'guide',
    tags: ['Fansipan', 'Sapa', 'Trekking', 'Kinh nghiệm'],
    authorId: admin.id,
    authorName: admin.fullName,
    authorAvatarUrl: admin.avatarUrl ?? '',
    status: 'PUBLISHED',
    viewCount: 1520,
    readingTimeMinutes: 8,
    publishedAt: iso(2),
    createdAt: iso(2),
    updatedAt: iso(2),
    commentCount: 4,
  },
  {
    blogId: 'blog-ta-nang-camping',
    title: 'Tà Năng - Phan Dũng: Cung trekking đẹp nhất Việt Nam',
    excerpt:
      'Trải nghiệm 2 ngày 1 đêm băng qua những đồi cỏ vàng bất tận nối liền 3 tỉnh Lâm Đồng - Ninh Thuận - Bình Thuận.',
    content:
      '## Vì sao Tà Năng - Phan Dũng được mệnh danh "cung đẹp nhất Việt Nam"\n\nCung đường dài khoảng 55km băng qua những quả đồi cỏ tranh trải dài bất tận, đặc biệt đẹp vào mùa khô từ tháng 10 đến tháng 4.\n\n### Lưu ý an toàn\nCung này dễ lạc đường nếu không có porter/guide địa phương dẫn đường, nên đi theo nhóm có kinh nghiệm hoặc đặt tour có porter.\n\n### Điểm cắm trại lý tưởng\nĐồi cỏ trước khi xuống thác Yaly là điểm cắm trại ngắm hoàng hôn đẹp nhất cung đường.',
    coverImageUrl: cover('ta-nang-phan-dung'),
    categoryName: 'experience',
    tags: ['Tà Năng', 'Camping', 'Đồi cỏ'],
    authorId: trekker.id,
    authorName: trekker.fullName,
    authorAvatarUrl: trekker.avatarUrl ?? '',
    status: 'PUBLISHED',
    viewCount: 2310,
    readingTimeMinutes: 6,
    publishedAt: iso(5),
    createdAt: iso(5),
    updatedAt: iso(5),
    commentCount: 3,
  },
  {
    blogId: 'blog-review-giay-trekking',
    title: 'Review 5 mẫu giày trekking đáng mua nhất 2026',
    excerpt:
      'So sánh chi tiết độ bám, độ bền và giá thành của 5 mẫu giày trekking phổ biến nhất hiện nay tại Việt Nam.',
    content:
      '## Tiêu chí đánh giá\n\nĐộ bám đường, khả năng chống nước, độ bền đế giày và mức giá là 4 tiêu chí chính.\n\n### Top 5 lựa chọn\n1. Giày trekking chống nước cao cấp\n2. Giày leo núi đế Vibram\n3. Giày trekking phổ thông giá tốt\n4. Giày trail-running đa dụng\n5. Giày bốt cổ cao cho địa hình đá\n\nMỗi mẫu đều có ưu nhược điểm riêng, tùy vào cung đường và ngân sách để lựa chọn phù hợp.',
    coverImageUrl: cover('trekking-shoes-review'),
    categoryName: 'equipment',
    tags: ['Giày trekking', 'Review', 'Thiết bị'],
    authorId: vendorStaff.id,
    authorName: vendorStaff.fullName,
    authorAvatarUrl: vendorStaff.avatarUrl ?? '',
    status: 'PUBLISHED',
    viewCount: 980,
    readingTimeMinutes: 5,
    publishedAt: iso(8),
    createdAt: iso(8),
    updatedAt: iso(8),
    commentCount: 2,
  },
  {
    blogId: 'blog-pusilung-4ngay3dem',
    title: 'Pu Si Lung - đỉnh núi khó chinh phục nhất miền Bắc',
    excerpt:
      'Hành trình 4 ngày 3 đêm xuyên rừng nguyên sinh, vượt suối, băng rừng trúc để chạm tay tới cột mốc biên giới.',
    content:
      '## Độ khó vượt trội\n\nPu Si Lung cao 3.083m, nằm sát biên giới Việt - Trung, được đánh giá là một trong những cung trekking khó nhất Việt Nam do địa hình hiểm trở và thời gian di chuyển dài.\n\n### Cần chuẩn bị gì\n- Thể lực tốt, đã có kinh nghiệm trekking nhiều ngày\n- Porter địa phương thông thạo đường rừng\n- Giấy phép khu vực biên giới\n\nĐây là chuyến đi dành cho những ai đã có kinh nghiệm và muốn thử thách bản thân.',
    coverImageUrl: cover('pusilung-peak'),
    categoryName: 'guide',
    tags: ['Pu Si Lung', 'Lai Châu', 'Khó'],
    authorId: admin.id,
    authorName: admin.fullName,
    authorAvatarUrl: admin.avatarUrl ?? '',
    status: 'PUBLISHED',
    viewCount: 640,
    readingTimeMinutes: 9,
    publishedAt: iso(12),
    createdAt: iso(12),
    updatedAt: iso(12),
    commentCount: 1,
  },
  {
    blogId: 'blog-tay-con-linh',
    title: 'Tây Côn Lĩnh mùa săn mây: Trải nghiệm ngủ lán giữa rừng nguyên sinh',
    excerpt:
      'Đỉnh núi cao thứ 2 miền Bắc với khu rừng nguyên sinh nguyên vẹn, lý tưởng để săn mây và ngắm hoa đỗ quyên.',
    content:
      '## Mùa đẹp nhất\n\nTừ tháng 11 đến tháng 3 là mùa săn mây đẹp nhất, còn tháng 3-4 là mùa hoa đỗ quyên nở rộ.\n\n### Trải nghiệm ngủ lán\nĐêm ngủ lán giữa rừng nguyên sinh ở độ cao hơn 2000m, nhiệt độ có thể xuống dưới 5 độ C vào mùa đông, cần chuẩn bị túi ngủ tốt.',
    coverImageUrl: cover('tay-con-linh'),
    categoryName: 'experience',
    tags: ['Tây Côn Lĩnh', 'Hà Giang', 'Săn mây'],
    authorId: trekker.id,
    authorName: trekker.fullName,
    authorAvatarUrl: trekker.avatarUrl ?? '',
    status: 'PUBLISHED',
    viewCount: 1105,
    readingTimeMinutes: 7,
    publishedAt: iso(15),
    createdAt: iso(15),
    updatedAt: iso(15),
    commentCount: 3,
  },
  {
    blogId: 'blog-bach-moc-luong-tu',
    title: 'Bạch Mộc Lương Tử: Cung trekking "sống ảo" triệu view',
    excerpt:
      'Sống lưng khủng long nổi tiếng trên mạng xã hội, cung đường vừa đẹp vừa vừa sức cho người mới bắt đầu.',
    content:
      '## Điểm check-in nổi tiếng\n\n"Sống lưng khủng long" là dải núi hẹp với view 2 bên đều là biển mây, cực kỳ nổi tiếng trên các nền tảng mạng xã hội.\n\n### Độ khó\nPhù hợp với người mới bắt đầu trekking nhiều ngày, độ dốc vừa phải, có đường mòn rõ ràng.',
    coverImageUrl: cover('bach-moc-luong-tu'),
    categoryName: 'review',
    tags: ['Bạch Mộc Lương Tử', 'Lào Cai', 'Sống lưng khủng long'],
    authorId: vendorStaff.id,
    authorName: vendorStaff.fullName,
    authorAvatarUrl: vendorStaff.avatarUrl ?? '',
    status: 'PUBLISHED',
    viewCount: 3420,
    readingTimeMinutes: 6,
    publishedAt: iso(20),
    createdAt: iso(20),
    updatedAt: iso(20),
    commentCount: 5,
  },
  {
    blogId: 'blog-do-an-nhe-trekking',
    title: 'Top 10 món đồ ăn nhẹ gọn nhẹ, giàu năng lượng cho dân trekking',
    excerpt:
      'Danh sách đồ ăn nhẹ vừa gọn nhẹ vừa cung cấp đủ năng lượng cho những chặng đường dài trên núi.',
    content:
      '## Tiêu chí chọn đồ ăn nhẹ\n\nGọn nhẹ, giàu calo, dễ bảo quản và không cần chế biến là các tiêu chí quan trọng nhất.\n\n### Gợi ý\n- Thanh năng lượng (energy bar)\n- Hạt điều, hạnh nhân rang\n- Socola đen\n- Trái cây sấy khô\n- Bột điện giải pha nước',
    coverImageUrl: cover('trekking-snacks'),
    categoryName: 'equipment',
    tags: ['Đồ ăn', 'Năng lượng', 'Mẹo hay'],
    authorId: admin.id,
    authorName: admin.fullName,
    authorAvatarUrl: admin.avatarUrl ?? '',
    status: 'PUBLISHED',
    viewCount: 875,
    readingTimeMinutes: 4,
    publishedAt: iso(25),
    createdAt: iso(25),
    updatedAt: iso(25),
    commentCount: 2,
  },
  {
    blogId: 'blog-lung-cung-yty',
    title: 'Lùng Cúng - Y Tý: Săn mây trên đỉnh núi thiêng của người Mông',
    excerpt:
      'Cung trekking 2 ngày 1 đêm ít người biết đến nhưng sở hữu cảnh quan hùng vĩ bậc nhất Tây Bắc.',
    content:
      '## Vẻ đẹp hoang sơ\n\nLùng Cúng cao 2.913m, cung đường còn khá hoang sơ, ít bị khai thác du lịch nên giữ được vẻ đẹp nguyên bản.\n\n### Thời điểm lý tưởng\nTháng 9-10 lúa chín vàng ở thung lũng, tháng 12-2 có biển mây đẹp nhất.',
    coverImageUrl: cover('lung-cung-yty'),
    categoryName: 'experience',
    tags: ['Lùng Cúng', 'Y Tý', 'Săn mây'],
    authorId: trekker.id,
    authorName: trekker.fullName,
    authorAvatarUrl: trekker.avatarUrl ?? '',
    status: 'PUBLISHED',
    viewCount: 560,
    readingTimeMinutes: 6,
    publishedAt: iso(30),
    createdAt: iso(30),
    updatedAt: iso(30),
    commentCount: 1,
  },
  {
    blogId: 'blog-so-cuu-y-te-trekking',
    title: 'Sơ cứu y tế cơ bản khi trekking: Những kỹ năng sống còn',
    excerpt:
      'Hướng dẫn xử lý các tình huống thường gặp: bong gân, sốc nhiệt, say độ cao và cách phòng tránh.',
    content:
      '## Các tình huống thường gặp\n\n### Say độ cao (AMS)\nTriệu chứng: đau đầu, buồn nôn, chóng mặt. Xử lý: dừng lên cao, nghỉ ngơi, uống nhiều nước, nếu nặng phải xuống núi ngay.\n\n### Bong gân\nCố định khớp, chườm lạnh, băng ép nhẹ, hạn chế di chuyển.\n\n### Sốc nhiệt\nDi chuyển vào bóng râm, cởi bớt quần áo, làm mát cơ thể từ từ.',
    coverImageUrl: cover('trekking-first-aid'),
    categoryName: 'guide',
    tags: ['Sơ cứu', 'An toàn', 'Sức khỏe'],
    authorId: admin.id,
    authorName: admin.fullName,
    authorAvatarUrl: admin.avatarUrl ?? '',
    status: 'PUBLISHED',
    viewCount: 1980,
    readingTimeMinutes: 7,
    publishedAt: iso(35),
    createdAt: iso(35),
    updatedAt: iso(35),
    commentCount: 4,
  },
  {
    blogId: 'blog-nhat-ky-trekker-nubinh',
    title: '[Nhật ký của tôi] Lần đầu trekking Núi Bà Đen về đêm',
    excerpt:
      'Chia sẻ cá nhân về trải nghiệm leo núi Bà Đen xuyên đêm để đón bình minh trên đỉnh núi cao nhất Nam Bộ.',
    content:
      '## Vì sao chọn leo đêm\n\nMình muốn tránh nắng nóng ban ngày và đón bình minh trên đỉnh, một trải nghiệm không thể nào quên.\n\n### Cảm nhận\nĐường lên khá dốc ở đoạn giữa, nhưng cảnh bình minh trên đỉnh hoàn toàn xứng đáng với công sức bỏ ra!',
    coverImageUrl: cover('nui-ba-den-night'),
    categoryName: 'experience',
    tags: ['Núi Bà Đen', 'Tây Ninh', 'Nhật ký'],
    authorId: trekker.id,
    authorName: trekker.fullName,
    authorAvatarUrl: trekker.avatarUrl ?? '',
    status: 'PUBLISHED',
    viewCount: 320,
    readingTimeMinutes: 3,
    publishedAt: iso(1),
    createdAt: iso(1),
    updatedAt: iso(1),
    commentCount: 0,
  },
  {
    blogId: 'blog-trekker-draft-chuachonlich',
    title: '[Nháp] Kế hoạch trekking Nam Kang Ho Tao cuối năm',
    excerpt: 'Bản nháp lịch trình đang lên ý tưởng, chưa hoàn thiện.',
    content: 'Đang cập nhật lịch trình chi tiết cho chuyến đi Nam Kang Ho Tao dự kiến tháng 12...',
    coverImageUrl: cover('nam-kang-ho-tao-draft'),
    categoryName: 'guide',
    tags: ['Nam Kang Ho Tao'],
    authorId: trekker.id,
    authorName: trekker.fullName,
    authorAvatarUrl: trekker.avatarUrl ?? '',
    status: 'DRAFT',
    viewCount: 0,
    readingTimeMinutes: 2,
    publishedAt: iso(0),
    createdAt: iso(0),
    updatedAt: iso(0),
    commentCount: 0,
  },
];

export const mockBlogs: MockBlog[] = seedBlogs.map(({ commentCount, ...blog }) => ({
  ...blog,
  comments: makeComments(blog.blogId, commentCount),
}));

export function findBlogById(blogId: string): MockBlog | undefined {
  return mockBlogs.find((b) => b.blogId === blogId);
}

export function findCommentById(commentId: string): MockBlogComment | undefined {
  for (const blog of mockBlogs) {
    const found = blog.comments.find((c) => c.commentId === commentId);
    if (found) return found;
  }
  return undefined;
}

let blogSeq = mockBlogs.length + 1;
export function nextBlogId(): string {
  return `blog-new-${blogSeq++}`;
}

let commentSeq = 1;
export function nextCommentId(): string {
  return `comment-new-${commentSeq++}`;
}
