import { AlertTriangle, ArrowLeft, CheckCircle2, EyeOff, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PATHS } from '@/constants';

export type DecisionOption = 'hide_content' | 'warn_user' | 'suspend_user' | 'dismiss_report';

export interface ReportDetailData {
  id: string;
  code: string;
  status: 'pending' | 'resolved';
  severity: 'Thấp' | 'Trung bình' | 'Cao';
  reporter: {
    name: string;
    username: string;
    joinedYear: string;
    avatarUrl?: string;
    reportedAt: string;
  };
  target: {
    id: string;
    type: 'BLOG' | 'COMMENT' | 'REVIEW';
    title: string;
    content: string;
    tags: string[];
    images?: string[];
  };
  userStats: {
    totalReports: number;
    accuracyRate: string;
  };
}

const mockReportDetails: Record<string, ReportDetailData> = {};

// Fallback template for any unknown ID
const getReportById = (id?: string): ReportDetailData => {
  if (id && mockReportDetails[id]) {
    return mockReportDetails[id];
  }
  return {
    id: id || '2',
    code: `REP-${id || '20483'}`,
    status: 'pending',
    severity: 'Cao',
    reporter: {
      name: 'Nguyễn Văn A',
      username: '@vanna_95',
      joinedYear: '2021',
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      reportedAt: '14:30, 24/10/2023',
    },
    target: {
      id: 'BLOG-9921',
      type: 'BLOG',
      title: 'Review Chuyến đi Hà Giang: Sự thật không như mơ',
      content: `Hôm nay mình xin phép được bóc phốt một nhà xe tại Hà Giang... [Phần nội dung bị báo cáo: chứa ngôn từ xúc phạm và thông tin cá nhân chưa kiểm chứng].

Hành trình bắt đầu từ 8h tối nhưng thực tế là 10h mới có xe. Nhân viên nhà xe có thái độ rất lồi lõm, đặc biệt là ông tài xế tên T. [Số điện thoại 090xxx] liên tục dùng những lời lẽ khiếm nhã đối với khách nữ trên xe.

Mình khuyên mọi người nên tránh xa cái chỗ này ra nếu không muốn bị lừa đảo và nhục mạ như mình. Thật sự quá thất vọng với cách làm việc của họ. Đừng để những tấm ảnh lung linh trên mạng đánh lừa nhé các bạn...`,
      tags: ['Ngôn từ gây hấn', 'Lộ thông tin cá nhân', 'Phản ánh tiêu cực'],
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1509744645300-a2098b11871a?auto=format&fit=crop&q=80&w=300',
      ],
    },
    userStats: {
      totalReports: 12,
      accuracyRate: '92%',
    },
  };
};

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const reportData = getReportById(id);

  const [selectedDecision, setSelectedDecision] = useState<DecisionOption | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(reportData.status === 'resolved');
  const [currentStatus, setCurrentStatus] = useState(reportData.status);

  const handleSubmitDecision = () => {
    if (!selectedDecision) return;
    setIsSubmitted(true);
    setCurrentStatus('resolved');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <Link to={PATHS.ADMIN_REPORTS} className="hover:text-zinc-900 transition-colors">
            Báo cáo
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Xử lý Báo cáo</span>
        </div>

        <Link
          to={PATHS.ADMIN_REPORTS}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors bg-[#FAF9F5] border border-[#E5E4DE] px-3.5 py-1.5 rounded-full"
        >
          <ArrowLeft className="size-3.5" />
          Quay lại danh sách
        </Link>
      </div>

      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B3025]">
            Xử lý Báo cáo #{reportData.code}
          </h1>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3.5 py-1 rounded-full text-xs font-bold ${
              currentStatus === 'pending'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            Trạng thái: {currentStatus === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
          </span>
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            Mức độ: {reportData.severity}
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Content & Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Card */}
          <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Reporter Header */}
            <div className="flex items-center justify-between pb-6 border-b border-[#E5E4DE]">
              <div className="flex items-center gap-3.5">
                <img
                  src={reportData.reporter.avatarUrl}
                  alt={reportData.reporter.name}
                  className="size-11 rounded-full object-cover border border-[#E5E4DE]"
                />
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900">
                    {reportData.reporter.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Tài khoản: {reportData.reporter.username} • Thành viên từ{' '}
                    {reportData.reporter.joinedYear}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">
                  Thời gian báo cáo
                </span>
                <span className="text-xs font-bold text-zinc-800">
                  {reportData.reporter.reportedAt}
                </span>
              </div>
            </div>

            {/* Target Content Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold tracking-wider text-zinc-500 uppercase">
                NỘI DUNG BỊ BÁO CÁO ({reportData.target.type})
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#EAE8E2] text-zinc-700 font-mono">
                ID: {reportData.target.id}
              </span>
            </div>

            {/* Target Content Body Box */}
            <div className="bg-[#EAE8E2]/60 border border-[#DCD9CF] rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 leading-snug">
                {reportData.target.title}
              </h2>
              <div className="text-sm text-zinc-700 leading-relaxed font-medium whitespace-pre-line">
                {reportData.target.content}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {reportData.target.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#EAE8E2] text-zinc-700 border border-[#D5D4CE]"
                >
                  <span className="size-1.5 rounded-full bg-zinc-500" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Attached Evidence Images */}
          {reportData.target.images && reportData.target.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {reportData.target.images.slice(0, 2).map((img, idx) => (
                <div
                  key={img}
                  className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#E5E4DE] bg-white shadow-sm"
                >
                  <img
                    src={img}
                    alt={`Evidence ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
              {reportData.target.images.length >= 3 && (
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#E5E4DE] bg-black/40 relative flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  <img
                    src={reportData.target.images[2]}
                    alt="Evidence 3"
                    className="w-full h-full object-cover absolute inset-0 -z-10 opacity-60"
                  />
                  <span>+{reportData.target.images.length - 2} Ảnh</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Executive Decision Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <h3 className="font-extrabold text-xs tracking-wider uppercase text-zinc-800">
              QUYẾT ĐỊNH ĐIỀU HÀNH
            </h3>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-6 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Báo cáo đã được xử lý!</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Hệ thống đã ghi nhận quyết định của quản trị viên và áp dụng lên nội dung/tài
                    khoản vi phạm.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-bold text-emerald-800 hover:underline pt-2 inline-block"
                >
                  Chỉnh sửa quyết định
                </button>
              </div>
            ) : (
              <>
                {/* Executive Options */}
                <div className="space-y-3">
                  {/* Option 1: Hide Content */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedDecision === 'hide_content'
                        ? 'bg-white border-[#0B3025] shadow-md ring-1 ring-[#0B3025]'
                        : 'bg-white/60 border-[#E5E4DE] hover:border-zinc-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="hide_content"
                      checked={selectedDecision === 'hide_content'}
                      onChange={() => setSelectedDecision('hide_content')}
                      className="mt-1 accent-[#0B3025]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900">Ẩn nội dung</span>
                        <EyeOff className="size-4 text-zinc-600" />
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium leading-normal mt-0.5">
                        Nội dung sẽ không còn hiển thị với công chúng.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Warn User */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedDecision === 'warn_user'
                        ? 'bg-white border-[#0B3025] shadow-md ring-1 ring-[#0B3025]'
                        : 'bg-white/60 border-[#E5E4DE] hover:border-zinc-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="warn_user"
                      checked={selectedDecision === 'warn_user'}
                      onChange={() => setSelectedDecision('warn_user')}
                      className="mt-1 accent-[#0B3025]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900">
                          Gửi cảnh báo người dùng
                        </span>
                        <AlertTriangle className="size-4 text-amber-600" />
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium leading-normal mt-0.5">
                        Thông báo vi phạm sẽ được gửi tới email/inbox.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Suspend User */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedDecision === 'suspend_user'
                        ? 'bg-white border-[#0B3025] shadow-md ring-1 ring-[#0B3025]'
                        : 'bg-white/60 border-[#E5E4DE] hover:border-zinc-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="suspend_user"
                      checked={selectedDecision === 'suspend_user'}
                      onChange={() => setSelectedDecision('suspend_user')}
                      className="mt-1 accent-[#0B3025]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900">
                          Khóa tài khoản tạm thời
                        </span>
                        <UserX className="size-4 text-red-600" />
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium leading-normal mt-0.5">
                        Đình chỉ quyền truy cập trong 7 ngày.
                      </p>
                    </div>
                  </label>

                  {/* Option 4: Dismiss Report */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedDecision === 'dismiss_report'
                        ? 'bg-white border-[#0B3025] shadow-md ring-1 ring-[#0B3025]'
                        : 'bg-white/60 border-[#E5E4DE] hover:border-zinc-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="dismiss_report"
                      checked={selectedDecision === 'dismiss_report'}
                      onChange={() => setSelectedDecision('dismiss_report')}
                      className="mt-1 accent-[#0B3025]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900">Bác bỏ báo cáo</span>
                        <XCircle className="size-4 text-zinc-500" />
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium leading-normal mt-0.5">
                        Đánh dấu báo cáo là không hợp lệ.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Note Field */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-800">Ghi chú điều hành</span>
                    <span className="text-[11px] text-zinc-400">Bắt buộc nếu xử lý kỷ luật</span>
                  </div>
                  <textarea
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập lý do chi tiết cho quyết định này..."
                    className="w-full p-4 rounded-2xl bg-[#EAE8E2]/60 border border-[#DCD9CF] focus:outline-none focus:ring-1 focus:ring-[#0B3025] text-xs text-zinc-800 placeholder-zinc-400 resize-none font-medium"
                  />
                </div>

                {/* Action Submit Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!selectedDecision}
                    onClick={handleSubmitDecision}
                    className={`w-full py-3.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                      selectedDecision
                        ? 'bg-[#0B3025] text-white hover:bg-[#08241C]'
                        : 'bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Xác nhận xử lý
                    <CheckCircle2 className="size-4" />
                  </button>
                  <p className="text-[10px] text-center text-zinc-400 font-medium mt-2">
                    Hành động này không thể hoàn tác sau khi đã thực hiện.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* User Stats Widgets at bottom */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase block">
                BÁO CÁO CỦA USER NÀY
              </span>
              <span className="text-2xl font-black text-zinc-900 mt-1 block">
                {reportData.userStats.totalReports}
              </span>
            </div>

            <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase block">
                TỶ LỆ CHÍNH XÁC
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {reportData.userStats.accuracyRate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
