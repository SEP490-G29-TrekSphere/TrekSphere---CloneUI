import { BookOpen, ChevronRight, Compass, Home, Mountain, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppBadge, AppButton, AppLogo } from '@/shared/ui';

/**
 * NotFoundPage — Full-page standalone 404 Error Screen.
 * Implements the exact original Hallmark (Anti-AI-Slop) color palette:
 * Dark Charcoal (#0b0f17) base, Slate-900 (#111827) card container, and subtle Emerald accents.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* 1. Hallmark Header Bar */}
      <header className="w-full border-b border-slate-800/80 bg-[#0b0f17]/95 backdrop-blur-xs sticky top-0 z-50">
        <div className="mx-auto max-w-[1400px] w-full h-16 sm:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <AppLogo height={36} tone="light" to={PATHS.HOME} />
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl w-full flex flex-col items-center text-center">
          {/* System Badge */}
          <AppBadge
            variant="outline"
            className="mb-5 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
          >
            Mã lỗi: 404_PAGE_NOT_FOUND
          </AppBadge>

          {/* Large Editorial 404 Display */}
          <h1 className="font-display font-extrabold text-7xl sm:text-9xl tracking-tight text-white leading-none select-none mb-3">
            404
          </h1>

          {/* Headline & Grounded Copy */}
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-100 tracking-tight mb-3">
            Không tìm thấy trang yêu cầu
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md leading-relaxed mb-8">
            Đường dẫn bạn truy cập không tồn tại, đã bị di chuyển hoặc địa chỉ nhập chưa chính xác.
            Vui lòng kiểm tra lại URL hoặc chọn lối đi bên dưới.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-10">
            <Link to={PATHS.HOME} className="w-full sm:w-auto">
              <AppButton
                size="lg"
                className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-950/40 border-0"
              >
                <Home className="w-4 h-4" />
                <span>Về trang chủ</span>
              </AppButton>
            </Link>
            <Link to={PATHS.TOURS} className="w-full sm:w-auto">
              <AppButton
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2 border-slate-700 hover:border-slate-600 text-slate-200 bg-slate-900/50 hover:bg-slate-800"
              >
                <Compass className="w-4 h-4" />
                <span>Khám phá Tour</span>
              </AppButton>
            </Link>
          </div>

          {/* Quick Directory Card — Hallmark Original Dark Slate Card */}
          <div className="w-full bg-[#111827]/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 text-left shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Lối đi nhanh
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to={PATHS.TOURS}
                className="group flex items-center justify-between p-3.5 bg-[#1f293d]/50 hover:bg-[#1f293d] border border-slate-800 hover:border-emerald-500/40 rounded-xl text-slate-200 hover:text-emerald-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Mountain className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-sm font-medium">Danh sách Tour</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to={PATHS.GROUPS}
                className="group flex items-center justify-between p-3.5 bg-[#1f293d]/50 hover:bg-[#1f293d] border border-slate-800 hover:border-emerald-500/40 rounded-xl text-slate-200 hover:text-emerald-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-sm font-medium">Ghép nhóm đồng hành</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to={PATHS.NEWS}
                className="group flex items-center justify-between p-3.5 bg-[#1f293d]/50 hover:bg-[#1f293d] border border-slate-800 hover:border-emerald-500/40 rounded-xl text-slate-200 hover:text-emerald-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-sm font-medium">Bài viết & Kinh nghiệm</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to={PATHS.LOGIN}
                className="group flex items-center justify-between p-3.5 bg-[#1f293d]/50 hover:bg-[#1f293d] border border-slate-800 hover:border-emerald-500/40 rounded-xl text-slate-200 hover:text-emerald-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-sm font-medium">Tài khoản & Đăng nhập</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Hallmark Minimal Footer Bar */}
      <footer className="w-full border-t border-slate-800/80 bg-[#080b11] py-4 sm:py-6">
        <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TrekSphere. Tất cả các quyền được bảo lưu.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Hệ thống TrekSphere hoạt động bình thường</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
