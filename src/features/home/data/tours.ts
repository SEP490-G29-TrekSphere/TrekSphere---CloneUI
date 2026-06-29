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
    name: 'Fansipan - NÃ³c nhÃ  ÄÃ´ng DÆ°Æ¡ng',
    duration: '2 ngÃ y 1 Ä‘Ãªm',
    level: 'Trung bÃ¬nh',
    price: '2.500.000Ä‘',
    rating: 4.9,
    image: 'https://booking.muongthanh.com/upload_images/images/H%60/dinh-nui-fansipan.jpg',
    badge: 'BÃ¡n cháº¡y',
    slug: 'fansipan-noc-nha-dong-duong',
  },
  {
    id: '2',
    name: 'Tà Năng Phan Dũng - Cung đẹp',
    duration: '3 ngày 2 đêm',
    level: 'Khó',
    price: '3.200.000đ',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    badge: 'Phá»• biáº¿n',
    slug: 'ta-nang-phan-dung',
  },
  {
    id: '3',
    name: 'HÃ  Giang Loop - Ká»³ quan Ä‘Ã¡',
    duration: '4 ngÃ y 3 Ä‘Ãªm',
    level: 'KhÃ¡m phÃ¡',
    price: '4.500.000Ä‘',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=800&q=80',
    badge: 'Tuyá»‡t vá»i',
    slug: 'ha-giang-loop-ky-quan-da',
  },
  {
    id: '4',
    name: 'MÃ¹ Cang Cháº£i - Ruá»™ng báº­c thang',
    duration: '3 ngÃ y 2 Ä‘Ãªm',
    level: 'Dá»…',
    price: '1.800.000Ä‘',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
    slug: 'mu-cang-chai-ruong-bac-thang',
  },
  {
    id: '5',
    name: 'Sapa - Thung lÅ©ng MÆ°á»ng Hoa',
    duration: '2 ngÃ y 1 Ä‘Ãªm',
    level: 'Dá»…',
    price: '1.500.000Ä‘',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800&q=80',
    badge: 'Má»›i',
    slug: 'sapa-thung-lung-muong-hoa',
  },
  {
    id: '6',
    name: 'CÃ´n Äáº£i - HÃ²n Háº£i Äáº£o',
    duration: '5 ngÃ y 4 Ä‘Ãªm',
    level: 'KhÃ¡m phÃ¡',
    price: '5.800.000Ä‘',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80',
    slug: 'con-dao-hon-hai-dao',
  },
];
