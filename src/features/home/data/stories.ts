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
    category: 'Kinh nghiệm',
    title: '7 vật dụng không thể thiếu khi leo núi mùa mưa',
    image: 'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=800&q=80',
    slug: '7-vat-dung-khong-the-thieu',
  },
  {
    id: '2',
    category: 'Cảm hứng',
    title: 'Đêm ngàn sao trên đỉnh Tà Chí Nhù',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
    slug: 'dem-ngan-sao-ta-chi-nhu',
  },
  {
    id: '3',
    category: 'Review',
    title: 'Hành trình khám phá văn hóa bản địa Hà Giang',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
    slug: 'van-hoa-ban-dia-ha-giang',
  },
];
