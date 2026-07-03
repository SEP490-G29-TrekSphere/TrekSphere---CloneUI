import type { BlogPost } from '../types';

const AUTHOR_TRAN = {
  name: 'Trần Văn A',
  avatar:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
};

const AUTHOR_LAN = {
  name: 'Lê Thị Lan',
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
};

const AUTHOR_MINH = {
  name: 'Nguyễn Minh',
  avatar:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'kinh-nghiem-trekking-ta-nang-phan-dung',
    title: 'Kinh nghiệm trekking Tà Năng - Phan Dũng cho người mới bắt đầu',
    excerpt:
      'Tổng hợp những kinh nghiệm thực tế từ hành trình Tà Năng - Phan Dũng dành cho người mới bắt đầu: thời điểm lý tưởng, vật dụng cần chuẩn bị, lộ trình chi tiết và những lưu ý quan trọng.',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    categoryId: 'experience',
    categoryLabel: 'Kinh nghiệm',
    author: AUTHOR_TRAN,
    publishedAt: '2024-05-15T08:00:00Z',
    readingTime: 8,
    tags: ['#Trekking', '#TaNangPhanDung', '#TravelTips'],
    blocks: [
      {
        type: 'p',
        text: 'Tà Năng - Phan Dũng là một trong những cung trekking nổi tiếng nhất Việt Nam, thu hút hàng nghìn trekker mỗi năm. Tuyến đường dài khoảng 55km xuyên qua 3 tỉnh Lâm Đồng - Ninh Thuận - Bình Thuận, mang đến trải nghiệm đa dạng về địa hình và khí hậu.',
      },
      { type: 'h2', text: 'Bắt đầu hành trình từ đâu?' },
      {
        type: 'p',
        text: 'Hầu hết các đoàn trekking sẽ khởi hành từ làng Đạ Tẻh, Lâm Đồng - điểm bắt đầu của cung đường. Từ Sài Gòn, bạn di chuyển bằng xe khách hoặc ô tô riêng đến đây mất khoảng 6-8 tiếng. Thời điểm lý tưởng nhất là từ tháng 11 đến tháng 4 năm sau, khi mùa mưa đã qua và thời tiết ổn định.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80',
        alt: 'Đồi cỏ Tà Năng lúc bình minh',
        caption: 'Đồi cỏ Tà Năng lúc bình minh - khoảnh khắc đáng nhớ nhất trên cung',
      },
      { type: 'h2', text: 'Chuẩn bị trước khi lên đường' },
      {
        type: 'p',
        text: 'Danh sách vật dụng cần thiết: balo chuyên trekking 45-60L, giày trekking có đế chống trượt, áo khoác gió, đèn pin, bộ y tế cá nhân, thực phẩm năng lượng cao. Hãy đảm bảo thể lực của bạn đủ tốt bằng cách tập chạy bộ 1 tuần trước khi đi.',
      },
      {
        type: 'quote',
        text: 'Tà Năng không chỉ là một chuyến đi, đó là sự khám phá bản thân qua những giới hạn mới. Hãy đi cùng những người bạn thật sự tin tưởng và đừng bao giờ đi một mình.',
      },
      { type: 'h2', text: 'Những lưu ý quan trọng' },
      {
        type: 'list',
        items: [
          'Không đi một mình, nhóm tối thiểu 4 người.',
          'Mang theo bản đồ giấy và la bàn, không nên chỉ dựa vào GPS.',
          'Bảo quản rác cẩn thận - nguyên tắc "Leave No Trace".',
          'Uống đủ nước, tối thiểu 3 lít/ngày.',
          'Báo cho người thân biết lộ trình và thời gian dự kiến về.',
        ],
      },
    ],
    relatedSlugs: ['review-tour-fansipan-3-ngay', 'cam-nang-chon-giay-trekking'],
  },
  {
    id: '2',
    slug: 'review-tour-fansipan-3-ngay',
    title: 'Review tour Fansipan 3 ngày 2 đêm từ A đến Z',
    excerpt:
      'Hành trình chinh phục nóc nhà Đông Dương Fansipan (3.143m) qua lời kể của một trekker mới: thời gian, chi phí, đội ngũ hỗ trợ và những khoảnh khắc đáng nhớ.',
    coverImage: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&q=80',
    categoryId: 'review',
    categoryLabel: 'Review Tour',
    author: AUTHOR_LAN,
    publishedAt: '2024-04-22T08:00:00Z',
    readingTime: 6,
    tags: ['#Fansipan', '#Review', '#SaPa'],
    blocks: [
      { type: 'h2', text: 'Tại sao chọn Fansipan?' },
      {
        type: 'p',
        text: 'Đỉnh Fansipan cao 3.143m - được mệnh danh là nóc nhà Đông Dương. Chinh phục đỉnh núi này là mơ ước của rất nhiều người yêu thích trekking tại Việt Nam.',
      },
    ],
    relatedSlugs: ['kinh-nghiem-trekking-ta-nang-phan-dung', 'top-5-giay-trekking-2024'],
  },
  {
    id: '3',
    slug: 'cam-nang-chon-giay-trekking',
    title: 'Cẩm nang chọn giày trekking phù hợp cho người Việt',
    excerpt:
      'Giày là vật dụng quan trọng nhất quyết định chất lượng chuyến đi. Bài viết chia sẻ cách chọn size, chất liệu và thương hiệu phù hợp với địa hình Việt Nam.',
    coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80',
    categoryId: 'equipment',
    categoryLabel: 'Thiết bị',
    author: AUTHOR_MINH,
    publishedAt: '2024-03-10T08:00:00Z',
    readingTime: 5,
    tags: ['#Equipment', '#Shoes', '#Tips'],
    blocks: [
      { type: 'h2', text: 'Tại sao giày quan trọng?' },
      {
        type: 'p',
        text: 'Đôi giày quyết định 70% sự thoải mái và an toàn trong suốt hành trình. Một đôi giày không phù hợp có thể phá huỷ cả chuyến đi của bạn.',
      },
    ],
    relatedSlugs: ['top-5-giay-trekking-2024', 'kinh-nghiem-trekking-ta-nang-phan-dung'],
  },
  {
    id: '4',
    slug: 'top-5-giay-trekking-2024',
    title: 'Top 5 đôi giày trekking đáng mua nhất 2024',
    excerpt:
      'Tổng hợp 5 đôi giày trekking được đánh giá cao nhất trong năm 2024 với mức giá từ tầm trung đến cao cấp, phù hợp cho cả người mới và chuyên nghiệp.',
    coverImage: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1200&q=80',
    categoryId: 'equipment',
    categoryLabel: 'Thiết bị',
    author: AUTHOR_MINH,
    publishedAt: '2024-02-18T08:00:00Z',
    readingTime: 7,
    tags: ['#Equipment', '#Top5'],
    blocks: [],
    relatedSlugs: ['cam-nang-chon-giay-trekking'],
  },
  {
    id: '5',
    slug: 'cam-nang-an-toan-khi-di-rung',
    title: 'Cẩm nang an toàn khi đi rừng - Kinh nghiệm sinh tồn cơ bản',
    excerpt:
      'Tổng hợp các kỹ năng sinh tồn cơ bản và nguyên tắc an toàn cần biết trước khi bắt đầu bất kỳ hành trình trekking nào vào rừng sâu.',
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
    categoryId: 'guide',
    categoryLabel: 'Cẩm nang',
    author: AUTHOR_TRAN,
    publishedAt: '2024-01-30T08:00:00Z',
    readingTime: 9,
    tags: ['#Safety', '#Survival'],
    blocks: [],
    relatedSlugs: ['kinh-nghiem-trekking-ta-nang-phan-dung'],
  },
  {
    id: '6',
    slug: '7-vat-dung-khong-the-thieu',
    title: '7 vật dụng không thể thiếu khi leo núi mùa mưa',
    excerpt:
      'Mùa mưa tới, trekking trở nên khó khăn hơn. Đây là 7 vật dụng thiết yếu giúp bạn giữ khô ráo và an toàn xuyên suốt hành trình.',
    coverImage: 'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=1200&q=80',
    categoryId: 'guide',
    categoryLabel: 'Cẩm nang',
    author: AUTHOR_LAN,
    publishedAt: '2024-01-05T08:00:00Z',
    readingTime: 4,
    tags: ['#RainSeason', '#Equipment'],
    blocks: [],
    relatedSlugs: ['cam-nang-an-toan-khi-di-rung', 'top-5-giay-trekking-2024'],
  },
];
