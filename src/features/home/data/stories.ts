export interface Story {
  id: string;
  category: string;
  title: string;
  image: string;
  slug: string;
}

export const stories: Story[] = [
  {
    id: '1',
    category: 'Kinh nghiá»‡m',
    title: '7 váº­t dá»¥ng khÃ´ng thá»ƒ thiáº¿u khi leo nÃºi mÃ¹a mÆ°a',
    image: 'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=800&q=80',
    slug: '7-vat-dung-khong-the-thieu',
  },
  {
    id: '2',
    category: 'Cáº£m há»©ng',
    title: 'ÄÃªm ngÃ n sao trÃªn Ä‘á»‰nh TÃ  ChÃ¬ NhÃ¹',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
    slug: 'dem-ngan-sao-ta-chi-nhu',
  },
  {
    id: '3',
    category: 'Review',
    title: 'HÃ nh trÃ¬nh khÃ¡m phÃ¡ vÄƒn hÃ³a báº£n Ä‘á»‹a HÃ  Giang',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
    slug: 'van-hoa-ban-dia-ha-giang',
  },
];
