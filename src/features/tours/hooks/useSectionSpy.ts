import { useEffect, useState } from 'react';

/**
 * Scrollspy: trả về id của section đang nằm dưới mép trên của viewport.
 *
 * Dùng listener `scroll` thay vì `IntersectionObserver` vì các section ở trang chi
 * tiết tour có chiều cao rất lệch nhau — observer sẽ báo "đang xem" section ngắn
 * nằm lọt trong màn hình thay vì section dài mà người dùng thực sự đang đọc.
 *
 * @param ids   Danh sách id theo đúng thứ tự xuất hiện trong DOM.
 * @param offset Khoảng trừ hao cho header + thanh nav dính.
 */
export function useSectionSpy(ids: string[], offset = 140): string {
  // Ghép thành chuỗi để mảng mới mỗi lần render không làm effect chạy lại vô ích.
  const key = ids.join('|');
  const [activeId, setActiveId] = useState(ids[0] ?? '');

  useEffect(() => {
    const sectionIds = key ? key.split('|') : [];
    if (sectionIds.length === 0) return;

    function handleScroll() {
      // Chạm đáy trang thì section cuối luôn là section đang xem, kể cả khi nó quá
      // ngắn để tự đẩy mép trên của mình lên trên ngưỡng offset.
      const reachedBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      if (reachedBottom) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }

      let current = sectionIds[0];
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActiveId(current);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [key, offset]);

  return activeId;
}
