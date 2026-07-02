import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { TourTabId } from '../../types';

interface TabItem {
  id: TourTabId;
  label: string;
  count?: number;
}

interface TourTabsProps {
  activeTab: TourTabId;
  onTabChange: (tab: TourTabId) => void;
  reviewCount?: number;
  className?: string;
}

/**
 * Tab navigation for tour detail sections
 * Supports three main tabs: Details, Itinerary, Reviews
 */
export function TourTabs({ activeTab, onTabChange, reviewCount, className }: TourTabsProps) {
  const tabs = useMemo<TabItem[]>(
    () => [
      { id: 'details', label: 'Chi tiết' },
      { id: 'itinerary', label: 'Lịch trình' },
      { id: 'reviews', label: 'Đánh giá', count: reviewCount },
    ],
    [reviewCount]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      let newIndex: number | null = null;

      if (event.key === 'ArrowLeft') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else if (event.key === 'ArrowRight') {
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      } else if (event.key === 'Home') {
        newIndex = 0;
      } else if (event.key === 'End') {
        newIndex = tabs.length - 1;
      }

      if (newIndex !== null) {
        event.preventDefault();
        onTabChange(tabs[newIndex].id);
      }
    },
    [onTabChange, tabs]
  );

  return (
    <nav className={cn('border-b border-border', className)} aria-label="Điều hướng chi tiết tour">
      <div className="flex gap-1">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.count.toLocaleString('vi-VN')}
              </span>
            )}
            {/* Active indicator line */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default TourTabs;
