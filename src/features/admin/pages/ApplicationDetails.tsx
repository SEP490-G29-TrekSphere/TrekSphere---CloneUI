import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, Copy, ExternalLink, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import * as z from 'zod';
import { PATHS } from '@/constants';
import { AppButton, AppCard } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

interface ApplicationDetail {
  id: string;
  partnerId: string;
  companyName: string;
  fullName: string;
  representative: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  bankName: string;
  accountNumber: string;
  accountOwner: string;
  branch: string;
  licenseImage: string;
  submitDateTime: string;
  status: 'pending' | 'approved' | 'rejected';
}

const rejectSchema = z.object({
  reason: z.string().min(1, 'Vui lòng nhập lý do từ chối.').trim(),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

const mockDetails: Record<string, ApplicationDetail> = {
  '1': {
    id: '1',
    partnerId: 'TS-VN-2023-0892',
    companyName: 'Hội An Heritage Tours',
    fullName: 'Công ty TNHH MTV Du lịch Di sản Hội An',
    representative: 'Nguyễn Văn An',
    email: 'contact@hoianheritage.vn',
    phone: '+84 235 3912 345',
    address: '123 Trần Phú, Phường Minh An, TP. Hội An, Tỉnh Quảng Nam, Việt Nam',
    bio: 'Hội An Heritage Tours là đơn vị lữ hành chuyên nghiệp với hơn 10 năm kinh nghiệm tổ chức các tour tham quan văn hóa, lịch sử và sinh thái tại khu vực Miền Trung Việt Nam. Chúng tôi cam kết mang đến những trải nghiệm chân thực nhất về đời sống và di sản văn hóa địa phương, với đội ngũ hướng dẫn viên giàu tâm huyết và am hiểu sâu sắc về lịch sử vùng đất Di sản Thế giới.',
    bankName: 'Vietcombank (VCB)',
    accountNumber: '0123 4567 8901',
    accountOwner: 'CONG TY TNHH MTV DU LICH DI SAN HOI AN',
    branch: 'Chi nhánh Quảng Nam',
    licenseImage: '/business_license_mockup.png',
    submitDateTime: '24/10/2023 14:30:12',
    status: 'pending',
  },
  '2': {
    id: '2',
    partnerId: 'TS-VN-2023-0104',
    companyName: 'Sapa Trekking Co.',
    fullName: 'Công ty Cổ phần Du lịch Sapa Trekking',
    representative: 'Trần Thị Bình',
    email: 'info@sapatrekking.com',
    phone: '+84 214 3871 999',
    address: '45 Mường Hoa, Thị xã Sa Pa, Tỉnh Lào Cai, Việt Nam',
    bio: 'Đơn vị đi đầu trong việc khai thác các tuyến đường trekking mạo hiểm và tìm hiểu văn hóa đồng bào thiểu số tại Sa Pa. Chúng tôi làm việc trực tiếp với người dân địa phương để đảm bảo phát triển du lịch bền vững và mang lại thu nhập trực tiếp cho bản làng.',
    bankName: 'BIDV',
    accountNumber: '9704 1800 2345 6789',
    accountOwner: 'CONG TY CP DU LICH SAPA TREKKING',
    branch: 'Chi nhánh Lào Cai',
    licenseImage: '/business_license_mockup.png',
    submitDateTime: '18/05/2024 09:15:00',
    status: 'approved',
  },
  '3': {
    id: '3',
    partnerId: 'TS-VN-2023-0498',
    companyName: 'Đà Lạt Adventures',
    fullName: 'Công ty TNHH Du lịch Trải nghiệm Đà Lạt',
    representative: 'Lê Hoàng Nam',
    email: 'hello@dalatadv.vn',
    phone: '+84 263 3555 777',
    address: '12 Phan Đình Phùng, Phường 2, TP. Đà Lạt, Tỉnh Lâm Đồng, Việt Nam',
    bio: 'Chuyên tổ chức các tour du lịch sinh thái, cắm trại rừng thông, chèo thuyền vượt thác và các hoạt động team building ngoài trời tại khu vực Tây Nguyên.',
    bankName: 'Techcombank',
    accountNumber: '1903 4567 8901 012',
    accountOwner: 'CONG TY TNHH DL TRAI NGHIEM DA LAT',
    branch: 'Chi nhánh Lâm Đồng',
    licenseImage: '/business_license_mockup.png',
    submitDateTime: '15/05/2024 10:20:45',
    status: 'rejected',
  },
  '4': {
    id: '4',
    partnerId: 'TS-VN-2023-0761',
    companyName: 'Mekong Travel Ltd.',
    fullName: 'Công ty TNHH Lữ hành Mekong Travel',
    representative: 'Phạm Minh Đức',
    email: 'booking@mekongtravel.vn',
    phone: '+84 292 3822 444',
    address: '88 Nguyễn Trãi, Quận Ninh Kiều, TP. Cần Thơ, Việt Nam',
    bio: 'Hành trình khám phá sông nước miền Tây Nam Bộ, tham quan chợ nổi, miệt vườn trái cây và tìm hiểu văn hóa dân gian Nam Bộ đặc sắc.',
    bankName: 'VietinBank',
    accountNumber: '1018 7654 3210',
    accountOwner: 'CONG TY TNHH LU HANH MEKONG TRAVEL',
    branch: 'Chi nhánh Cần Thơ',
    licenseImage: '/business_license_mockup.png',
    submitDateTime: '12/05/2024 16:45:30',
    status: 'approved',
  },
  '5': {
    id: '5',
    partnerId: 'TS-VN-2023-0901',
    companyName: 'Hanoi Culture Guides',
    fullName: 'Công ty TNHH Hướng dẫn Văn hóa Hà Nội',
    representative: 'Nguyễn Thùy Linh',
    email: 'hanoi@cultureguides.vn',
    phone: '+84 243 9991 111',
    address: '10 Hàng Bạc, Quận Hoàn Kiếm, TP. Hà Nội, Việt Nam',
    bio: 'Chuyên tổ chức các tour đi bộ tìm hiểu ẩm thực, lịch sử và nghệ thuật phố cổ Hà Nội.',
    bankName: 'Vietcombank',
    accountNumber: '0011 0045 6789',
    accountOwner: 'CONG TY TNHH HUONG DAN VAN HOA HA NOI',
    branch: 'Chi nhánh Hà Nội',
    licenseImage: '/business_license_mockup.png',
    submitDateTime: '10/05/2024 08:30:00',
    status: 'pending',
  },
  '6': {
    id: '6',
    partnerId: 'TS-VN-2023-0112',
    companyName: 'Ha Long Cruise Partners',
    fullName: 'Công ty Cổ phần Du thuyền Hạ Long',
    representative: 'Vũ Văn Hùng',
    email: 'partner@halongcruises.com',
    phone: '+84 203 3845 222',
    address: 'Tuần Châu, TP. Hạ Long, Tỉnh Quảng Ninh, Việt Nam',
    bio: 'Cung cấp trải nghiệm ngủ đêm trên du thuyền 5 sao tại vịnh Hạ Long và vịnh Lan Hạ.',
    bankName: 'BIDV',
    accountNumber: '4401 0001 2345 67',
    accountOwner: 'CONG TY CP DU THUYEN HA LONG',
    branch: 'Chi nhánh Quảng Ninh',
    licenseImage: '/business_license_mockup.png',
    submitDateTime: '08/05/2024 14:20:00',
    status: 'approved',
  },
  '7': {
    id: '7',
    partnerId: 'TS-VN-2023-0305',
    companyName: 'Ninh Binh Eco Journeys',
    fullName: 'Công ty TNHH Du lịch Sinh thái Ninh Bình',
    representative: 'Phạm Thanh Sơn',
    email: 'eco@ninhbinh.vn',
    phone: '+84 229 3888 333',
    address: 'Khu du lịch Tràng An, Tỉnh Ninh Bình, Việt Nam',
    bio: 'Các tour chèo thuyền khám phá hang động Tràng An, Tam Cốc và đạp xe ngắm cảnh đồng quê Ninh Bình.',
    bankName: 'Agribank',
    accountNumber: '3300 2051 23456',
    accountOwner: 'CONG TY TNHH DL SINH THAI NINH BINH',
    branch: 'Chi nhánh Ninh Bình',
    licenseImage: '/business_license_mockup.png',
    submitDateTime: '05/05/2024 11:10:00',
    status: 'rejected',
  },
  '8': {
    id: '8',
    partnerId: 'TS-VN-2023-0667',
    companyName: 'Hue Imperial Explorer',
    fullName: 'Công ty TNHH Khám phá Cố đô Huế',
    representative: 'Lê Nguyễn Nam Anh',
    email: 'hue@imperialexplorer.vn',
    phone: '+84 234 3822 555',
    address: '54 Lê Lợi, TP. Huế, Tỉnh Thừa Thiên Huế, Việt Nam',
    bio: 'Tour tham quan Đại Nội, các lăng tẩm triều Nguyễn và thưởng thức ca Huế trên sông Hương.',
    bankName: 'VietinBank',
    accountNumber: '1020 0004 5678 90',
    accountOwner: 'CONG TY TNHH KHAM PHA CO DO HUE',
    branch: 'Chi nhánh Thừa Thiên Huế',
    licenseImage: '/business_license_mockup.png',
    submitDateTime: '01/05/2024 15:50:00',
    status: 'approved',
  },
};

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();

  // Track the initial status at load time to verify E1 precondition.
  const [initialStatus, setInitialStatus] = useState<string>(() => {
    return id ? mockDetails[id]?.status || '' : '';
  });

  const [data, setData] = useState<ApplicationDetail | null>(() => {
    return id ? mockDetails[id] || null : null;
  });

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: '' },
  });

  if (!data) {
    return (
      <div className="space-y-6">
        <Link
          to={PATHS.ADMIN_APPLICATIONS}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#0B3025] font-bold text-base transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Quay lại danh sách
        </Link>
        <AppCard className="border-[#E5E4DE] shadow-sm rounded-2xl p-8 text-center bg-white">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Unable to load application documents
          </h2>
          <p className="text-zinc-500 text-sm">
            Không thể tải hồ sơ hoặc tài liệu đối tác. Vui lòng kiểm tra lại ID.
          </p>
        </AppCard>
      </div>
    );
  }

  const handleApprove = () => {
    // E1: Precondition Check
    if (initialStatus !== 'pending') {
      toast.error('This application has already been processed');
      setData(id ? mockDetails[id] || null : null);
      setShowApproveModal(false);
      return;
    }

    // Postconditions: Update status and role
    setData((prev) => (prev ? { ...prev, status: 'approved' } : null));
    setInitialStatus('approved');
    setShowApproveModal(false);
    toast.success(
      'Hồ sơ đối tác đã được phê duyệt thành công! Vai trò người dùng đã được nâng cấp lên Vendor Manager.'
    );

    // Simulated email notification without email address
    console.log(
      '[Email Sent] Subject: Đơn đăng ký của bạn đã được phê duyệt! | Role: Vendor Manager'
    );
  };

  const onRejectSubmit = (formData: RejectFormValues) => {
    // E1: Precondition Check
    if (initialStatus !== 'pending') {
      toast.error('This application has already been processed');
      setData(id ? mockDetails[id] || null : null);
      setShowRejectModal(false);
      return;
    }

    // Postconditions: Update status
    setData((prev) => (prev ? { ...prev, status: 'rejected' } : null));
    setInitialStatus('rejected');
    setShowRejectModal(false);
    toast.error(`Hồ sơ đối tác đã bị từ chối. Lý do: ${formData.reason}`);

    // Simulated email notification without email address
    console.log(
      `[Email Sent] Subject: Đơn đăng ký Vendor của bạn bị từ chối | Lý do: ${formData.reason}`
    );
    reset();
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard
      .writeText(data.accountNumber)
      .then(() => {
        toast.success('Đã sao chép số tài khoản ngân hàng.');
      })
      .catch(() => {
        toast.error('Không thể sao chép số tài khoản ngân hàng.');
      });
  };

  const getStatusDisplay = () => {
    switch (data.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse" />
            ĐANG CHỜ DUYỆT
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            ĐÃ DUYỆT
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            ĐÃ TỪ CHỐI
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button / Navigation Header */}
      <Link
        to={PATHS.ADMIN_APPLICATIONS}
        className="inline-flex items-center gap-2 text-zinc-800 hover:text-[#0B3025] font-extrabold text-lg transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Chi tiết Hồ sơ Đối tác
      </Link>

      {/* Top Banner Card with status and actions */}
      <AppCard className="border-[#E5E4DE] shadow-sm rounded-2xl bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-zinc-900">{data.companyName}</h2>
            {getStatusDisplay()}
          </div>
          {data.status === 'pending' && (
            <div className="flex items-center gap-3">
              <AppButton
                onClick={() => setShowRejectModal(true)}
                className="bg-[#BE123C] hover:bg-[#9F1239] text-white flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl border-none shadow-sm transition-colors"
              >
                <X className="h-4.5 w-4.5" />
                Từ chối
              </AppButton>
              <AppButton
                onClick={() => setShowApproveModal(true)}
                className="bg-[#0B3025] hover:bg-[#072019] text-white flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl border-none shadow-sm transition-colors"
              >
                <Check className="h-4.5 w-4.5" />
                Phê duyệt
              </AppButton>
            </div>
          )}
        </div>
      </AppCard>

      {/* Grid Layout of details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Columns - Company Details & bio */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Company Info */}
          <AppCard className="border-[#E5E4DE] shadow-sm rounded-3xl bg-white p-6 md:p-8">
            <div className="flex items-center gap-2 border-b border-[#F4F4F2] pb-4 mb-6">
              <span className="text-[#0B3025] font-bold text-lg">&#x1F4BC;</span>
              <h3 className="font-extrabold text-base text-zinc-800 tracking-tight">
                THÔNG TIN CÔNG TY
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  TÊN ĐẦY ĐỦ
                </span>
                <p className="font-bold text-sm text-zinc-800">{data.fullName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  NGƯỜI ĐẠI DIỆN
                </span>
                <p className="font-bold text-sm text-zinc-800">{data.representative}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  EMAIL DOANH NGHIỆP
                </span>
                <p className="font-bold text-sm text-zinc-800">{data.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  SỐ ĐIỆN THOẠI
                </span>
                <p className="font-bold text-sm text-zinc-800">{data.phone}</p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  ĐỊA CHỈ VĂN PHÒNG
                </span>
                <p className="font-bold text-sm text-zinc-800 leading-relaxed">{data.address}</p>
              </div>
            </div>
          </AppCard>

          {/* Card 2: Short Bio */}
          <AppCard className="border-[#E5E4DE] shadow-sm rounded-3xl bg-white p-6 md:p-8">
            <div className="flex items-center gap-2 border-b border-[#F4F4F2] pb-4 mb-4">
              <span className="text-[#0B3025] font-bold text-lg">&#x1F4DD;</span>
              <h3 className="font-extrabold text-base text-zinc-800 tracking-tight">
                GIỚI THIỆU NGẮN
              </h3>
            </div>
            <p className="text-zinc-600 text-sm font-semibold leading-relaxed">{data.bio}</p>
          </AppCard>
        </div>

        {/* Right Column - Bank Info & business license document */}
        <div className="space-y-6">
          {/* Card 1: Bank Info */}
          <div className="bg-[#0B3025] text-white rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-md">
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-[#144739] pb-4">
                <span className="text-white font-bold text-lg">&#x1F3E6;</span>
                <h3 className="font-extrabold text-base tracking-tight">THÔNG TIN NGÂN HÀNG</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#E8F1EE]/60 uppercase tracking-wider">
                    NGÂN HÀNG
                  </span>
                  <p className="font-extrabold text-base">{data.bankName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#E8F1EE]/60 uppercase tracking-wider">
                    SỐ TÀI KHOẢN
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-[#04241C] px-3.5 py-2.5 rounded-xl border border-[#144739]">
                    <span className="font-mono font-bold tracking-widest text-sm text-zinc-100">
                      {data.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccountNumber}
                      className="text-[#E8F1EE] hover:text-white p-1 hover:bg-[#144739] rounded transition-colors"
                      title="Sao chép số tài khoản"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#E8F1EE]/60 uppercase tracking-wider">
                    CHỦ TÀI KHOẢN
                  </span>
                  <p className="font-extrabold text-sm uppercase tracking-wide text-zinc-100">
                    {data.accountOwner}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#E8F1EE]/60 uppercase tracking-wider">
                    CHI NHÁNH
                  </span>
                  <p className="font-extrabold text-sm text-zinc-200">{data.branch}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Business License */}
          <AppCard className="border-[#E5E4DE] shadow-sm rounded-3xl bg-white p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-[#F4F4F2] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[#0B3025] font-bold text-lg">&#x1F4D6;</span>
                <h3 className="font-extrabold text-base text-zinc-800 tracking-tight">
                  GIẤY PHÉP KINH DOANH
                </h3>
              </div>
              <a
                href={data.licenseImage}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-[#0B3025] transition-colors p-1"
                title="Mở trong tab mới"
              >
                <ExternalLink className="h-4.5 w-4.5" />
              </a>
            </div>

            <div className="rounded-2xl border border-dashed border-zinc-200 overflow-hidden bg-[#FAF9F5] p-2 flex items-center justify-center">
              <img
                src={data.licenseImage}
                alt="Giấy phép kinh doanh"
                className="max-h-72 w-full object-contain rounded-xl shadow-sm hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </AppCard>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-[#E5E4DE] pt-4 text-xs text-zinc-400 font-semibold">
        <span>ID Đối tác: {data.partnerId}</span>
        <span>Ngày nộp hồ sơ: {data.submitDateTime}</span>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-[#E5E4DE] animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-6">
              <h3 className="text-lg font-extrabold text-[#0B3025] mb-2">
                Phê duyệt hồ sơ đối tác
              </h3>
              <p className="text-sm text-zinc-600 font-semibold leading-relaxed">
                Bạn có chắc chắn muốn phê duyệt hồ sơ đăng ký của{' '}
                <strong>{data.companyName}</strong>? Hành động này sẽ nâng cấp vai trò của người
                dùng thành <strong>Vendor Manager</strong> và gửi email thông báo kết quả.
              </p>
            </div>
            <div className="bg-[#FAF9F5] px-6 py-4 flex items-center justify-end gap-3 border-t border-[#E5E4DE]">
              <AppButton
                variant="outline"
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="border-[#E5E4DE] text-zinc-700 hover:bg-[#F4F4F2] font-bold px-4 py-2 rounded-xl"
              >
                Hủy
              </AppButton>
              <AppButton
                type="button"
                onClick={handleApprove}
                className="bg-[#0B3025] hover:bg-[#072019] text-white font-bold px-5 py-2 rounded-xl border-none shadow-sm"
              >
                Phê duyệt
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleSubmit(onRejectSubmit)}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-[#E5E4DE] animate-in fade-in-50 zoom-in-95 duration-150"
          >
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-extrabold text-red-700 mb-1">Từ chối hồ sơ đối tác</h3>
              <p className="text-sm text-zinc-600 font-semibold leading-relaxed">
                Vui lòng nhập lý do từ chối đơn đăng ký của <strong>{data.companyName}</strong>. Lý
                do này sẽ được gửi kèm trong email thông báo gửi cho đối tác:
              </p>
              <div className="space-y-1">
                <label htmlFor="reason" className="sr-only">
                  Lý do từ chối
                </label>
                <textarea
                  id="reason"
                  {...register('reason')}
                  placeholder="Nhập lý do từ chối tại đây..."
                  rows={4}
                  className="w-full p-3 text-sm rounded-xl border border-[#E5E4DE] focus:outline-none focus:ring-1 focus:ring-red-600 text-zinc-800 placeholder-zinc-400 font-medium bg-[#FAF9F5]"
                />
                {errors.reason && (
                  <p className="text-xs text-red-600 font-bold mt-1">{errors.reason.message}</p>
                )}
              </div>
            </div>
            <div className="bg-[#FAF9F5] px-6 py-4 flex items-center justify-end gap-3 border-t border-[#E5E4DE]">
              <AppButton
                variant="outline"
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  reset();
                }}
                className="border-[#E5E4DE] text-zinc-700 hover:bg-[#F4F4F2] font-bold px-4 py-2 rounded-xl"
              >
                Hủy
              </AppButton>
              <AppButton
                type="submit"
                className="bg-[#BE123C] hover:bg-[#9F1239] text-white font-bold px-5 py-2 rounded-xl border-none shadow-sm"
              >
                Từ chối
              </AppButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
