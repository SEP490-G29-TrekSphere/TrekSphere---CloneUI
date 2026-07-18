export interface Review {
  id: string;
  name: string;
  avatar: string;
  location: string;
  tourName: string;
  rating: number;
  quote: string;
}

export const travelerReviews: Review[] = [
  {
    id: '1',
    name: 'Nguyễn Minh Tâm',
    avatar: 'https://i.pravatar.cc/120?img=33',
    location: 'Hà Nội',
    tourName: 'Fansipan - Nóc nhà Đông Dương',
    rating: 5,
    quote:
      'Chuyến trekking tuyệt vời nhất tôi từng tham gia! Đội ngũ hướng dẫn viên vô cùng chu đáo, chuyên nghiệp và đảm bảo an toàn tuyệt đối suốt chặng đường leo Fansipan.',
  },
  {
    id: '2',
    name: 'Trần Hoàng Long',
    avatar: 'https://i.pravatar.cc/120?img=12',
    location: 'TP. Hồ Chí Minh',
    tourName: 'Tà Năng - Phan Dũng',
    rating: 5,
    quote:
      'Hành trình Tà Năng Phan Dũng mang lại trải nghiệm phiêu lưu trọn vẹn, cảnh sắc núi đồi hùng vĩ khó quên. Khâu chuẩn bị hậu cần của TrekSphere cực kỳ bài bản và chuyên nghiệp.',
  },
  {
    id: '3',
    name: 'Phạm Thị Hải Yến',
    avatar: 'https://i.pravatar.cc/120?img=47',
    location: 'Đà Nẵng',
    tourName: 'Hà Giang Loop - Kỳ quan đá',
    rating: 5,
    quote:
      'Mọi thứ từ lịch trình, dịch vụ homestay đến các điểm dừng nghỉ đều được TrekSphere chăm chút tỉ mỉ. Thật sự đáng giá từng xu bỏ ra để khám phá vẻ đẹp hoang sơ Hà Giang.',
  },
];
