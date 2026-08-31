import type { TourPaymentPolicy } from '@/features/payments/types';
import type {
  ApiDifficulty,
  ApiStatus,
  ReviewItem,
  TourApiItem,
  TourCheckpoint,
  TourDetailFromApi,
  TourDetailImageApi,
  TourDetailScheduleApi,
  TourParticipationPolicy,
} from '@/features/tours/types';
import type { CancellationPolicy } from '@/features/vendor-cancellation-policies/types';

/**
 * Module dữ liệu "tour database" dùng chung cho demo mock (không backend thật).
 *
 * Vendor duy nhất trong demo là `VENDOR_ID` — sở hữu toàn bộ `mockTours`, được
 * quản lý bởi `user-vendor-manager-1` / `user-vendor-staff-1` (xem
 * `src/mocks/data/users.ts`). Cả tour công khai (`tours.ts` handler) lẫn khu
 * vực quản lý vendor (`vendor-tours.ts`, `vendor-sessions.ts`) đọc/ghi cùng
 * mảng `mockTours` này để dữ liệu nhất quán trong suốt phiên demo.
 */

export const VENDOR_ID = 'vendor-treksphere-1';
export const VENDOR_NAME = 'TrekSphere Adventures';
export const VENDOR_MANAGER_ID = 'user-vendor-manager-1';
export const VENDOR_LOGO_URL = 'https://picsum.photos/seed/vendor-treksphere-logo/200/200';
export const VENDOR_CONTACT_EMAIL = 'manager@treksphere.vn';
export const VENDOR_CONTACT_PHONE = '0900000003';
const CREATOR_ID = 'user-vendor-staff-1';
const CREATOR_NAME = 'Lê Văn Đối Tác';
const CREATOR_EMAIL = 'partner@treksphere.vn';

/** Ngày "hôm nay" trong bối cảnh demo — dùng làm mốc sinh lịch khởi hành. */
const TODAY = new Date('2026-08-29T00:00:00.000Z');

function iso(daysFromToday: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function isoDateTime(daysFromToday: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString();
}

let scheduleSeq = 1;
let checkpointSeq = 1;
let imageSeq = 1;
let reviewSeq = 1;

export interface MockSchedule extends TourDetailScheduleApi {}

export interface MockCheckpoint extends TourCheckpoint {}

export interface MockTour {
  tourId: string;
  slug: string;
  tourName: string;
  description: string;
  difficulty: ApiDifficulty;
  location: string;
  durationDays: number;
  basePrice: number;
  minCapacity: number;
  maxCapacity: number;
  totalDistanceKm: number;
  highlights: string;
  includes: string;
  excludes: string;
  coverImageUrl: string;
  status: ApiStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
  category?: string;
  images: TourDetailImageApi[];
  schedules: MockSchedule[];
  checkpoints: MockCheckpoint[];
  reviews: ReviewItem[];
  participationPolicy: TourParticipationPolicy | null;
  /** Chỉ set khi tour đã (hoặc từng) APPROVED — chi phối `onlineBookingEnabled`. */
  paymentPolicy?: TourPaymentPolicy;
  /** True nếu tour đủ điều kiện gắn chính sách hủy chung của vendor vào detail. */
  hasCancellationPolicies: boolean;
}

/** Chính sách hủy chung của vendor — dùng cho `vendor-cancellation-policies.ts` VÀ nhúng vào tour detail. */
export const mockCancellationPolicies: CancellationPolicy[] = [
  {
    cancellationPolicyId: 'policy-1',
    cancelBeforeDays: 14,
    refundPercentage: 100,
    description: 'Hủy trước 14 ngày so với ngày khởi hành: hoàn 100% chi phí tour.',
    isActive: true,
  },
  {
    cancellationPolicyId: 'policy-2',
    cancelBeforeDays: 7,
    refundPercentage: 50,
    description: 'Hủy trước 7 ngày so với ngày khởi hành: hoàn 50% chi phí tour.',
    isActive: true,
  },
  {
    cancellationPolicyId: 'policy-3',
    cancelBeforeDays: 3,
    refundPercentage: 0,
    description: 'Hủy trong vòng 3 ngày trước khởi hành: không hoàn tiền.',
    isActive: true,
  },
];

function makeImages(slug: string, count: number): TourDetailImageApi[] {
  return Array.from({ length: count }, (_, i) => ({
    imageId: `img-${imageSeq++}`,
    imageUrl: `https://picsum.photos/seed/${slug}-${i + 1}/800/600`,
    sortOrder: i,
    caption: null,
  }));
}

function makeCheckpoints(
  tourId: string,
  items: Array<{ name: string; desc: string; lat: number; lng: number; alt: number }>
): MockCheckpoint[] {
  return items.map((item, i) => ({
    checkpointId: `chk-${checkpointSeq++}`,
    tourId,
    checkpointName: item.name,
    description: item.desc,
    latitude: item.lat,
    longitude: item.lng,
    altitude: item.alt,
    checkpointOrder: i + 1,
    checkpointImageUrl: `https://picsum.photos/seed/${tourId}-chk-${i + 1}/600/400`,
    checkpointImageUrls: [`https://picsum.photos/seed/${tourId}-chk-${i + 1}/600/400`],
  }));
}

function makeSchedule(
  tourId: string,
  departureDaysFromToday: number,
  durationDays: number,
  price: number,
  availableSlots: number,
  bookedSlots: number,
  status: MockSchedule['status']
): MockSchedule {
  return {
    scheduleId: `sch-${scheduleSeq++}`,
    tourId,
    departureDate: iso(departureDaysFromToday),
    returnDate: iso(departureDaysFromToday + durationDays - 1),
    availableSlots,
    bookedSlots,
    price,
    status,
    isDeleted: false,
    createdAt: isoDateTime(-30),
    updatedAt: isoDateTime(-30),
    createdBy: CREATOR_ID,
    updatedBy: CREATOR_ID,
    deletedAt: null,
    deletedBy: null,
  };
}

function makeReview(tourId: string, rating: number, content: string, author: string): ReviewItem {
  return {
    reviewId: `review-${reviewSeq++}`,
    rating,
    content,
    status: 'APPROVED',
    userId: 'user-trekker-1',
    userFullName: author,
    userAvatarUrl: `https://picsum.photos/seed/${author}/100/100`,
    tourId,
    tourName: '',
    tourCoverImageUrl: null,
    bookingId: `booking-demo-${reviewSeq}`,
    bookingCode: `TS${1000 + reviewSeq}`,
    createdAt: isoDateTime(-Math.floor(Math.random() * 60) - 10),
    updatedAt: isoDateTime(-Math.floor(Math.random() * 60) - 10),
  };
}

function participationPolicy(
  tourId: string,
  overrides: Partial<TourParticipationPolicy> = {}
): TourParticipationPolicy {
  return {
    tourId,
    policyVersion: 1,
    minAge: 16,
    maxAge: null,
    minHeightCm: null,
    maxHeightCm: null,
    minWeightKg: null,
    maxWeightKg: null,
    fitnessLevel: 'MODERATE',
    healthRequirements: 'Không mắc bệnh tim mạch, huyết áp cao.',
    restrictedMedicalConditions: null,
    requiredExperience: null,
    requiredSkills: null,
    requiredEquipment: 'Giày trekking, áo mưa, đèn pin đội đầu.',
    requiredDocuments: 'CMND/CCCD hoặc hộ chiếu.',
    requiresHealthDeclaration: true,
    requiresMedicalCertificate: false,
    guardianRequiredUnderAge: 16,
    additionalRequirements: null,
    ...overrides,
  };
}

function paymentPolicy(tourId: string): TourPaymentPolicy {
  return {
    tourId,
    paymentOption: 'FULL_OR_DEPOSIT',
    depositType: 'PERCENTAGE',
    depositValue: 30,
    remainingDueDaysBeforeDeparture: 7,
    policyVersion: 1,
  };
}

export const mockTours: MockTour[] = [
  {
    tourId: 'tour-fansipan',
    slug: 'fansipan',
    tourName: 'Chinh phục đỉnh Fansipan - Nóc nhà Đông Dương',
    description:
      'Hành trình 3 ngày 2 đêm chinh phục đỉnh Fansipan (3.143m) qua cung đường Trạm Tôn, băng rừng nguyên sinh, vượt suối và ngủ lán giữa núi rừng Hoàng Liên Sơn.',
    difficulty: 'HARD',
    location: 'Sa Pa, Lào Cai',
    durationDays: 3,
    basePrice: 3500000,
    minCapacity: 4,
    maxCapacity: 15,
    totalDistanceKm: 19,
    highlights:
      'Chinh phục nóc nhà Đông Dương; Ngắm biển mây Hoàng Liên Sơn; Trải nghiệm rừng trúc, rừng đỗ quyên cổ thụ',
    includes: 'Porter khuân vác; Lều trại, túi ngủ; Ăn 3 bữa/ngày; Bảo hiểm du lịch; HDV bản địa',
    excludes: 'Chi phí cá nhân; Vé cáp treo (nếu xuống bằng cáp treo); Đồ uống có cồn',
    coverImageUrl: 'https://picsum.photos/seed/fansipan-cover/800/600',
    status: 'APPROVED',
    isDeleted: false,
    createdAt: isoDateTime(-90),
    updatedAt: isoDateTime(-10),
    category: 'Trekking núi cao',
    images: makeImages('fansipan', 4),
    checkpoints: makeCheckpoints('tour-fansipan', [
      {
        name: 'Trạm Tôn',
        desc: 'Điểm xuất phát, độ cao 1.940m.',
        lat: 22.348,
        lng: 103.775,
        alt: 1940,
      },
      {
        name: 'Trạm nghỉ 2.200m',
        desc: 'Lán nghỉ giữa rừng trúc.',
        lat: 22.339,
        lng: 103.78,
        alt: 2200,
      },
      { name: 'Lán 2.800m', desc: 'Điểm cắm trại qua đêm.', lat: 22.328, lng: 103.785, alt: 2800 },
      {
        name: 'Đỉnh Fansipan',
        desc: 'Nóc nhà Đông Dương, độ cao 3.143m.',
        lat: 22.303,
        lng: 103.775,
        alt: 3143,
      },
    ]),
    schedules: [
      makeSchedule('tour-fansipan', 10, 3, 3500000, 15, 6, 'OPEN'),
      makeSchedule('tour-fansipan', 24, 3, 3500000, 15, 2, 'OPEN'),
      makeSchedule('tour-fansipan', -20, 3, 3400000, 15, 15, 'COMPLETED'),
    ],
    reviews: [
      makeReview(
        'tour-fansipan',
        5,
        'Cảnh đẹp choáng ngợp, porter hỗ trợ rất nhiệt tình!',
        'Nguyễn Văn Trekker'
      ),
      makeReview(
        'tour-fansipan',
        4,
        'Hành trình khá vất vả nhưng xứng đáng, HDV chuyên nghiệp.',
        'Trần Minh Anh'
      ),
    ],
    participationPolicy: participationPolicy('tour-fansipan', {
      fitnessLevel: 'HIGH',
      requiredExperience: 'Đã từng trekking ít nhất 1 cung đường 2 ngày trở lên.',
    }),
    paymentPolicy: paymentPolicy('tour-fansipan'),
    hasCancellationPolicies: true,
  },
  {
    tourId: 'tour-ta-xua',
    slug: 'ta-xua',
    tourName: 'Săn mây Tà Xùa - Sống lưng khủng long',
    description:
      'Trekking 2 ngày 1 đêm khám phá Tà Xùa huyền thoại với cung đường "Sống lưng khủng long" nổi tiếng, săn mây lúc bình minh và ngắm rừng chè cổ thụ hàng trăm năm tuổi.',
    difficulty: 'MODERATE',
    location: 'Bắc Yên, Sơn La',
    durationDays: 2,
    basePrice: 1800000,
    minCapacity: 4,
    maxCapacity: 20,
    totalDistanceKm: 12,
    highlights: 'Sống lưng khủng long; Biển mây Tà Xùa; Rừng chè Shan tuyết cổ thụ',
    includes: 'Xe đưa đón từ Hà Nội; Lều trại; Ăn uống theo hành trình; HDV; Bảo hiểm',
    excludes: 'Đồ uống cá nhân; Chi phí phát sinh ngoài chương trình',
    coverImageUrl: 'https://picsum.photos/seed/ta-xua-cover/800/600',
    status: 'APPROVED',
    isDeleted: false,
    createdAt: isoDateTime(-80),
    updatedAt: isoDateTime(-5),
    category: 'Săn mây',
    images: makeImages('ta-xua', 4),
    checkpoints: makeCheckpoints('tour-ta-xua', [
      {
        name: 'Bản Tà Xùa',
        desc: 'Điểm tập kết, chuẩn bị trang thiết bị.',
        lat: 21.207,
        lng: 104.34,
        alt: 1600,
      },
      {
        name: 'Sống lưng khủng long',
        desc: 'Cung đường sống núi hẹp nổi tiếng.',
        lat: 21.22,
        lng: 104.35,
        alt: 1800,
      },
      {
        name: 'Đỉnh Tà Xùa',
        desc: 'Điểm cao nhất, ngắm biển mây.',
        lat: 21.23,
        lng: 104.36,
        alt: 2865,
      },
    ]),
    schedules: [
      makeSchedule('tour-ta-xua', 6, 2, 1800000, 20, 12, 'OPEN'),
      makeSchedule('tour-ta-xua', 18, 2, 1800000, 20, 4, 'OPEN'),
      makeSchedule('tour-ta-xua', -15, 2, 1700000, 20, 18, 'COMPLETED'),
    ],
    reviews: [
      makeReview(
        'tour-ta-xua',
        5,
        'Săn mây thành công, view sống lưng khủng long đẹp không tưởng!',
        'Phạm Thu Hà'
      ),
      makeReview(
        'tour-ta-xua',
        5,
        'Phù hợp người mới bắt đầu trekking, tổ chức chu đáo.',
        'Nguyễn Văn Trekker'
      ),
      makeReview(
        'tour-ta-xua',
        4,
        'Đường hơi trơn trượt vào sáng sớm, nên mang giày tốt.',
        'Lê Quốc Bảo'
      ),
    ],
    participationPolicy: participationPolicy('tour-ta-xua', { minAge: 12, fitnessLevel: 'BASIC' }),
    paymentPolicy: paymentPolicy('tour-ta-xua'),
    hasCancellationPolicies: true,
  },
  {
    tourId: 'tour-bidoup',
    slug: 'bidoup',
    tourName: 'Rừng quốc gia Bidoup - Núi Bà Đà Lạt hoang sơ',
    description:
      'Khám phá hệ sinh thái rừng nguyên sinh Bidoup - Núi Bà, một trong những khu dự trữ sinh quyển đa dạng nhất Việt Nam, phù hợp cho người mới bắt đầu trekking.',
    difficulty: 'EASY',
    location: 'Lạc Dương, Lâm Đồng',
    durationDays: 2,
    basePrice: 1500000,
    minCapacity: 4,
    maxCapacity: 25,
    totalDistanceKm: 10,
    highlights: 'Rừng nguyên sinh Bidoup; Thác Thiên Thai; Đa dạng sinh học quý hiếm',
    includes: 'Ăn 3 bữa; Lều trại; HDV kiểm lâm; Vé vào cổng khu bảo tồn',
    excludes: 'Xe di chuyển từ Đà Lạt; Đồ uống cá nhân',
    coverImageUrl: 'https://picsum.photos/seed/bidoup-cover/800/600',
    status: 'APPROVED',
    isDeleted: false,
    createdAt: isoDateTime(-70),
    updatedAt: isoDateTime(-3),
    category: 'Sinh thái rừng',
    images: makeImages('bidoup', 4),
    checkpoints: makeCheckpoints('tour-bidoup', [
      {
        name: 'Trạm kiểm lâm Bidoup',
        desc: 'Điểm xuất phát, đăng ký hành trình.',
        lat: 12.15,
        lng: 108.65,
        alt: 1650,
      },
      {
        name: 'Thác Thiên Thai',
        desc: 'Điểm nghỉ chân, tắm suối.',
        lat: 12.17,
        lng: 108.66,
        alt: 1700,
      },
      {
        name: 'Đỉnh Núi Bà',
        desc: 'Điểm ngắm toàn cảnh cao nguyên.',
        lat: 12.19,
        lng: 108.68,
        alt: 2167,
      },
    ]),
    schedules: [
      makeSchedule('tour-bidoup', 4, 2, 1500000, 25, 20, 'OPEN'),
      makeSchedule('tour-bidoup', 16, 2, 1500000, 25, 5, 'OPEN'),
    ],
    reviews: [
      makeReview(
        'tour-bidoup',
        5,
        'Rất phù hợp gia đình có trẻ nhỏ, rừng đẹp và mát.',
        'Đỗ Thị Ngọc'
      ),
      makeReview(
        'tour-bidoup',
        4,
        'HDV am hiểu hệ sinh thái, giải thích rất thú vị.',
        'Nguyễn Văn Trekker'
      ),
    ],
    participationPolicy: participationPolicy('tour-bidoup', {
      minAge: 8,
      fitnessLevel: 'ANY',
      guardianRequiredUnderAge: 12,
    }),
    paymentPolicy: paymentPolicy('tour-bidoup'),
    hasCancellationPolicies: true,
  },
  {
    tourId: 'tour-lao-than',
    slug: 'lao-than',
    tourName: 'Lảo Thẩn - Sơn nữ Y Tý mùa săn mây',
    description:
      'Lảo Thẩn được mệnh danh là "sơn nữ" của vùng Y Tý, cung trekking 2 ngày với cảnh quan ruộng bậc thang, bản làng người Hà Nhì và biển mây tuyệt đẹp.',
    difficulty: 'MODERATE',
    location: 'Y Tý, Lào Cai',
    durationDays: 2,
    basePrice: 1900000,
    minCapacity: 4,
    maxCapacity: 18,
    totalDistanceKm: 14,
    highlights: 'Biển mây Y Tý; Bản làng người Hà Nhì; Ruộng bậc thang mùa nước đổ',
    includes: 'Xe từ Lào Cai; Lều trại; Ăn uống; HDV bản địa',
    excludes: 'Vé xe từ Hà Nội đi Lào Cai; Chi phí cá nhân',
    coverImageUrl: 'https://picsum.photos/seed/lao-than-cover/800/600',
    status: 'PENDING_APPROVAL',
    isDeleted: false,
    createdAt: isoDateTime(-5),
    updatedAt: isoDateTime(-1),
    category: 'Săn mây',
    images: makeImages('lao-than', 3),
    checkpoints: makeCheckpoints('tour-lao-than', [
      {
        name: 'Bản Phìn Hồ',
        desc: 'Điểm tập kết, làm quen với người Hà Nhì.',
        lat: 22.62,
        lng: 103.63,
        alt: 1850,
      },
      {
        name: 'Lán nghỉ 2.400m',
        desc: 'Điểm cắm trại qua đêm.',
        lat: 22.63,
        lng: 103.64,
        alt: 2400,
      },
      {
        name: 'Đỉnh Lảo Thẩn',
        desc: 'Đỉnh núi 2.860m, ngắm biển mây.',
        lat: 22.64,
        lng: 103.65,
        alt: 2860,
      },
    ]),
    schedules: [makeSchedule('tour-lao-than', 30, 2, 1900000, 18, 0, 'OPEN')],
    reviews: [],
    participationPolicy: participationPolicy('tour-lao-than', { minAge: 14 }),
    hasCancellationPolicies: false,
  },
  {
    tourId: 'tour-putaleng',
    slug: 'putaleng',
    tourName: 'Putaleng - Vương quốc hoa đỗ quyên cổ thụ',
    description:
      'Putaleng (3.049m) sở hữu rừng đỗ quyên cổ thụ hàng trăm năm tuổi lớn nhất Việt Nam. Cung đường 3 ngày 2 đêm dành cho trekker có kinh nghiệm.',
    difficulty: 'EXPERT',
    location: 'Tam Đường, Lai Châu',
    durationDays: 3,
    basePrice: 3200000,
    minCapacity: 4,
    maxCapacity: 12,
    totalDistanceKm: 22,
    highlights:
      'Rừng đỗ quyên cổ thụ lớn nhất Việt Nam; Đỉnh Putaleng 3.049m; Thảm thực vật nguyên sinh',
    includes: 'Porter; Lều trại 4 mùa; Ăn uống đầy đủ; HDV + trợ lý HDV; Bảo hiểm',
    excludes: 'Trang thiết bị cá nhân; Đồ uống có cồn',
    coverImageUrl: 'https://picsum.photos/seed/putaleng-cover/800/600',
    status: 'APPROVED',
    isDeleted: false,
    createdAt: isoDateTime(-60),
    updatedAt: isoDateTime(-8),
    category: 'Trekking núi cao',
    images: makeImages('putaleng', 4),
    checkpoints: makeCheckpoints('tour-putaleng', [
      { name: 'Bản Hồ Thầu', desc: 'Điểm xuất phát.', lat: 22.42, lng: 103.5, alt: 1400 },
      {
        name: 'Rừng đỗ quyên cổ thụ',
        desc: 'Khu rừng hoa đỗ quyên trăm năm tuổi.',
        lat: 22.43,
        lng: 103.51,
        alt: 2300,
      },
      { name: 'Lán 2.700m', desc: 'Điểm cắm trại đêm 2.', lat: 22.44, lng: 103.52, alt: 2700 },
      {
        name: 'Đỉnh Putaleng',
        desc: 'Đỉnh núi cao thứ 3 Việt Nam, 3.049m.',
        lat: 22.45,
        lng: 103.53,
        alt: 3049,
      },
    ]),
    schedules: [
      makeSchedule('tour-putaleng', 14, 3, 3200000, 12, 8, 'OPEN'),
      makeSchedule('tour-putaleng', 45, 3, 3300000, 12, 1, 'OPEN'),
    ],
    reviews: [
      makeReview(
        'tour-putaleng',
        5,
        'Rừng đỗ quyên đẹp mê hồn, đáng để chinh phục dù rất mệt.',
        'Vũ Đình Long'
      ),
    ],
    participationPolicy: participationPolicy('tour-putaleng', {
      fitnessLevel: 'HIGH',
      requiredExperience: 'Bắt buộc đã hoàn thành ít nhất 1 tour HARD trở lên.',
      requiresMedicalCertificate: true,
    }),
    paymentPolicy: paymentPolicy('tour-putaleng'),
    hasCancellationPolicies: true,
  },
  {
    tourId: 'tour-ngu-chi-son',
    slug: 'ngu-chi-son',
    tourName: 'Ngũ Chỉ Sơn - Cung leo kỹ thuật cho dân trekking lâu năm',
    description:
      'Ngũ Chỉ Sơn với 5 mỏm đá nhọn như bàn tay xòe là một trong những cung trekking kỹ thuật khó nhất miền Bắc, yêu cầu dùng dây và các thiết bị leo núi chuyên dụng.',
    difficulty: 'EXPERT',
    location: 'Tam Đường, Lai Châu',
    durationDays: 2,
    basePrice: 2700000,
    minCapacity: 4,
    maxCapacity: 10,
    totalDistanceKm: 16,
    highlights: '5 mỏm đá kỳ vĩ; Đoạn leo vách dựng đứng; View toàn cảnh dãy Hoàng Liên Sơn',
    includes: 'Thiết bị leo núi (dây, đai an toàn); HDV kỹ thuật; Ăn uống; Bảo hiểm rủi ro cao',
    excludes: 'Bảo hiểm y tế cá nhân; Trang phục cá nhân',
    coverImageUrl: 'https://picsum.photos/seed/ngu-chi-son-cover/800/600',
    status: 'REJECTED',
    isDeleted: false,
    createdAt: isoDateTime(-12),
    updatedAt: isoDateTime(-2),
    category: 'Trekking kỹ thuật',
    images: makeImages('ngu-chi-son', 3),
    checkpoints: makeCheckpoints('tour-ngu-chi-son', [
      { name: 'Bản Sín Chải', desc: 'Điểm tập kết.', lat: 22.4, lng: 103.65, alt: 1500 },
      {
        name: 'Chân Ngũ Chỉ Sơn',
        desc: 'Điểm bắt đầu đoạn leo kỹ thuật.',
        lat: 22.41,
        lng: 103.66,
        alt: 2200,
      },
      {
        name: 'Mỏm đá thứ 3',
        desc: 'Điểm cao nhất có thể tiếp cận an toàn.',
        lat: 22.42,
        lng: 103.67,
        alt: 2858,
      },
    ]),
    schedules: [],
    reviews: [],
    participationPolicy: participationPolicy('tour-ngu-chi-son', {
      fitnessLevel: 'EXTREME',
      requiredExperience: 'Đã có kinh nghiệm leo núi kỹ thuật (via ferrata/rock climbing).',
      requiredSkills: 'Sử dụng dây, đai an toàn, di chuyển trên vách đá.',
      requiresMedicalCertificate: true,
    }),
    hasCancellationPolicies: false,
  },
  {
    tourId: 'tour-nam-kang-ho-tao',
    slug: 'nam-kang-ho-tao',
    tourName: 'Nam Kang Ho Tao - Đỉnh núi tử thần',
    description:
      'Nam Kang Ho Tao được giới trekking gọi là "đỉnh núi tử thần" bởi độ khó và tỷ lệ tai nạn cao. Cung đường 3 ngày xuyên rừng nguyên sinh, nhiều đoạn dốc dựng đứng và vượt thác.',
    difficulty: 'EXPERT',
    location: 'Mù Cang Chải, Yên Bái',
    durationDays: 3,
    basePrice: 3800000,
    minCapacity: 4,
    maxCapacity: 10,
    totalDistanceKm: 25,
    highlights:
      'Cung đường huyền thoại giới trekking; Rừng nguyên sinh rậm rạp; Nhiều thác nước hùng vĩ',
    includes: 'Porter chuyên nghiệp; Lều trại chuyên dụng; Ăn uống; HDV + đội cứu hộ đi kèm',
    excludes: 'Bảo hiểm rủi ro cao (mua riêng); Trang thiết bị cá nhân',
    coverImageUrl: 'https://picsum.photos/seed/nam-kang-ho-tao-cover/800/600',
    status: 'DRAFT',
    isDeleted: false,
    createdAt: isoDateTime(-1),
    updatedAt: isoDateTime(-1),
    category: 'Trekking kỹ thuật',
    images: makeImages('nam-kang-ho-tao', 2),
    checkpoints: makeCheckpoints('tour-nam-kang-ho-tao', [
      { name: 'Bản Thào Chua Chải', desc: 'Điểm xuất phát.', lat: 21.75, lng: 104.05, alt: 1200 },
      { name: 'Thác 7 tầng', desc: 'Điểm vượt thác khó.', lat: 21.76, lng: 104.06, alt: 1900 },
    ]),
    schedules: [],
    reviews: [],
    participationPolicy: participationPolicy('tour-nam-kang-ho-tao', {
      fitnessLevel: 'EXTREME',
      requiredExperience: 'Chỉ nhận khách đã hoàn thành tối thiểu 2 tour EXPERT.',
      requiresMedicalCertificate: true,
    }),
    hasCancellationPolicies: false,
  },
  {
    tourId: 'tour-ta-nang-phan-dung',
    slug: 'ta-nang-phan-dung',
    tourName: 'Tà Năng - Phan Dũng - Cung trekking đẹp nhất Việt Nam',
    description:
      'Cung đường trekking băng qua 3 tỉnh Lâm Đồng - Ninh Thuận - Bình Thuận, nổi tiếng với những đồi cỏ tranh trải dài bất tận, được mệnh danh đẹp nhất Việt Nam.',
    difficulty: 'MODERATE',
    location: 'Đức Trọng, Lâm Đồng',
    durationDays: 2,
    basePrice: 2100000,
    minCapacity: 6,
    maxCapacity: 30,
    totalDistanceKm: 55,
    highlights: 'Đồi cỏ tranh bất tận; Băng qua 3 tỉnh; Hoàng hôn trên đồi thông',
    includes: 'Xe đưa đón; Lều trại; Ăn uống; HDV; Xe trung chuyển hành lý',
    excludes: 'Vé máy bay/tàu đến Đà Lạt; Chi phí cá nhân',
    coverImageUrl: 'https://picsum.photos/seed/ta-nang-phan-dung-cover/800/600',
    status: 'HIDDEN',
    isDeleted: false,
    createdAt: isoDateTime(-120),
    updatedAt: isoDateTime(-4),
    category: 'Trekking đồi cỏ',
    images: makeImages('ta-nang-phan-dung', 4),
    checkpoints: makeCheckpoints('tour-ta-nang-phan-dung', [
      { name: 'Xã Tà Năng', desc: 'Điểm xuất phát.', lat: 11.63, lng: 108.55, alt: 900 },
      {
        name: 'Đồi cỏ tranh',
        desc: 'Điểm ngắm cảnh và cắm trại.',
        lat: 11.55,
        lng: 108.6,
        alt: 1100,
      },
      { name: 'Xã Phan Dũng', desc: 'Điểm kết thúc hành trình.', lat: 11.4, lng: 108.68, alt: 300 },
    ]),
    schedules: [
      makeSchedule('tour-ta-nang-phan-dung', 8, 2, 2100000, 30, 10, 'OPEN'),
      makeSchedule('tour-ta-nang-phan-dung', -30, 2, 2000000, 30, 30, 'COMPLETED'),
    ],
    reviews: [
      makeReview(
        'tour-ta-nang-phan-dung',
        5,
        'Đẹp như phim, đồi cỏ tranh cực kỳ thơ mộng lúc hoàng hôn.',
        'Ngô Bảo Châu'
      ),
    ],
    participationPolicy: participationPolicy('tour-ta-nang-phan-dung', {
      minAge: 10,
      fitnessLevel: 'BASIC',
    }),
    paymentPolicy: paymentPolicy('tour-ta-nang-phan-dung'),
    hasCancellationPolicies: true,
  },
];

export function findTourById(tourId: string): MockTour | undefined {
  return mockTours.find((t) => t.tourId === tourId);
}

export function findScheduleById(
  scheduleId: string
): { tour: MockTour; schedule: MockSchedule } | undefined {
  for (const tour of mockTours) {
    const schedule = tour.schedules.find((s) => s.scheduleId === scheduleId);
    if (schedule) return { tour, schedule };
  }
  return undefined;
}

export function findCheckpointById(
  checkpointId: string
): { tour: MockTour; checkpoint: MockCheckpoint } | undefined {
  for (const tour of mockTours) {
    const checkpoint = tour.checkpoints.find((c) => c.checkpointId === checkpointId);
    if (checkpoint) return { tour, checkpoint };
  }
  return undefined;
}

export function nextTourId(): string {
  return `tour-new-${Date.now()}`;
}

export function nextScheduleId(): string {
  return `sch-${scheduleSeq++}`;
}

export function nextCheckpointId(): string {
  return `chk-${checkpointSeq++}`;
}

/** Map `MockTour` -> `TourApiItem` (dùng cho `GET /tours` list công khai). */
export function toTourApiItem(t: MockTour): TourApiItem {
  const totalReviews = t.reviews.length;
  const averageRating =
    totalReviews > 0
      ? Number((t.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : null;
  return {
    tourId: t.tourId,
    tourName: t.tourName,
    location: t.location,
    durationDays: t.durationDays,
    basePrice: t.basePrice,
    minCapacity: t.minCapacity,
    maxCapacity: t.maxCapacity,
    totalDistanceKm: t.totalDistanceKm,
    difficulty: t.difficulty,
    status: t.status,
    coverImageUrl: t.coverImageUrl,
    highlights: t.highlights,
    includes: t.includes,
    excludes: t.excludes,
    vendorId: VENDOR_ID,
    vendorName: VENDOR_NAME,
    averageRating,
    totalReviews,
    createdAt: t.createdAt,
    category: t.category,
    onlineBookingEnabled: Boolean(t.paymentPolicy && t.participationPolicy),
    onlineBookingDisabledReason: t.paymentPolicy ? null : 'Tour chưa sẵn sàng nhận đặt online.',
  };
}

/** Map `MockTour` -> `TourDetailFromApi` (dùng cho `GET /tours/{id}` công khai — cũng là nguồn cho form Sửa của vendor). */
export function toTourDetailFromApi(t: MockTour): TourDetailFromApi {
  const totalReviews = t.reviews.length;
  const averageRating =
    totalReviews > 0
      ? Number((t.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : null;
  return {
    tourId: t.tourId,
    tourName: t.tourName,
    description: t.description,
    difficulty: t.difficulty,
    location: t.location,
    durationDays: t.durationDays,
    basePrice: t.basePrice,
    minCapacity: t.minCapacity,
    maxCapacity: t.maxCapacity,
    totalDistanceKm: t.totalDistanceKm,
    highlights: t.highlights,
    includes: t.includes,
    excludes: t.excludes,
    coverImageUrl: t.coverImageUrl,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    vendorId: VENDOR_ID,
    vendorManagerId: VENDOR_MANAGER_ID,
    vendorName: VENDOR_NAME,
    vendorLogoUrl: VENDOR_LOGO_URL,
    vendorContactEmail: VENDOR_CONTACT_EMAIL,
    vendorContactPhone: VENDOR_CONTACT_PHONE,
    creatorId: CREATOR_ID,
    creatorName: CREATOR_NAME,
    creatorEmail: CREATOR_EMAIL,
    images: t.images,
    schedules: t.schedules,
    cancellationPolicies: t.hasCancellationPolicies ? mockCancellationPolicies : undefined,
    paymentPolicy: t.paymentPolicy,
    participationPolicy: t.participationPolicy,
    onlineBookingEnabled: Boolean(t.paymentPolicy && t.participationPolicy),
    onlineBookingDisabledReason: t.paymentPolicy
      ? undefined
      : 'Tour chưa sẵn sàng nhận đặt online.',
    nonRefundableCost: 0,
    averageRating,
    totalReviews,
  };
}
