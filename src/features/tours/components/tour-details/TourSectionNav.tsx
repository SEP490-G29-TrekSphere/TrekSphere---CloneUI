import {
  SECTION_SCROLL_OFFSET,
  type TourSection,
} from '@/features/tours/components/tour-details/shared';
import { useSectionSpy } from '@/features/tours/hooks/useSectionSpy';
import { cn } from '@/lib/utils';

interface TourSectionNavProps {
  sections: TourSection[];
}

/**
 * Thanh điều hướng dính theo section của trang chi tiết tour.
 *
 * Dính ở `top-16` — ngay dưới `PublicHeader` (fixed, cao 64px) — nên hai thanh
 * xếp chồng chứ không đè lên nhau.
 */
export function TourSectionNav({ sections }: TourSectionNavProps) {
  const activeId = useSectionSpy(
    sections.map((section) => section.id),
    SECTION_SCROLL_OFFSET
  );

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    // Tự cuộn thay vì để trình duyệt nhảy anchor, vì cần trừ hao chiều cao của
    // header + chính thanh nav này.
    event.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_OFFSET + 16,
      behavior: 'smooth',
    });
  }

  return (
    <nav
      aria-label="Điều hướng nội dung tour"
      className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur-md"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <ul className="-mb-px flex gap-1 overflow-x-auto">
          {sections.map((section) => {
            const isActive = activeId === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) => handleClick(event, section.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'inline-block whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
