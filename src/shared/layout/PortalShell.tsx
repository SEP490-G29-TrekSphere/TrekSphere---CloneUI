import { Menu, X } from 'lucide-react';
import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PortalShellProps {
  /** Khối logo + phụ đề ở đầu sidebar — dùng chung cho desktop và drawer mobile. */
  brand: ReactNode;
  /** Danh sách điều hướng. */
  nav: ReactNode;
  /** Thẻ người dùng ở đáy sidebar. */
  userCard: ReactNode;
  /** Nhãn ngắn hiển thị trên topbar mobile (thường là tên portal). */
  mobileTitle: ReactNode;
  children: ReactNode;
  rootClassName?: string;
  rootStyle?: CSSProperties;
  sidebarClassName?: string;
  sidebarStyle?: CSSProperties;
  /** Trang tự quản lý scroll/padding riêng (vd trang chat) — bỏ padding mặc định. */
  fullBleed?: boolean;
}

/**
 * Khung dùng chung cho mọi portal có sidebar (Admin, Trekker, Vendor*, Coordinator).
 *
 * Trên `md` trở lên sidebar đứng yên trong luồng layout như trước. Dưới `md` nó
 * trở thành drawer trượt từ trái, mở bằng nút trên topbar mobile — trước đây
 * sidebar chỉ bị `hidden md:flex` nên người dùng mobile mất hoàn toàn điều hướng.
 */
export default function PortalShell({
  brand,
  nav,
  userCard,
  mobileTitle,
  children,
  rootClassName = '',
  rootStyle,
  sidebarClassName = '',
  sidebarStyle,
  fullBleed = false,
}: PortalShellProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Điều hướng xong thì đóng drawer, nếu không nó che mất trang vừa mở.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname chỉ dùng để trigger effect, không đọc giá trị trong body
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    // Khoá scroll nền khi drawer mở để tránh cuộn xuyên qua lớp phủ.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className={`flex h-dvh w-full overflow-hidden ${rootClassName}`} style={rootStyle}>
      {/* Lớp phủ chỉ tồn tại ở mobile khi drawer mở */}
      {open && (
        <button
          type="button"
          aria-label="Đóng menu điều hướng"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col justify-between overflow-y-auto transition-transform duration-300 ease-out md:static md:z-auto md:max-w-none md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarClassName}`}
        style={sidebarStyle}
      >
        <div className="flex flex-col py-6">
          <div className="mb-8 flex items-start justify-between gap-2 px-6">
            {brand}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="-mr-2 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-800 md:hidden"
              aria-label="Đóng menu điều hướng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {nav}
        </div>
        {userCard}
      </aside>

      {/* `min-w-0` chặn nội dung rộng (bảng, ảnh) kéo giãn cột flex vượt màn hình */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className="flex h-14 shrink-0 items-center gap-3 border-b border-black/10 bg-white/80 px-4 backdrop-blur md:hidden"
          style={sidebarStyle}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-ml-2 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-black/5 hover:text-zinc-900"
            aria-label="Mở menu điều hướng"
            aria-expanded={open}
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="truncate text-base font-bold text-[#06261D]">{mobileTitle}</span>
        </header>

        <main
          className={`flex-1 ${fullBleed ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 sm:p-6 md:p-8'}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
