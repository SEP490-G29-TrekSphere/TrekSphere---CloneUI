export interface Tour {
  id: string;
  name: string;
  duration: string;
  level: string;
  price: string;
  rating: number;
  image: string;
  badge?: string;
  slug: string;
}

export const featuredTours: Tour[] = [
  {
    id: '1',
    name: 'Fansipan - Nóc nhà Đông Dương',
    duration: '2 ngày 1 đêm',
    level: 'Trung bình',
    price: '2.500.000đ',
    rating: 4.9,
    image: 'https://booking.muongthanh.com/upload_images/images/H%60/dinh-nui-fansipan.jpg',
    badge: 'Bán chạy',
    slug: 'fansipan-noc-nha-dong-duong',
  },
  {
    id: '2',
    name: 'Tà Năng Phan Dũng - Cung đường cỏ',
    duration: '3 ngày 2 đêm',
    level: 'Khó',
    price: '3.200.000đ',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    badge: 'Phổ biến',
    slug: 'ta-nang-phan-dung',
  },
  {
    id: '3',
    name: 'Hà Giang Loop - Kỳ quan đá',
    duration: '4 ngày 3 đêm',
    level: 'Khám phá',
    price: '4.500.000đ',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=800&q=80',
    badge: 'Tuyệt vời',
    slug: 'ha-giang-loop-ky-quan-da',
  },
  {
    id: '4',
    name: 'Mù Cang Chải - Ruộng bậc thang',
    duration: '3 ngày 2 đêm',
    level: 'Dễ',
    price: '1.800.000đ',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
    slug: 'mu-cang-chai-ruong-bac-thang',
  },
  {
    id: '5',
    name: 'Sapa - Thung lũng Mường Hoa',
    duration: '2 ngày 1 đêm',
    level: 'Dễ',
    price: '1.500.000đ',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800&q=80',
    badge: 'Mới',
    slug: 'sapa-thung-lung-muong-hoa',
  },
  {
    id: '6',
    name: 'Côn Đải - Hòn Hải Đảo',
    duration: '5 ngày 4 đêm',
    level: 'Khám phá',
    price: '5.800.000đ',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80',
    slug: 'con-dao-hon-hai-dao',
  },
];
