import {
  Compass,
  Mountain,
  Package,
  RefreshCw,
  Route,
  UserRoundCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import type {
  ApplicationRow,
  GroupMatchingReviewScenario,
  GroupRecommendation,
  LifecycleStep,
  PreviewNavItem,
  WorkspaceSubTab,
} from '../types/groupMatchingTypes';

export const previewNavItems: PreviewNavItem[] = [
  {
    id: 'outsider-detail',
    label: 'Chi tiết nhóm',
    shortLabel: 'Chi tiết',
    icon: Mountain,
  },
  { id: 'discovery', label: 'Khám phá nhóm', shortLabel: 'Khám phá', icon: Compass },
  { id: 'applications', label: 'Đơn tham gia', shortLabel: 'Đơn', icon: UserRoundCheck },
  { id: 'workspace', label: 'Không gian nhóm', shortLabel: 'Nhóm', icon: Users },
  { id: 'trip', label: 'Chuyến đi & SOS', shortLabel: 'Chuyến đi', icon: Route },
];

export const lifecycleSteps: LifecycleStep[] = [
  {
    label: 'Bản nháp',
    desc: 'Khai báo nhu cầu',
    state: 'done',
    lifecycleKey: 'DRAFT',
    defaultView: 'discovery',
  },
  {
    label: 'Đang tuyển',
    desc: 'Ghép nhóm & nhận đơn',
    state: 'active',
    lifecycleKey: 'RECRUITING',
    defaultView: 'outsider-detail',
  },
  {
    label: 'Sẵn sàng',
    desc: 'Khóa danh sách & chốt kế hoạch',
    state: 'upcoming',
    lifecycleKey: 'READY',
    defaultView: 'workspace',
  },
  {
    label: 'Đang đi',
    desc: 'Theo dõi & điểm danh',
    state: 'upcoming',
    lifecycleKey: 'IN_PROGRESS',
    defaultView: 'trip',
  },
  {
    label: 'Quyết toán',
    desc: 'Chi phí & Đánh giá',
    state: 'upcoming',
    lifecycleKey: 'SETTLING',
    defaultView: 'workspace',
  },
  {
    label: 'Hoàn tất',
    desc: 'Lưu trữ kỷ niệm',
    state: 'upcoming',
    lifecycleKey: 'COMPLETED',
    defaultView: 'workspace',
  },
];

export const reviewPresets: GroupMatchingReviewScenario[] = [
  {
    id: 'preset-outsider',
    name: 'Góc nhìn Người ngoài (Outsider / Guest)',
    description: 'Người dùng chưa gia nhập nhóm, khám phá gợi ý & xem thông tin chi tiết',
    actor: 'GUEST',
    groupState: 'RECRUITING',
    network: 'ONLINE',
    locationPermission: 'PROMPT',
    activeView: 'outsider-detail',
  },
  {
    id: 'preset-waiting',
    name: 'Ứng viên Chờ duyệt (Waitlisted Applicant)',
    description: 'Đã gửi đơn tham gia, đang nằm trong danh sách chờ hoặc có Slot Offer',
    actor: 'WAITLISTED_APPLICANT',
    groupState: 'RECRUITING',
    applicationState: 'SLOT_OFFERED',
    network: 'ONLINE',
    locationPermission: 'PROMPT',
    activeView: 'applications',
  },
  {
    id: 'preset-leader',
    name: 'Trưởng nhóm Duyệt đơn (Leader Reviewing)',
    description: 'Leader xem hồ sơ ứng viên, chấp nhận/từ chối hoặc gửi offer',
    actor: 'LEADER',
    groupState: 'RECRUITING',
    applicationState: 'APPLIED',
    network: 'ONLINE',
    locationPermission: 'PROMPT',
    activeView: 'applications',
  },
  {
    id: 'preset-trip',
    name: 'Chuyến đi Thực địa & SOS (Trip & Emergency)',
    description: 'Thành viên trong hành trình, thực hiện điểm danh check-in và gửi SOS',
    actor: 'MEMBER',
    groupState: 'IN_PROGRESS',
    network: 'ONLINE',
    locationPermission: 'GRANTED',
    activeView: 'trip',
  },
  {
    id: 'preset-post-trip',
    name: 'Hậu chuyến đi (Settlement & Memories)',
    description: 'Quyết toán quỹ C2C, đánh giá thành viên và đăng album kỷ niệm',
    actor: 'MEMBER',
    groupState: 'SETTLING',
    network: 'ONLINE',
    locationPermission: 'PROMPT',
    activeView: 'workspace',
    activeWorkspaceTab: 'budget',
  },
];

export const groupRecommendations: GroupRecommendation[] = [
  {
    id: 'grp-1',
    title: 'Săn mây Lảo Thẩn — tháng 10',
    location: 'Y Tý, Lào Cai',
    date: '18–20/10/2026',
    difficulty: 'Khó',
    members: '4/7',
    match: 92,
    reasons: [
      'Trùng khoảng ngày tự do',
      'Phù hợp thể lực (Khá tốt)',
      'Ngân sách dự kiến tương đồng (~2.1M)',
    ],
    matchBreakdown: [
      { label: 'Trùng lịch tự do', score: 100, detail: '100% khớp khoảng ngày 18-20/10' },
      {
        label: 'Cấp độ thể lực',
        score: 95,
        detail: 'Yêu cầu Thể lực Khá tốt (Khớp hồ sơ của bạn)',
      },
      { label: 'Ngân sách dự kiến', score: 88, detail: 'Khoảng 2.180.000 đ/người' },
      {
        label: 'Phong cách chuyến đi',
        score: 85,
        detail: 'Tự túc, chụp ảnh săn mây, trải nghiệm C2C',
      },
    ],
    leader: {
      name: 'Hoàng Nam',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      trustScore: 4.9,
      trips: 18,
    },
    featured: true,
  },
  {
    id: 'grp-2',
    title: 'Tà Năng — Phan Dũng cuối tuần',
    location: 'Đức Trọng, Lâm Đồng',
    date: '24–25/10/2026',
    difficulty: 'Vừa',
    members: '5/8',
    match: 86,
    reasons: ['Cùng vùng miền (Miền Nam)', 'Còn 3 chỗ trống', 'Nhóm có kinh nghiệm dốc đồi'],
    matchBreakdown: [
      { label: 'Trùng lịch tự do', score: 90, detail: 'Trùng cuối tuần 24-25/10' },
      { label: 'Cấp độ thể lực', score: 85, detail: 'Yêu cầu Vừa sức (Khớp hồ sơ)' },
      { label: 'Ngân sách dự kiến', score: 82, detail: 'Khoảng 1.800.000 đ/người' },
    ],
    leader: {
      name: 'Thanh Hà',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      trustScore: 4.8,
      trips: 12,
    },
    featured: false,
  },
  {
    id: 'grp-3',
    title: 'Pù Luông mùa lúa chín',
    location: 'Bá Thước, Thanh Hóa',
    date: '01–03/11/2026',
    difficulty: 'Vừa',
    members: '3/6',
    match: 79,
    reasons: ['Ngân sách tiết kiệm (~1.4M)', 'Lịch trình linh hoạt', 'Phù hợp thích chụp ảnh'],
    matchBreakdown: [
      { label: 'Trùng lịch tự do', score: 75, detail: 'Chênh 1 ngày so với lịch lý tưởng' },
      { label: 'Cấp độ thể lực', score: 90, detail: 'Yêu cầu Nhẹ - Vừa' },
      { label: 'Ngân sách dự kiến', score: 80, detail: 'Khoảng 1.400.000 đ/người' },
    ],
    leader: {
      name: 'Minh Anh',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      trustScore: 4.7,
      trips: 9,
    },
    featured: false,
  },
];

export const applicationRows: ApplicationRow[] = [
  {
    id: 'app-1',
    group: 'Lảo Thẩn — săn mây tháng 10',
    applicantName: 'Lê Tuấn Kiệt',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    status: 'Có chỗ cho bạn (Offer)',
    appState: 'SLOT_OFFERED',
    tone: 'offer',
    meta: 'Phản hồi trước 21:30 ngày 28/08',
    action: 'Nhận chỗ ngay',
    experience: '14 chuyến trekking · Đã leo NhìU Cồ San, Pu Ta Leng',
    trustScore: 4.9,
    tripsCount: 14,
    answer:
      'Tôi đã chuẩn bị đầy đủ giày trek cổ cao, gậy leo núi và lều 2 người. Rất mong được đồng hành cùng nhóm!',
    isSelf: true,
  },
  {
    id: 'app-2',
    group: 'Cung Tà Năng cuối tuần',
    applicantName: 'Trần Nguyễn Ngọc',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    status: 'Đang chờ duyệt',
    appState: 'APPLIED',
    tone: 'pending',
    meta: 'Đã gửi 2 ngày trước · Leader đang xem xét',
    action: 'Xem đơn & Duyệt',
    experience: '6 chuyến trekking · Đã đi Bidoup, Chứa Chan',
    trustScore: 4.7,
    tripsCount: 6,
    answer:
      'Mình tập thể lực chạy bộ 5km/ngày, có thể chủ động lều cắm trại và mang theo túi y tế.',
  },
  {
    id: 'app-3',
    group: 'Bidoup — nhóm chụp ảnh',
    applicantName: 'Nguyễn Văn Hải',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    status: 'Danh sách chờ (Waitlist)',
    appState: 'WAITLISTED',
    tone: 'waitlist',
    meta: 'Nhóm đang đủ 6/6 thành viên · Chờ slot hủy',
    action: 'Chi tiết vị trí chờ',
    experience: '10 chuyến trekking · Thích chụp ảnh bối cảnh tự nhiên',
    trustScore: 4.8,
    tripsCount: 10,
    answer: 'Sẵn sàng bổ sung nếu có thành viên rút lui phút chót.',
  },
];

export const workspaceNav = [
  { id: 'overview' as WorkspaceSubTab, label: 'Tổng quan', icon: Compass },
  { id: 'itinerary' as WorkspaceSubTab, label: 'Lộ trình & Checkpoints', icon: Route },
  { id: 'budget' as WorkspaceSubTab, label: 'Chi phí & Quỹ (C2C)', icon: WalletCards },
  { id: 'members' as WorkspaceSubTab, label: 'Thành viên nhóm', icon: Users },
  { id: 'equipment' as WorkspaceSubTab, label: 'Đồ dùng chuyến đi', icon: Package },
  { id: 'succession' as WorkspaceSubTab, label: 'Chuyển giao Leader', icon: RefreshCw },
];
