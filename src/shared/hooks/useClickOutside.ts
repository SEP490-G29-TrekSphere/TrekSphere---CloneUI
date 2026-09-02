import { useEffect, useRef } from 'react';

/**
 * Đóng modal/dropdown khi bấm ra ngoài phần tử được gắn ref — dùng chung cho mọi overlay
 * dạng `fixed inset-0 ... bg-black/60` trong app thay vì mỗi nơi tự viết `onClick` +
 * `stopPropagation`.
 *
 * Gắn ref trả về vào phần tử PANEL bên trong overlay (không phải overlay), `onOutsideClick`
 * chỉ được gọi khi click thật sự nằm ngoài panel đó.
 *
 * @example
 *   const panelRef = useClickOutside<HTMLDivElement>(() => setIsModalOpen(false));
 *   {isModalOpen && (
 *     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
 *       <div ref={panelRef} className="rounded-2xl bg-card p-6">...</div>
 *     </div>
 *   )}
 */
export function useClickOutside<T extends HTMLElement>(onOutsideClick: () => void, active = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    function handlePointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [active, onOutsideClick]);

  return ref;
}
